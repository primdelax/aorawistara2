const { pool } = require("../config/database");
const { isSupabase } = require("../config/dataProvider");
const supabase = require("../services/supabaseService");
const { sendSuccess, sendCreated, sendPaginated, sendError, sendNotFound } = require("../utils/response");
const { getPagination, buildPaginationMeta } = require("../utils/helpers");
const { buildImageUrl, deleteFile } = require("../utils/upload");

const attachProgramTitlesOnline = async (rows) => {
  if (rows.length === 0) return rows;
  const programs = await supabase.list("programs", { select: "id,title" });
  const byId = programs.reduce((acc, program) => {
    acc[program.id] = program.title;
    return acc;
  }, {});
  return rows.map((row) => ({
    ...row,
    program_title: row.program_id ? byId[row.program_id] || null : null,
  }));
};

const getProgramTitle = async (programId) => {
  if (!programId) return null;
  if (isSupabase) {
    const program = await supabase.findById("programs", programId, "id,title");
    return program?.title || null;
  }
  const [rows] = await pool.query("SELECT title FROM programs WHERE id = ?", [programId]);
  return rows[0]?.title || null;
};

/**
 * GET /api/galleries
 */
const getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const { program_id, category, search } = req.query;

    if (isSupabase) {
      const rows = await supabase.list("galleries", {
        filters: { program_id, category },
        search: search ? { term: search, fields: ["title", "caption"] } : undefined,
        order: "created_at.desc",
        limit,
        offset,
      });
      const withPrograms = await attachProgramTitlesOnline(rows);
      const data = withPrograms.map((r) => ({ ...r, image_url: r.image_url || r.image_path }));
      return sendPaginated(res, "Data galeri berhasil diambil.", data, buildPaginationMeta(data.length, page, limit));
    }

    let whereClause = "WHERE 1=1";
    const params = [];

    if (program_id) {
      whereClause += " AND g.program_id = ?";
      params.push(program_id);
    }
    if (category) {
      whereClause += " AND g.category = ?";
      params.push(category);
    }
    if (search) {
      whereClause += " AND (g.title LIKE ? OR g.caption LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM galleries g ${whereClause}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT g.*, p.title as program_title, u.name as uploaded_by_name
       FROM galleries g
       LEFT JOIN programs p ON g.program_id = p.id
       LEFT JOIN users u ON g.uploaded_by = u.id
       ${whereClause}
       ORDER BY g.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const data = rows.map((r) => ({
      ...r,
      image_url: buildImageUrl(req, r.image_path),
    }));

    return sendPaginated(res, "Data galeri berhasil diambil.", data, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/galleries/:id
 */
const getOne = async (req, res, next) => {
  try {
    if (isSupabase) {
      const row = await supabase.findById("galleries", req.params.id);
      if (!row) return sendNotFound(res, "Foto galeri tidak ditemukan.");
      const [withProgram] = await attachProgramTitlesOnline([row]);
      return sendSuccess(res, "Detail galeri berhasil diambil.", { ...withProgram, image_url: withProgram.image_url || withProgram.image_path });
    }

    const [rows] = await pool.query(
      `SELECT g.*, p.title as program_title, u.name as uploaded_by_name
       FROM galleries g
       LEFT JOIN programs p ON g.program_id = p.id
       LEFT JOIN users u ON g.uploaded_by = u.id
       WHERE g.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) return sendNotFound(res, "Foto galeri tidak ditemukan.");

    return sendSuccess(res, "Detail galeri berhasil diambil.", {
      ...rows[0],
      image_url: buildImageUrl(req, rows[0].image_path),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/galleries
 * Requires multipart/form-data dengan field "image"
 */
const create = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, "File gambar wajib diupload.", 400);
    }

    const { title, caption, category, program_id } = req.body;
    const programTitle = await getProgramTitle(program_id);
    const finalCategory = programTitle || category || null;
    const imagePath = isSupabase ? await supabase.uploadFile(req.file, "gallery") : `uploads/gallery/${req.file.filename}`;
    const imageUrl = isSupabase ? imagePath : buildImageUrl(req, imagePath);

    if (isSupabase) {
      const row = await supabase.insert("galleries", {
        title,
        image_path: imagePath,
        image_url: imageUrl,
        caption: caption || null,
        category: finalCategory,
        program_id: program_id || null,
        uploaded_by: req.user.id,
      });
      return sendCreated(res, "Foto galeri berhasil diupload.", { ...row, program_title: programTitle, image_url: row.image_url || row.image_path });
    }

    const [result] = await pool.query(
      `INSERT INTO galleries (title, image_path, image_url, caption, category, program_id, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, imagePath, imageUrl, caption || null, finalCategory,
       program_id || null, req.user.id]
    );

    const [rows] = await pool.query("SELECT * FROM galleries WHERE id = ?", [result.insertId]);

    return sendCreated(res, "Foto galeri berhasil diupload.", {
      ...rows[0],
      image_url: buildImageUrl(req, rows[0].image_path),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/galleries/:id
 */
const update = async (req, res, next) => {
  try {
    if (isSupabase) {
      const existing = await supabase.findById("galleries", req.params.id);
      if (!existing) return sendNotFound(res, "Foto galeri tidak ditemukan.");

      const { title, caption, category, program_id } = req.body;
      const programTitle = program_id !== undefined ? await getProgramTitle(program_id) : null;
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (caption !== undefined) updates.caption = caption;
      if (category !== undefined) updates.category = category || null;
      if (program_id !== undefined) {
        updates.program_id = program_id || null;
        updates.category = programTitle || category || null;
      }
      if (req.file) {
        await supabase.deleteFile(existing.image_path);
        updates.image_path = await supabase.uploadFile(req.file, "gallery");
        updates.image_url = updates.image_path;
      }
      if (Object.keys(updates).length === 0) return sendError(res, "Tidak ada data yang diubah.", 400);
      const row = await supabase.update("galleries", req.params.id, updates);
      return sendSuccess(res, "Galeri berhasil diperbarui.", { ...row, program_title: programTitle, image_url: row.image_url || row.image_path });
    }

    const [existing] = await pool.query("SELECT * FROM galleries WHERE id = ?", [req.params.id]);
    if (existing.length === 0) return sendNotFound(res, "Foto galeri tidak ditemukan.");

    const { title, caption, category, program_id } = req.body;
    const programTitle = program_id !== undefined ? await getProgramTitle(program_id) : null;
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (caption !== undefined) updates.caption = caption;
    if (category !== undefined) updates.category = category || null;
    if (program_id !== undefined) {
      updates.program_id = program_id || null;
      updates.category = programTitle || category || null;
    }

    if (req.file) {
      deleteFile(existing[0].image_path);
      updates.image_path = `uploads/gallery/${req.file.filename}`;
      updates.image_url = buildImageUrl(req, updates.image_path);
    }

    if (Object.keys(updates).length === 0) {
      return sendError(res, "Tidak ada data yang diubah.", 400);
    }

    const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(", ");
    await pool.query(`UPDATE galleries SET ${setClauses} WHERE id = ?`, [...Object.values(updates), req.params.id]);

    const [rows] = await pool.query("SELECT * FROM galleries WHERE id = ?", [req.params.id]);

    return sendSuccess(res, "Galeri berhasil diperbarui.", {
      ...rows[0],
      image_url: buildImageUrl(req, rows[0].image_path),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/galleries/:id
 */
const remove = async (req, res, next) => {
  try {
    if (isSupabase) {
      const existing = await supabase.findById("galleries", req.params.id);
      if (!existing) return sendNotFound(res, "Foto galeri tidak ditemukan.");
      await supabase.deleteFile(existing.image_path);
      await supabase.remove("galleries", req.params.id);
      return sendSuccess(res, "Foto galeri berhasil dihapus.");
    }

    const [existing] = await pool.query("SELECT * FROM galleries WHERE id = ?", [req.params.id]);
    if (existing.length === 0) return sendNotFound(res, "Foto galeri tidak ditemukan.");

    deleteFile(existing[0].image_path);
    await pool.query("DELETE FROM galleries WHERE id = ?", [req.params.id]);

    return sendSuccess(res, "Foto galeri berhasil dihapus.");
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getOne, create, update, remove };
