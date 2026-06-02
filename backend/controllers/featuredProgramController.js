const { pool } = require("../config/database");
const { isSupabase } = require("../config/dataProvider");
const supabase = require("../services/supabaseService");
const { sendSuccess, sendCreated, sendError, sendNotFound } = require("../utils/response");
const { buildImageUrl, deleteFile } = require("../utils/upload");

const getImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("/")) {
    return imagePath;
  }
  return buildImageUrl(req, imagePath);
};

const deleteManagedImage = (imagePath) => {
  if (imagePath && imagePath.startsWith("uploads/")) deleteFile(imagePath);
};

const toBool = (value) => value === true || value === "true" || value === "1" || value === 1;

const mapFeatured = (req, row) => ({
  ...row,
  accent: Boolean(row.accent),
  image_url: getImageUrl(req, row.image_path),
});

const getAll = async (req, res, next) => {
  try {
    if (isSupabase) {
      const { status, search } = req.query;
      const rows = await supabase.list("featured_programs", {
        filters: { status },
        search: search ? { term: search, fields: ["title", "description"] } : undefined,
        order: "sort_order.asc,created_at.desc",
      });
      return sendSuccess(res, "Data program unggulan berhasil diambil.", rows.map((row) => mapFeatured(req, row)));
    }

    const { status, search } = req.query;
    let whereClause = "WHERE 1=1";
    const params = [];

    if (status) {
      whereClause += " AND status = ?";
      params.push(status);
    }
    if (search) {
      whereClause += " AND (title LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.query(
      `SELECT * FROM featured_programs ${whereClause} ORDER BY sort_order ASC, created_at DESC`,
      params
    );

    return sendSuccess(res, "Data program unggulan berhasil diambil.", rows.map((row) => mapFeatured(req, row)));
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE") {
      return sendSuccess(res, "Data program unggulan belum tersedia.", []);
    }
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, "Foto program unggulan wajib diupload.", 400);

    const { title, description, accent, status, sort_order } = req.body;
    const imagePath = isSupabase ? await supabase.uploadFile(req.file, "featured") : `uploads/featured/${req.file.filename}`;

    if (isSupabase) {
      const row = await supabase.insert("featured_programs", {
        title,
        description,
        image_path: imagePath,
        accent: toBool(accent),
        status: status || "aktif",
        sort_order: Number(sort_order || 0),
        created_by: req.user.id,
      });
      return sendCreated(res, "Program unggulan berhasil ditambahkan.", mapFeatured(req, row));
    }

    const [result] = await pool.query(
      `INSERT INTO featured_programs (title, description, image_path, accent, status, sort_order, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, imagePath, toBool(accent) ? 1 : 0, status || "aktif", sort_order || 0, req.user.id]
    );

    const [rows] = await pool.query("SELECT * FROM featured_programs WHERE id = ?", [result.insertId]);
    return sendCreated(res, "Program unggulan berhasil ditambahkan.", mapFeatured(req, rows[0]));
  } catch (error) {
    if (req.file) deleteFile(`uploads/featured/${req.file.filename}`);
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    if (isSupabase) {
      const existing = await supabase.findById("featured_programs", req.params.id);
      if (!existing) return sendNotFound(res, "Program unggulan tidak ditemukan.");

      const { title, description, accent, status, sort_order } = req.body;
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (accent !== undefined) updates.accent = toBool(accent);
      if (status !== undefined) updates.status = status;
      if (sort_order !== undefined) updates.sort_order = Number(sort_order);
      if (req.file) {
        await supabase.deleteFile(existing.image_path);
        updates.image_path = await supabase.uploadFile(req.file, "featured");
      }
      if (Object.keys(updates).length === 0) return sendError(res, "Tidak ada data yang diubah.", 400);
      const row = await supabase.update("featured_programs", req.params.id, updates);
      return sendSuccess(res, "Program unggulan berhasil diperbarui.", mapFeatured(req, row));
    }

    const [existing] = await pool.query("SELECT * FROM featured_programs WHERE id = ?", [req.params.id]);
    if (existing.length === 0) return sendNotFound(res, "Program unggulan tidak ditemukan.");

    const { title, description, accent, status, sort_order } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (accent !== undefined) updates.accent = toBool(accent) ? 1 : 0;
    if (status !== undefined) updates.status = status;
    if (sort_order !== undefined) updates.sort_order = sort_order;

    if (req.file) {
      deleteManagedImage(existing[0].image_path);
      updates.image_path = `uploads/featured/${req.file.filename}`;
    }

    if (Object.keys(updates).length === 0) return sendError(res, "Tidak ada data yang diubah.", 400);

    const setClauses = Object.keys(updates).map((key) => `${key} = ?`).join(", ");
    await pool.query(`UPDATE featured_programs SET ${setClauses} WHERE id = ?`, [...Object.values(updates), req.params.id]);

    const [rows] = await pool.query("SELECT * FROM featured_programs WHERE id = ?", [req.params.id]);
    return sendSuccess(res, "Program unggulan berhasil diperbarui.", mapFeatured(req, rows[0]));
  } catch (error) {
    if (req.file) deleteFile(`uploads/featured/${req.file.filename}`);
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    if (isSupabase) {
      const existing = await supabase.findById("featured_programs", req.params.id);
      if (!existing) return sendNotFound(res, "Program unggulan tidak ditemukan.");
      await supabase.deleteFile(existing.image_path);
      await supabase.remove("featured_programs", req.params.id);
      return sendSuccess(res, "Program unggulan berhasil dihapus.");
    }

    const [existing] = await pool.query("SELECT * FROM featured_programs WHERE id = ?", [req.params.id]);
    if (existing.length === 0) return sendNotFound(res, "Program unggulan tidak ditemukan.");

    deleteManagedImage(existing[0].image_path);
    await pool.query("DELETE FROM featured_programs WHERE id = ?", [req.params.id]);

    return sendSuccess(res, "Program unggulan berhasil dihapus.");
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update, remove };
