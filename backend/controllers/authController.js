const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { pool } = require("../config/database");
const { isSupabase } = require("../config/dataProvider");
const supabase = require("../services/supabaseService");
const { sendSuccess, sendCreated, sendError, sendUnauthorized } = require("../utils/response");

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  username: user.username,
  email: user.email,
  role: user.role,
});

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const username = String(req.body.username || email.split("@")[0]).trim().toLowerCase().replace(/[^a-z0-9]/g, "");

    if (isSupabase) {
      const existingEmail = await supabase.findOne("users", { email }, "id");
      if (existingEmail) return sendError(res, "Email sudah terdaftar. Gunakan email lain.", 409);
      const existingUsername = await supabase.findOne("users", { username }, "id");
      if (existingUsername) return sendError(res, "Username sudah dipakai. Gunakan username lain.", 409);

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await supabase.insert("users", { name, username, email, password: passwordHash, role: "user", is_active: true });
      const token = jwt.sign({ id: user.id, username, role: "user" }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });

      return sendCreated(res, "Registrasi berhasil.", {
        token,
        user: publicUser({ id: user.id, name, username, email, role: "user" }),
      });
    }

    // Cek email sudah dipakai
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return sendError(res, "Email sudah terdaftar. Gunakan email lain.", 409);
    }
    const [existingUsername] = await pool.query("SELECT id FROM users WHERE username = ?", [username]);
    if (existingUsername.length > 0) {
      return sendError(res, "Username sudah dipakai. Gunakan username lain.", 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert user
    const [result] = await pool.query(
      "INSERT INTO users (name, username, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [name, username, email, passwordHash, "user"]
    );

    // Generate token
    const token = jwt.sign(
      { id: result.insertId, username, role: "user" },
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
      user: publicUser({ id: result.insertId, name, username, email, role: "user" }),
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
    const { username, password } = req.body;
    const normalizedUsername = String(username || "").trim().toLowerCase();

    if (isSupabase) {
      const user = await supabase.findOne("users", { username: normalizedUsername }, "id,name,username,email,password,role,is_active");
      if (!user) return sendUnauthorized(res, "Username atau password salah.");
      if (!user.is_active) return sendUnauthorized(res, "Akun Anda telah dinonaktifkan.");

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return sendUnauthorized(res, "Username atau password salah.");

      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });
      return sendSuccess(res, "Login berhasil.", {
        token,
        user: publicUser(user),
      });
    }

    // Cari user
    const [rows] = await pool.query(
      "SELECT id, name, username, email, password, role, is_active FROM users WHERE username = ?",
      [normalizedUsername]
    );

    if (rows.length === 0) {
      return sendUnauthorized(res, "Username atau password salah.");
    }

    const user = rows[0];

    if (!user.is_active) {
      return sendUnauthorized(res, "Akun Anda telah dinonaktifkan.");
    }

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendUnauthorized(res, "Username atau password salah.");
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
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
      user: publicUser(user),
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
    if (isSupabase) return sendSuccess(res, "Logout berhasil.");

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
    if (isSupabase) {
      const user = await supabase.findById("users", req.user.id, "id,name,username,email,role,avatar,is_active,created_at");
      if (!user) return sendUnauthorized(res, "User tidak ditemukan.");
      return sendSuccess(res, "Profil berhasil diambil.", user);
    }

    const [rows] = await pool.query(
      "SELECT id, name, username, email, role, avatar, is_active, created_at FROM users WHERE id = ?",
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
