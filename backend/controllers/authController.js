const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { pool } = require("../config/database");
const { sendSuccess, sendCreated, sendError, sendUnauthorized } = require("../utils/response");

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Cek email sudah dipakai
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return sendError(res, "Email sudah terdaftar. Gunakan email lain.", 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert user
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, passwordHash, "user"]
    );

    // Generate token
    const token = jwt.sign(
      { id: result.insertId, email, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    // Save session
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.query(
      "INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)",
      [result.insertId, tokenHash, req.ip, req.headers["user-agent"] || "", expiresAt]
    );

    return sendCreated(res, "Registrasi berhasil.", {
      token,
      user: { id: result.insertId, name, email, role: "user" },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Cari user
    const [rows] = await pool.query(
      "SELECT id, name, email, password, role, is_active FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return sendUnauthorized(res, "Email atau password salah.");
    }

    const user = rows[0];

    if (!user.is_active) {
      return sendUnauthorized(res, "Akun Anda telah dinonaktifkan.");
    }

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendUnauthorized(res, "Email atau password salah.");
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    // Save session
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.query(
      "INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)",
      [user.id, tokenHash, req.ip, req.headers["user-agent"] || "", expiresAt]
    );

    return sendSuccess(res, "Login berhasil.", {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (token) {
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      await pool.query("DELETE FROM sessions WHERE token_hash = ?", [tokenHash]);
    }

    return sendSuccess(res, "Logout berhasil.");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, avatar, is_active, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return sendUnauthorized(res, "User tidak ditemukan.");
    }

    return sendSuccess(res, "Profil berhasil diambil.", rows[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getMe };
