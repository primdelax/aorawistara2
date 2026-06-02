const { pool } = require("../config/database");
const { isSupabase } = require("../config/dataProvider");
const supabase = require("../services/supabaseService");
const { sendSuccess, sendCreated, sendPaginated, sendError, sendNotFound } = require("../utils/response");
const { generateSlug, getPagination, buildPaginationMeta } = require("../utils/helpers");
const { buildImageUrl, deleteFile } = require("../utils/upload");

/**
 * GET /api/articles
 */
const getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const { status, category_id, author_id, search } = req.query;

    if (isSupabase) {
      const filters = { category_id, author_id };
      if (!req.user || req.user.role !== "admin") filters.status = "published";
      else if (status) filters.status = status;

      const rows = await supabase.list("articles", {
        filters,
        search: search ? { term: search, fields: ["title", "excerpt"] } : undefined,
        order: "created_at.desc",
        limit,
        offset,
      });
      const data = rows.map((r) => ({
        ...r,
        cover_image_url: r.cover_image || null,
      }));
      return sendPaginated(res, "Data artikel berhasil diambil.", data, buildPaginationMeta(data.length, page, limit));
    }

    let whereClause = "WHERE 1=1";
    const params = [];

    // Non-admin hanya bisa lihat yang published
    if (!req.user || req.user.role !== "admin") {
      whereClause += " AND a.status = 'published'";
    } else if (status) {
      whereClause += " AND a.status = ?";
      params.push(status);
    }

    if (category_id) {
      whereClause += " AND a.category_id = ?";
      params.push(category_id);
    }
    if (author_id) {
      whereClause += " AND a.author_id = ?";
      params.push(author_id);
    }
    if (search) {
      whereClause += " AND (a.title LIKE ? OR a.excerpt LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM articles a ${whereClause}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT a.id, a.title, a.slug, a.excerpt, a.cover_image, a.status,
              a.views, a.published_at, a.created_at, a.updated_at,
              c.name as category_name, u.name as author_name
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN users u ON a.author_id = u.id
       ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const data = rows.map((r) => ({
      ...r,
      cover_image_url: r.cover_image ? buildImageUrl(req, r.cover_image) : null,
    }));

    return sendPaginated(res, "Data artikel berhasil diambil.", data, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/articles/:id
 */
const getOne = async (req, res, next) => {
  try {
    if (isSupabase) {
      const row = await supabase.findById("articles", req.params.id);
      if (!row) return sendNotFound(res, "Artikel tidak ditemukan.");
      await supabase.update("articles", req.params.id, { views: Number(row.views || 0) + 1 });
      return sendSuccess(res, "Detail artikel berhasil diambil.", { ...row, cover_image_url: row.cover_image || null });
    }

    const [rows] = await pool.query(
      `SELECT a.*, c.name as category_name, u.name as author_name
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN users u ON a.author_id = u.id
       WHERE a.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) return sendNotFound(res, "Artikel tidak ditemukan.");

    // Increment views
    await pool.query("UPDATE articles SET views = views + 1 WHERE id = ?", [req.params.id]);

    return sendSuccess(res, "Detail artikel berhasil diambil.", {
      ...rows[0],
      cover_image_url: rows[0].cover_image ? buildImageUrl(req, rows[0].cover_image) : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/articles/slug/:slug
 */
const getBySlug = async (req, res, next) => {
  try {
    if (isSupabase) {
      const row = await supabase.findOne("articles", { slug: req.params.slug });
      if (!row) return sendNotFound(res, "Artikel tidak ditemukan.");
      await supabase.update("articles", row.id, { views: Number(row.views || 0) + 1 });
      return sendSuccess(res, "Detail artikel berhasil diambil.", { ...row, cover_image_url: row.cover_image || null });
    }

    const [rows] = await pool.query(
      `SELECT a.*, c.name as category_name, u.name as author_name
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN users u ON a.author_id = u.id
       WHERE a.slug = ?`,
      [req.params.slug]
    );

    if (rows.length === 0) return sendNotFound(res, "Artikel tidak ditemukan.");

    await pool.query("UPDATE articles SET views = views + 1 WHERE id = ?", [rows[0].id]);

    return sendSuccess(res, "Detail artikel berhasil diambil.", {
      ...rows[0],
      cover_image_url: rows[0].cover_image ? buildImageUrl(req, rows[0].cover_image) : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/articles
 */
const create = async (req, res, next) => {
  try {
    const { title, content, excerpt, status, category_id } = req.body;
    const slug = generateSlug(title);

    let coverImage = null;
    if (req.file) {
      coverImage = isSupabase ? await supabase.uploadFile(req.file, "articles") : `uploads/articles/${req.file.filename}`;
    }

    const publishedAt = status === "published" ? new Date() : null;

    if (isSupabase) {
      const row = await supabase.insert("articles", {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        cover_image: coverImage,
        status: status || "draft",
        category_id: category_id || null,
        author_id: req.user.id,
        published_at: publishedAt,
      });
      return sendCreated(res, "Artikel berhasil dibuat.", { ...row, cover_image_url: row.cover_image || null });
    }

    const [result] = await pool.query(
      `INSERT INTO articles (title, slug, excerpt, content, cover_image, status, category_id, author_id, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, excerpt || null, content, coverImage, status || "draft",
       category_id || null, req.user.id, publishedAt]
    );

    const [rows] = await pool.query("SELECT * FROM articles WHERE id = ?", [result.insertId]);

    return sendCreated(res, "Artikel berhasil dibuat.", {
      ...rows[0],
      cover_image_url: rows[0].cover_image ? buildImageUrl(req, rows[0].cover_image) : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/articles/:id
 */
const update = async (req, res, next) => {
  try {
    if (isSupabase) {
      const existing = await supabase.findById("articles", req.params.id);
      if (!existing) return sendNotFound(res, "Artikel tidak ditemukan.");

      const { title, content, excerpt, status, category_id } = req.body;
      const updates = {};
      if (title) { updates.title = title; updates.slug = generateSlug(title); }
      if (content !== undefined) updates.content = content;
      if (excerpt !== undefined) updates.excerpt = excerpt;
      if (category_id !== undefined) updates.category_id = category_id || null;
      if (status) {
        updates.status = status;
        if (status === "published" && existing.status === "draft") updates.published_at = new Date();
      }
      if (req.file) {
        await supabase.deleteFile(existing.cover_image);
        updates.cover_image = await supabase.uploadFile(req.file, "articles");
      }
      if (Object.keys(updates).length === 0) return sendError(res, "Tidak ada data yang diubah.", 400);
      const row = await supabase.update("articles", req.params.id, updates);
      return sendSuccess(res, "Artikel berhasil diperbarui.", { ...row, cover_image_url: row.cover_image || null });
    }

    const [existing] = await pool.query("SELECT * FROM articles WHERE id = ?", [req.params.id]);
    if (existing.length === 0) return sendNotFound(res, "Artikel tidak ditemukan.");

    const { title, content, excerpt, status, category_id } = req.body;
    const updates = {};

    if (title) { updates.title = title; updates.slug = generateSlug(title); }
    if (content !== undefined) updates.content = content;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (category_id !== undefined) updates.category_id = category_id || null;
    if (status) {
      updates.status = status;
      if (status === "published" && existing[0].status === "draft") {
        updates.published_at = new Date();
      }
    }

    if (req.file) {
      if (existing[0].cover_image) deleteFile(existing[0].cover_image);
      updates.cover_image = `uploads/articles/${req.file.filename}`;
    }

    if (Object.keys(updates).length === 0) {
      return sendError(res, "Tidak ada data yang diubah.", 400);
    }

    const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(", ");
    await pool.query(`UPDATE articles SET ${setClauses} WHERE id = ?`, [...Object.values(updates), req.params.id]);

    const [rows] = await pool.query("SELECT * FROM articles WHERE id = ?", [req.params.id]);

    return sendSuccess(res, "Artikel berhasil diperbarui.", {
      ...rows[0],
      cover_image_url: rows[0].cover_image ? buildImageUrl(req, rows[0].cover_image) : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/articles/:id
 */
const remove = async (req, res, next) => {
  try {
    if (isSupabase) {
      const existing = await supabase.findById("articles", req.params.id);
      if (!existing) return sendNotFound(res, "Artikel tidak ditemukan.");
      await supabase.deleteFile(existing.cover_image);
      await supabase.remove("articles", req.params.id);
      return sendSuccess(res, "Artikel berhasil dihapus.");
    }

    const [existing] = await pool.query("SELECT * FROM articles WHERE id = ?", [req.params.id]);
    if (existing.length === 0) return sendNotFound(res, "Artikel tidak ditemukan.");

    if (existing[0].cover_image) deleteFile(existing[0].cover_image);
    await pool.query("DELETE FROM articles WHERE id = ?", [req.params.id]);

    return sendSuccess(res, "Artikel berhasil dihapus.");
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getOne, getBySlug, create, update, remove };
