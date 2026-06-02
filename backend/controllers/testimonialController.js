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

const mapTestimonial = (req, row) => ({
  ...row,
  image_url: getImageUrl(req, row.image_path),
});

const getAll = async (req, res, next) => {
  try {
    if (isSupabase) {
      const { status, search } = req.query;
      const rows = await supabase.list("testimonials", {
        filters: { status },
        search: search ? { term: search, fields: ["alumni_name", "profile", "comment"] } : undefined,
        order: "sort_order.asc,created_at.desc",
      });
      return sendSuccess(res, "Data testimoni berhasil diambil.", rows.map((row) => mapTestimonial(req, row)));
    }

    const { status, search } = req.query;
    let whereClause = "WHERE 1=1";
    const params = [];

    if (status) {
      whereClause += " AND status = ?";
      params.push(status);
    }
    if (search) {
      whereClause += " AND (alumni_name LIKE ? OR profile LIKE ? OR comment LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.query(
      `SELECT * FROM testimonials ${whereClause} ORDER BY sort_order ASC, created_at DESC`,
      params
    );

    return sendSuccess(res, "Data testimoni berhasil diambil.", rows.map((row) => mapTestimonial(req, row)));
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE") {
      return sendSuccess(res, "Data testimoni belum tersedia.", []);
    }
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, "Foto alumni wajib diupload.", 400);

    const { alumni_name, profile, comment, status, sort_order } = req.body;
    const imagePath = isSupabase ? await supabase.uploadFile(req.file, "testimonials") : `uploads/testimonials/${req.file.filename}`;

    if (isSupabase) {
      const row = await supabase.insert("testimonials", {
        alumni_name,
        profile,
        comment,
        image_path: imagePath,
        status: status || "aktif",
        sort_order: Number(sort_order || 0),
        created_by: req.user.id,
      });
      return sendCreated(res, "Testimoni berhasil ditambahkan.", mapTestimonial(req, row));
    }

    const [result] = await pool.query(
      `INSERT INTO testimonials (alumni_name, profile, comment, image_path, status, sort_order, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [alumni_name, profile, comment, imagePath, status || "aktif", sort_order || 0, req.user.id]
    );

    const [rows] = await pool.query("SELECT * FROM testimonials WHERE id = ?", [result.insertId]);
    return sendCreated(res, "Testimoni berhasil ditambahkan.", mapTestimonial(req, rows[0]));
  } catch (error) {
    if (req.file) deleteFile(`uploads/testimonials/${req.file.filename}`);
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    if (isSupabase) {
      const existing = await supabase.findById("testimonials", req.params.id);
      if (!existing) return sendNotFound(res, "Testimoni tidak ditemukan.");

      const { alumni_name, profile, comment, status, sort_order } = req.body;
      const updates = {};
      if (alumni_name !== undefined) updates.alumni_name = alumni_name;
      if (profile !== undefined) updates.profile = profile;
      if (comment !== undefined) updates.comment = comment;
      if (status !== undefined) updates.status = status;
      if (sort_order !== undefined) updates.sort_order = Number(sort_order);
      if (req.file) {
        await supabase.deleteFile(existing.image_path);
        updates.image_path = await supabase.uploadFile(req.file, "testimonials");
      }
      if (Object.keys(updates).length === 0) return sendError(res, "Tidak ada data yang diubah.", 400);
      const row = await supabase.update("testimonials", req.params.id, updates);
      return sendSuccess(res, "Testimoni berhasil diperbarui.", mapTestimonial(req, row));
    }

    const [existing] = await pool.query("SELECT * FROM testimonials WHERE id = ?", [req.params.id]);
    if (existing.length === 0) return sendNotFound(res, "Testimoni tidak ditemukan.");

    const { alumni_name, profile, comment, status, sort_order } = req.body;
    const updates = {};

    if (alumni_name !== undefined) updates.alumni_name = alumni_name;
    if (profile !== undefined) updates.profile = profile;
    if (comment !== undefined) updates.comment = comment;
    if (status !== undefined) updates.status = status;
    if (sort_order !== undefined) updates.sort_order = sort_order;

    if (req.file) {
      deleteManagedImage(existing[0].image_path);
      updates.image_path = `uploads/testimonials/${req.file.filename}`;
    }

    if (Object.keys(updates).length === 0) return sendError(res, "Tidak ada data yang diubah.", 400);

    const setClauses = Object.keys(updates).map((key) => `${key} = ?`).join(", ");
    await pool.query(`UPDATE testimonials SET ${setClauses} WHERE id = ?`, [...Object.values(updates), req.params.id]);

    const [rows] = await pool.query("SELECT * FROM testimonials WHERE id = ?", [req.params.id]);
    return sendSuccess(res, "Testimoni berhasil diperbarui.", mapTestimonial(req, rows[0]));
  } catch (error) {
    if (req.file) deleteFile(`uploads/testimonials/${req.file.filename}`);
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    if (isSupabase) {
      const existing = await supabase.findById("testimonials", req.params.id);
      if (!existing) return sendNotFound(res, "Testimoni tidak ditemukan.");
      await supabase.deleteFile(existing.image_path);
      await supabase.remove("testimonials", req.params.id);
      return sendSuccess(res, "Testimoni berhasil dihapus.");
    }

    const [existing] = await pool.query("SELECT * FROM testimonials WHERE id = ?", [req.params.id]);
    if (existing.length === 0) return sendNotFound(res, "Testimoni tidak ditemukan.");

    deleteManagedImage(existing[0].image_path);
    await pool.query("DELETE FROM testimonials WHERE id = ?", [req.params.id]);

    return sendSuccess(res, "Testimoni berhasil dihapus.");
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update, remove };
