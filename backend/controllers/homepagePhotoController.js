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

const mapPhoto = (req, row) => ({
  ...row,
  image_url: getImageUrl(req, row.image_path),
});

const getAll = async (req, res, next) => {
  try {
    if (isSupabase) {
      const { status, search } = req.query;
      const rows = await supabase.list("homepage_photos", {
        filters: { status },
        search: search ? { term: search, fields: ["title"] } : undefined,
        order: "sort_order.asc,created_at.desc",
      });
      return sendSuccess(res, "Data foto homepage berhasil diambil.", rows.map((row) => mapPhoto(req, row)));
    }

    const { status, search } = req.query;
    let whereClause = "WHERE 1=1";
    const params = [];

    if (status) {
      whereClause += " AND status = ?";
      params.push(status);
    }
    if (search) {
      whereClause += " AND title LIKE ?";
      params.push(`%${search}%`);
    }

    const [rows] = await pool.query(
      `SELECT * FROM homepage_photos ${whereClause} ORDER BY sort_order ASC, created_at DESC`,
      params
    );

    return sendSuccess(res, "Data foto homepage berhasil diambil.", rows.map((row) => mapPhoto(req, row)));
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE") {
      return sendSuccess(res, "Data foto homepage belum tersedia.", []);
    }
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, "Foto homepage wajib diupload.", 400);

    const { title, status, sort_order } = req.body;
    const imagePath = isSupabase ? await supabase.uploadFile(req.file, "homepage") : `uploads/homepage/${req.file.filename}`;

    if (isSupabase) {
      const row = await supabase.insert("homepage_photos", {
        title,
        image_path: imagePath,
        status: status || "aktif",
        sort_order: Number(sort_order || 0),
        uploaded_by: req.user.id,
      });
      return sendCreated(res, "Foto homepage berhasil ditambahkan.", mapPhoto(req, row));
    }

    const [result] = await pool.query(
      `INSERT INTO homepage_photos (title, image_path, status, sort_order, uploaded_by)
       VALUES (?, ?, ?, ?, ?)`,
      [title, imagePath, status || "aktif", sort_order || 0, req.user.id]
    );

    const [rows] = await pool.query("SELECT * FROM homepage_photos WHERE id = ?", [result.insertId]);
    return sendCreated(res, "Foto homepage berhasil ditambahkan.", mapPhoto(req, rows[0]));
  } catch (error) {
    if (req.file) deleteFile(`uploads/homepage/${req.file.filename}`);
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    if (isSupabase) {
      const existing = await supabase.findById("homepage_photos", req.params.id);
      if (!existing) return sendNotFound(res, "Foto homepage tidak ditemukan.");

      const { title, status, sort_order } = req.body;
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (status !== undefined) updates.status = status;
      if (sort_order !== undefined) updates.sort_order = Number(sort_order);
      if (req.file) {
        await supabase.deleteFile(existing.image_path);
        updates.image_path = await supabase.uploadFile(req.file, "homepage");
      }
      if (Object.keys(updates).length === 0) return sendError(res, "Tidak ada data yang diubah.", 400);
      const row = await supabase.update("homepage_photos", req.params.id, updates);
      return sendSuccess(res, "Foto homepage berhasil diperbarui.", mapPhoto(req, row));
    }

    const [existing] = await pool.query("SELECT * FROM homepage_photos WHERE id = ?", [req.params.id]);
    if (existing.length === 0) return sendNotFound(res, "Foto homepage tidak ditemukan.");

    const { title, status, sort_order } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (status !== undefined) updates.status = status;
    if (sort_order !== undefined) updates.sort_order = sort_order;

    if (req.file) {
      deleteManagedImage(existing[0].image_path);
      updates.image_path = `uploads/homepage/${req.file.filename}`;
    }

    if (Object.keys(updates).length === 0) return sendError(res, "Tidak ada data yang diubah.", 400);

    const setClauses = Object.keys(updates).map((key) => `${key} = ?`).join(", ");
    await pool.query(`UPDATE homepage_photos SET ${setClauses} WHERE id = ?`, [...Object.values(updates), req.params.id]);

    const [rows] = await pool.query("SELECT * FROM homepage_photos WHERE id = ?", [req.params.id]);
    return sendSuccess(res, "Foto homepage berhasil diperbarui.", mapPhoto(req, rows[0]));
  } catch (error) {
    if (req.file) deleteFile(`uploads/homepage/${req.file.filename}`);
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    if (isSupabase) {
      const existing = await supabase.findById("homepage_photos", req.params.id);
      if (!existing) return sendNotFound(res, "Foto homepage tidak ditemukan.");
      await supabase.deleteFile(existing.image_path);
      await supabase.remove("homepage_photos", req.params.id);
      return sendSuccess(res, "Foto homepage berhasil dihapus.");
    }

    const [existing] = await pool.query("SELECT * FROM homepage_photos WHERE id = ?", [req.params.id]);
    if (existing.length === 0) return sendNotFound(res, "Foto homepage tidak ditemukan.");

    deleteManagedImage(existing[0].image_path);
    await pool.query("DELETE FROM homepage_photos WHERE id = ?", [req.params.id]);

    return sendSuccess(res, "Foto homepage berhasil dihapus.");
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update, remove };
