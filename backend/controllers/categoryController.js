const { pool } = require("../config/database");
const { sendSuccess, sendCreated, sendNotFound, sendError } = require("../utils/response");
const { generateSlug } = require("../utils/helpers");

const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM categories ORDER BY name ASC"
    );
    return sendSuccess(res, "Data kategori berhasil diambil.", rows);
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return sendNotFound(res, "Kategori tidak ditemukan.");
    return sendSuccess(res, "Detail kategori berhasil diambil.", rows[0]);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const slug = generateSlug(name);

    const [result] = await pool.query(
      "INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)",
      [name, slug, description || null]
    );

    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [result.insertId]);
    return sendCreated(res, "Kategori berhasil dibuat.", rows[0]);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const [existing] = await pool.query("SELECT * FROM categories WHERE id = ?", [req.params.id]);
    if (existing.length === 0) return sendNotFound(res, "Kategori tidak ditemukan.");

    const { name, description } = req.body;
    const updates = {};
    if (name) { updates.name = name; updates.slug = generateSlug(name); }
    if (description !== undefined) updates.description = description;

    if (Object.keys(updates).length === 0) {
      return sendError(res, "Tidak ada data yang diubah.", 400);
    }

    const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(", ");
    await pool.query(`UPDATE categories SET ${setClauses} WHERE id = ?`, [...Object.values(updates), req.params.id]);

    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [req.params.id]);
    return sendSuccess(res, "Kategori berhasil diperbarui.", rows[0]);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const [existing] = await pool.query("SELECT * FROM categories WHERE id = ?", [req.params.id]);
    if (existing.length === 0) return sendNotFound(res, "Kategori tidak ditemukan.");

    await pool.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
    return sendSuccess(res, "Kategori berhasil dihapus.");
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getOne, create, update, remove };
