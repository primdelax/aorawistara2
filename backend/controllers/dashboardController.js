const { pool } = require("../config/database");
const { isSupabase } = require("../config/dataProvider");
const supabase = require("../services/supabaseService");
const { sendSuccess, sendError } = require("../utils/response");
const { getUserPermissions, setUserPermissions, getPermissionsMapForUsers } = require("../utils/permissions");
const bcrypt = require("bcryptjs");

const USERNAME_RE = /^[A-Za-z0-9]+$/;

const sanitizeUser = (user, permissions = ["all_access"]) => ({
  id: user.id,
  name: user.name,
  username: user.username,
  email: user.email,
  role: user.role,
  is_active: Boolean(user.is_active),
  permissions: permissions,
  created_at: user.created_at,
});

const normalizeUsername = (username) => String(username || "").trim().toLowerCase();

const validateAdminPayload = ({ name, username, password }, { requirePassword = true } = {}) => {
  const normalizedUsername = normalizeUsername(username);
  if (!String(name || "").trim()) return "Nama wajib diisi.";
  if (!normalizedUsername) return "Username wajib diisi.";
  if (!USERNAME_RE.test(normalizedUsername)) return "Username hanya boleh berisi huruf dan angka tanpa spasi.";
  if (normalizedUsername.length < 3 || normalizedUsername.length > 32) return "Username harus antara 3-32 karakter.";
  if (requirePassword && !password) return "Password wajib diisi.";
  if (password && String(password).length < 6) return "Password minimal 6 karakter.";
  return null;
};

const ensureUniqueUsername = async (username, ignoreId = null) => {
  if (isSupabase) {
    const user = await supabase.findOne("users", { username }, "id");
    return !user || Number(user.id) === Number(ignoreId);
  }

  const [rows] = await pool.query("SELECT id FROM users WHERE username = ?", [username]);
  return rows.length === 0 || Number(rows[0].id) === Number(ignoreId);
};

/**
 * GET /api/dashboard/stats
 * Hanya admin
 */
const getStats = async (req, res, next) => {
  try {
    if (isSupabase) {
      const [users, programs, articles, galleries, categories] = await Promise.all([
        supabase.list("users", { order: "created_at.desc" }),
        supabase.list("programs", { order: "created_at.desc" }),
        supabase.list("articles", { order: "created_at.desc" }),
        supabase.list("galleries", { order: "created_at.desc" }),
        supabase.list("categories", { order: "name.asc" }),
      ]);

      return sendSuccess(res, "Statistik dashboard berhasil diambil.", {
        users: {
          total: users.length,
          admin: users.filter((u) => u.role === "admin").length,
          user: users.filter((u) => u.role === "user").length,
          active: users.filter((u) => u.is_active).length,
        },
        programs: {
          total: programs.length,
          active: programs.filter((p) => p.status === "aktif").length,
          inactive: programs.filter((p) => p.status === "tidak_aktif").length,
        },
        articles: {
          total: articles.length,
          published: articles.filter((a) => a.status === "published").length,
          draft: articles.filter((a) => a.status === "draft").length,
          total_views: articles.reduce((sum, a) => sum + Number(a.views || 0), 0),
        },
        galleries: { total: galleries.length },
        recent_articles: articles.slice(0, 5),
        recent_programs: programs.slice(0, 5),
        programs_by_category: categories.map((category) => ({
          category_name: category.name,
          count: programs.filter((program) => Number(program.category_id) === Number(category.id)).length,
        })),
        monthly_articles: [],
      });
    }

    // Total users
    const [[userStats]] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(role = 'admin') as admin_count,
        SUM(role = 'user') as user_count,
        SUM(is_active = 1) as active_count
      FROM users
    `);

    // Total programs
    const [[programStats]] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(status = 'aktif') as active_count,
        SUM(status = 'tidak_aktif') as inactive_count
      FROM programs
    `);

    // Total articles
    const [[articleStats]] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(status = 'published') as published_count,
        SUM(status = 'draft') as draft_count,
        COALESCE(SUM(views), 0) as total_views
      FROM articles
    `);

    // Total galleries
    const [[galleryStats]] = await pool.query(`
      SELECT COUNT(*) as total FROM galleries
    `);

    // Recent articles (5 terbaru)
    const [recentArticles] = await pool.query(`
      SELECT a.id, a.title, a.status, a.views, a.created_at, u.name as author_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `);

    // Recent programs (5 terbaru)
    const [recentPrograms] = await pool.query(`
      SELECT p.id, p.title, p.status, p.created_at, u.name as created_by_name
      FROM programs p
      LEFT JOIN users u ON p.created_by = u.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    // Programs by category
    const [programsByCategory] = await pool.query(`
      SELECT c.name as category_name, COUNT(p.id) as count
      FROM categories c
      LEFT JOIN programs p ON p.category_id = c.id
      GROUP BY c.id, c.name
    `);

    // Monthly article publications (6 bulan terakhir)
    const [monthlyArticles] = await pool.query(`
      SELECT
        DATE_FORMAT(published_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM articles
      WHERE status = 'published' AND published_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);

    return sendSuccess(res, "Statistik dashboard berhasil diambil.", {
      users: {
        total: userStats.total,
        admin: userStats.admin_count,
        user: userStats.user_count,
        active: userStats.active_count,
      },
      programs: {
        total: programStats.total,
        active: programStats.active_count,
        inactive: programStats.inactive_count,
      },
      articles: {
        total: articleStats.total,
        published: articleStats.published_count,
        draft: articleStats.draft_count,
        total_views: articleStats.total_views,
      },
      galleries: {
        total: galleryStats.total,
      },
      recent_articles: recentArticles,
      recent_programs: recentPrograms,
      programs_by_category: programsByCategory,
      monthly_articles: monthlyArticles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/users
 * List semua user (admin only)
 */
const getUsers = async (req, res, next) => {
  try {
    if (isSupabase) {
      const rows = await supabase.list("users", { select: "id,name,username,email,role,is_active,created_at", filters: { role: "admin" }, order: "created_at.desc" });
      const userIds = rows.map((r) => r.id);
      const permMap = await getPermissionsMapForUsers(userIds);
      return sendSuccess(res, "Data users berhasil diambil.", rows.map((r) => sanitizeUser(r, permMap[r.id] || ["all_access"])));
    }

    const [rows] = await pool.query(
      "SELECT id, name, username, email, role, is_active, created_at FROM users WHERE role = 'admin' ORDER BY created_at DESC"
    );
    const userIds = rows.map((r) => r.id);
    const permMap = await getPermissionsMapForUsers(userIds);
    return sendSuccess(res, "Data users berhasil diambil.", rows.map((r) => sanitizeUser(r, permMap[r.id] || ["all_access"])));
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, password, permissions } = req.body;
    const username = normalizeUsername(req.body.username);
    const validation = validateAdminPayload({ name, username, password });
    if (validation) return sendError(res, validation, 400);

    if (!(await ensureUniqueUsername(username))) {
      return sendError(res, "Username sudah dipakai. Gunakan username lain.", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const email = `${username}@aora.local`;

    if (isSupabase) {
      const row = await supabase.insert("users", {
        name: String(name).trim(),
        username,
        email,
        password: passwordHash,
        role: "admin",
        is_active: true,
      });

      const perms = await setUserPermissions(row.id, permissions || ["all_access"]);
      return sendSuccess(res, "Akun admin berhasil ditambahkan.", sanitizeUser(row, perms), 201);
    }

    const [result] = await pool.query(
      "INSERT INTO users (name, username, email, password, role, is_active) VALUES (?, ?, ?, ?, ?, ?)",
      [String(name).trim(), username, email, passwordHash, "admin", 1]
    );
    const [rows] = await pool.query("SELECT id, name, username, email, role, is_active, created_at FROM users WHERE id = ?", [result.insertId]);
    const perms = await setUserPermissions(result.insertId, permissions || ["all_access"]);
    return sendSuccess(res, "Akun admin berhasil ditambahkan.", sanitizeUser(rows[0], perms), 201);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, password, is_active, permissions } = req.body;
    const username = req.body.username !== undefined ? normalizeUsername(req.body.username) : undefined;
    const existing = isSupabase
      ? await supabase.findById("users", req.params.id)
      : (await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id]))[0][0];

    if (!existing) return sendError(res, "User tidak ditemukan.", 404);

    const validation = validateAdminPayload({
      name: name ?? existing.name,
      username: username ?? existing.username,
      password,
    }, { requirePassword: false });
    if (validation) return sendError(res, validation, 400);

    const finalUsername = username ?? existing.username;
    if (!(await ensureUniqueUsername(finalUsername, req.params.id))) {
      return sendError(res, "Username sudah dipakai. Gunakan username lain.", 409);
    }

    const updates = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (username !== undefined) {
      updates.username = finalUsername;
      updates.email = `${finalUsername}@aora.local`;
    }
    if (password) updates.password = await bcrypt.hash(password, 12);
    if (is_active !== undefined) {
      if (Number(existing.id) === Number(req.user.id) && !Boolean(is_active)) {
        return sendError(res, "Tidak bisa menonaktifkan akun sendiri.", 400);
      }
      updates.is_active = Boolean(is_active);
    }

    let updatedPerms = undefined;
    if (permissions !== undefined) {
      updatedPerms = await setUserPermissions(req.params.id, permissions);
    } else {
      updatedPerms = await getUserPermissions(req.params.id);
    }

    if (Object.keys(updates).length === 0 && permissions === undefined) {
      return sendError(res, "Tidak ada data yang diubah.", 400);
    }

    if (isSupabase) {
      const row = Object.keys(updates).length > 0
        ? await supabase.update("users", req.params.id, updates)
        : existing;
      return sendSuccess(res, "Akun admin berhasil diperbarui.", sanitizeUser(row, updatedPerms));
    }

    if (Object.keys(updates).length > 0) {
      const setClauses = Object.keys(updates).map((key) => `${key} = ?`).join(", ");
      await pool.query(`UPDATE users SET ${setClauses} WHERE id = ?`, [...Object.values(updates), req.params.id]);
    }
    const [rows] = await pool.query("SELECT id, name, username, email, role, is_active, created_at FROM users WHERE id = ?", [req.params.id]);
    return sendSuccess(res, "Akun admin berhasil diperbarui.", sanitizeUser(rows[0], updatedPerms));
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (Number(req.params.id) === Number(req.user.id)) {
      return sendError(res, "Tidak bisa menghapus akun yang sedang login.", 400);
    }

    const existing = isSupabase
      ? await supabase.findById("users", req.params.id)
      : (await pool.query("SELECT id FROM users WHERE id = ?", [req.params.id]))[0][0];

    if (!existing) return sendError(res, "User tidak ditemukan.", 404);

    const deletedUsername = `deleted${req.params.id}${Date.now()}`;
    const updates = {
      username: deletedUsername,
      email: `${deletedUsername}@aora.local`,
      role: "user",
      is_active: false,
    };

    if (isSupabase) {
      await supabase.update("users", req.params.id, updates);
      return sendSuccess(res, "Akun admin berhasil dihapus.");
    }

    await pool.query("UPDATE users SET username = ?, email = ?, role = ?, is_active = ? WHERE id = ?", [
      updates.username,
      updates.email,
      updates.role,
      0,
      req.params.id,
    ]);
    return sendSuccess(res, "Akun admin berhasil dihapus.");
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/dashboard/users/:id/toggle-status
 * Toggle active status user
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    if (isSupabase) {
      const user = await supabase.findById("users", req.params.id);
      if (!user) return sendError(res, "User tidak ditemukan.", 404);
      if (Number(user.id) === Number(req.user.id)) return sendError(res, "Tidak bisa mengubah status akun sendiri.", 400);
      const updated = await supabase.update("users", req.params.id, { is_active: !user.is_active });
      return sendSuccess(res, `User berhasil ${updated.is_active ? "diaktifkan" : "dinonaktifkan"}.`, {
        id: updated.id,
        is_active: Boolean(updated.is_active),
      });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return sendError(res, "User tidak ditemukan.", 404);
    }

    if (rows[0].id === req.user.id) {
      return sendError(res, "Tidak bisa mengubah status akun sendiri.", 400);
    }

    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query("UPDATE users SET is_active = ? WHERE id = ?", [newStatus, req.params.id]);

    return sendSuccess(res, `User berhasil ${newStatus ? "diaktifkan" : "dinonaktifkan"}.`, {
      id: rows[0].id,
      is_active: Boolean(newStatus),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getUsers, createUser, updateUser, deleteUser, toggleUserStatus };
