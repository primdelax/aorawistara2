const { pool } = require("../config/database");
const { sendSuccess, sendCreated, sendPaginated, sendError, sendNotFound } = require("../utils/response");
const { generateSlug, getPagination, buildPaginationMeta } = require("../utils/helpers");
const { buildImageUrl, deleteFile } = require("../utils/upload");

/**
 * GET /api/programs
 */
const getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const { status, category_id, search } = req.query;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (status) {
      whereClause += " AND p.status = ?";
      params.push(status);
    }
    if (category_id) {
      whereClause += " AND p.category_id = ?";
      params.push(category_id);
    }
    if (search) {
      whereClause += " AND (p.title LIKE ? OR p.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM programs p ${whereClause}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, u.name as created_by_name
       FROM programs p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.created_by = u.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Build image URLs
    const data = rows.map((r) => ({
      ...r,
      image_url: r.image ? buildImageUrl(req, r.image) : null,
    }));

    return sendPaginated(res, "Data program berhasil diambil.", data, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/programs/:id
 */
const getOne = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, u.name as created_by_name
       FROM programs p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) return sendNotFound(res, "Program tidak ditemukan.");

    return sendSuccess(res, "Detail program berhasil diambil.", {
      ...rows[0],
      image_url: rows[0].image ? buildImageUrl(req, rows[0].image) : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/programs/slug/:slug
 */
const getBySlug = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, u.name as created_by_name
       FROM programs p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.slug = ?`,
      [req.params.slug]
    );

    if (rows.length === 0) return sendNotFound(res, "Program tidak ditemukan.");

    return sendSuccess(res, "Detail program berhasil diambil.", {
      ...rows[0],
      image_url: rows[0].image ? buildImageUrl(req, rows[0].image) : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/programs
 */
const create = async (req, res, next) => {
  try {
    const { title, description, duration, price, status, category_id } = req.body;
    const slug = generateSlug(title);

    let imagePath = null;
    if (req.file) {
      imagePath = `uploads/programs/${req.file.filename}`;
    }

    const [result] = await pool.query(
      `INSERT INTO programs (title, slug, description, duration, price, image, status, category_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, description, duration || null, price || 0, imagePath, status || "aktif",
       category_id || null, req.user.id]
    );

    const [rows] = await pool.query("SELECT * FROM programs WHERE id = ?", [result.insertId]);

    return sendCreated(res, "Program berhasil dibuat.", {
      ...rows[0],
      image_url: rows[0].image ? buildImageUrl(req, rows[0].image) : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/programs/:id
 */
const update = async (req, res, next) => {
  try {
    const [existing] = await pool.query("SELECT * FROM programs WHERE id = ?", [req.params.id]);
    if (existing.length === 0) return sendNotFound(res, "Program tidak ditemukan.");

    const { title, description, duration, price, status, category_id } = req.body;
    const updates = {};

    if (title) { updates.title = title; updates.slug = generateSlug(title); }
    if (description !== undefined) updates.description = description;
    if (duration !== undefined) updates.duration = duration;
    if (price !== undefined) updates.price = price;
    if (status) updates.status = status;
    if (category_id !== undefined) updates.category_id = category_id || null;

    if (req.file) {
      if (existing[0].image) deleteFile(existing[0].image);
      updates.image = `uploads/programs/${req.file.filename}`;
    }

    if (Object.keys(updates).length === 0) {
      return sendError(res, "Tidak ada data yang diubah.", 400);
    }

    const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(", ");
    const values = [...Object.values(updates), req.params.id];

    await pool.query(`UPDATE programs SET ${setClauses} WHERE id = ?`, values);

    const [rows] = await pool.query("SELECT * FROM programs WHERE id = ?", [req.params.id]);

    return sendSuccess(res, "Program berhasil diperbarui.", {
      ...rows[0],
      image_url: rows[0].image ? buildImageUrl(req, rows[0].image) : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/programs/:id
 */
const remove = async (req, res, next) => {
  try {
    const [existing] = await pool.query("SELECT * FROM programs WHERE id = ?", [req.params.id]);
    if (existing.length === 0) return sendNotFound(res, "Program tidak ditemukan.");

    if (existing[0].image) deleteFile(existing[0].image);

    await pool.query("DELETE FROM programs WHERE id = ?", [req.params.id]);

    return sendSuccess(res, "Program berhasil dihapus.");
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getOne, getBySlug, create, update, remove };
