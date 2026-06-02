const jwt = require("jsonwebtoken");
const { pool } = require("../config/database");
const { isSupabase } = require("../config/dataProvider");
const supabase = require("../services/supabaseService");
const { sendUnauthorized, sendForbidden } = require("../utils/response");

/**
 * Middleware: Verifikasi JWT Token
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return sendUnauthorized(res, "Token tidak ditemukan. Silakan login terlebih dahulu.");
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return sendUnauthorized(res, "Token sudah kadaluarsa. Silakan login ulang.");
      }
      return sendUnauthorized(res, "Token tidak valid.");
    }

    const rows = isSupabase
      ? [await supabase.findById("users", decoded.id, "id,name,username,email,role,is_active")].filter(Boolean)
      : (await pool.query(
          "SELECT id, name, username, email, role, is_active FROM users WHERE id = ?",
          [decoded.id]
        ))[0];

    if (rows.length === 0) {
      return sendUnauthorized(res, "User tidak ditemukan.");
    }

    const user = rows[0];

    if (!user.is_active) {
      return sendForbidden(res, "Akun Anda telah dinonaktifkan.");
    }

    req.user = user;
    next();
  } catch (error) {
    return sendUnauthorized(res, "Autentikasi gagal.");
  }
};

/**
 * Middleware: Cek Role Admin
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return sendUnauthorized(res, "Tidak terautentikasi.");
  }
  if (req.user.role !== "admin") {
    return sendForbidden(res, "Hanya admin yang bisa mengakses fitur ini.");
  }
  next();
};

/**
 * Middleware: Opsional auth (tidak wajib login)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const rows = isSupabase
      ? [await supabase.findById("users", decoded.id, "id,name,username,email,role,is_active")].filter(Boolean)
      : (await pool.query(
          "SELECT id, name, username, email, role, is_active FROM users WHERE id = ?",
          [decoded.id]
        ))[0];

    req.user = rows.length > 0 && rows[0].is_active ? rows[0] : null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

module.exports = { verifyToken, isAdmin, optionalAuth };
