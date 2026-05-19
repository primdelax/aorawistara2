const { pool } = require("../config/database");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * GET /api/dashboard/stats
 * Hanya admin
 */
const getStats = async (req, res, next) => {
  try {
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
    const [rows] = await pool.query(
      "SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC"
    );
    return sendSuccess(res, "Data users berhasil diambil.", rows);
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

module.exports = { getStats, getUsers, toggleUserStatus };
