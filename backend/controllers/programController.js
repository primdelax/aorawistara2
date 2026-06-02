const { pool } = require("../config/database");
const { isSupabase } = require("../config/dataProvider");
const supabase = require("../services/supabaseService");
const { sendSuccess, sendCreated, sendPaginated, sendError, sendNotFound } = require("../utils/response");
const { generateSlug, getPagination, buildPaginationMeta } = require("../utils/helpers");
const { buildImageUrl, deleteFile } = require("../utils/upload");

const parseSchedules = (value) => {
  if (!value) return [];

  let parsed;
  try {
    parsed = typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    const err = new Error("Format jadwal tidak valid.");
    err.statusCode = 400;
    throw err;
  }

  if (!Array.isArray(parsed)) {
    const err = new Error("Jadwal harus berupa daftar.");
    err.statusCode = 400;
    throw err;
  }

  return parsed
    .map((item, index) => ({
      day: String(item.day || "").trim(),
      time: String(item.time || "").trim(),
      note: String(item.note || "").trim(),
      sort_order: Number.isInteger(Number(item.sort_order)) ? Number(item.sort_order) : index,
    }))
    .filter((item) => item.day && item.time)
    .slice(0, 20);
};

const attachSchedules = async (programs) => {
  if (programs.length === 0) return programs;

  const ids = programs.map((program) => program.id);
  let rows = [];
  try {
    [rows] = await pool.query(
      `SELECT id, program_id, day, time, note, sort_order
       FROM program_schedules
       WHERE program_id IN (?)
       ORDER BY sort_order ASC, id ASC`,
      [ids]
    );
  } catch (error) {
    if (error.code !== "ER_NO_SUCH_TABLE") throw error;
  }

  const schedulesByProgram = rows.reduce((acc, row) => {
    if (!acc[row.program_id]) acc[row.program_id] = [];
    acc[row.program_id].push({
      id: row.id,
      day: row.day,
      time: row.time,
      note: row.note,
      sort_order: row.sort_order,
    });
    return acc;
  }, {});

  return programs.map((program) => ({
    ...program,
    schedules: schedulesByProgram[program.id] || [],
  }));
};

const attachSchedulesOnline = async (programs) => {
  if (programs.length === 0) return programs;

  const schedules = await supabase.list("program_schedules", {
    order: "sort_order.asc,id.asc",
  });
  const ids = new Set(programs.map((program) => Number(program.id)));
  const schedulesByProgram = schedules
    .filter((schedule) => ids.has(Number(schedule.program_id)))
    .reduce((acc, row) => {
      if (!acc[row.program_id]) acc[row.program_id] = [];
      acc[row.program_id].push(row);
      return acc;
    }, {});

  return programs.map((program) => ({
    ...program,
    schedules: schedulesByProgram[program.id] || [],
  }));
};

const replaceSchedules = async (conn, programId, schedules) => {
  await conn.query("DELETE FROM program_schedules WHERE program_id = ?", [programId]);

  if (schedules.length === 0) return;

  const values = schedules.map((schedule, index) => [
    programId,
    schedule.day,
    schedule.time,
    schedule.note || null,
    schedule.sort_order ?? index,
  ]);

  await conn.query(
    `INSERT INTO program_schedules (program_id, day, time, note, sort_order)
     VALUES ?`,
    [values]
  );
};

const replaceSchedulesOnline = async (programId, schedules) => {
  const existing = await supabase.list("program_schedules", { filters: { program_id: programId } });
  await Promise.all(existing.map((schedule) => supabase.remove("program_schedules", schedule.id)));

  for (const [index, schedule] of schedules.entries()) {
    await supabase.insert("program_schedules", {
      program_id: programId,
      day: schedule.day,
      time: schedule.time,
      note: schedule.note || null,
      sort_order: schedule.sort_order ?? index,
    });
  }
};

const buildProgramResponse = (req, row) => ({
  ...row,
  image_url: row.image
    ? row.image.startsWith("http://") || row.image.startsWith("https://") || row.image.startsWith("/")
      ? row.image
      : buildImageUrl(req, row.image)
    : null,
});

/**
 * GET /api/programs
 */
const getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const { status, category_id, program_type, search } = req.query;

    if (isSupabase) {
      const rows = await supabase.list("programs", {
        filters: { status, category_id, program_type },
        search: search ? { term: search, fields: ["title", "description"] } : undefined,
        order: "is_featured.desc,created_at.desc",
        limit,
        offset,
      });
      const data = await attachSchedulesOnline(rows.map((row) => buildProgramResponse(req, row)));
      return sendPaginated(res, "Data program berhasil diambil.", data, buildPaginationMeta(data.length, page, limit));
    }

    let whereClause = "WHERE 1=1";
    const params = [];

    if (status) {
      whereClause += " AND p.status = ?";
      params.push(status);
    }
    if (category_id) {
      whereClause += " AND p.category_id = ?";
      params.push(category_id);
    }
    if (program_type) {
      whereClause += " AND p.program_type = ?";
      params.push(program_type);
    }
    if (search) {
      whereClause += " AND (p.title LIKE ? OR p.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM programs p ${whereClause}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, u.name as created_by_name
       FROM programs p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.created_by = u.id
       ${whereClause}
       ORDER BY p.is_featured DESC, p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const data = await attachSchedules(rows.map((row) => buildProgramResponse(req, row)));

    return sendPaginated(res, "Data program berhasil diambil.", data, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/programs/:id
 */
const getOne = async (req, res, next) => {
  try {
    if (isSupabase) {
      const row = await supabase.findById("programs", req.params.id);
      if (!row) return sendNotFound(res, "Program tidak ditemukan.");
      const [program] = await attachSchedulesOnline([buildProgramResponse(req, row)]);
      return sendSuccess(res, "Detail program berhasil diambil.", program);
    }

    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, u.name as created_by_name
       FROM programs p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) return sendNotFound(res, "Program tidak ditemukan.");

    const [program] = await attachSchedules([buildProgramResponse(req, rows[0])]);
    return sendSuccess(res, "Detail program berhasil diambil.", program);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/programs/slug/:slug
 */
const getBySlug = async (req, res, next) => {
  try {
    if (isSupabase) {
      const row = await supabase.findOne("programs", { slug: req.params.slug });
      if (!row) return sendNotFound(res, "Program tidak ditemukan.");
      const [program] = await attachSchedulesOnline([buildProgramResponse(req, row)]);
      return sendSuccess(res, "Detail program berhasil diambil.", program);
    }

    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, u.name as created_by_name
       FROM programs p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.slug = ?`,
      [req.params.slug]
    );

    if (rows.length === 0) return sendNotFound(res, "Program tidak ditemukan.");

    const [program] = await attachSchedules([buildProgramResponse(req, rows[0])]);
    return sendSuccess(res, "Detail program berhasil diambil.", program);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/programs
 */
const create = async (req, res, next) => {
  const conn = isSupabase ? null : await pool.getConnection();
  try {
    const { title, description, duration, price, program_type, status, category_id } = req.body;
    const schedules = parseSchedules(req.body.schedules);
    const slug = generateSlug(title);

    let imagePath = null;
    if (req.file) {
      imagePath = isSupabase ? await supabase.uploadFile(req.file, "programs") : `uploads/programs/${req.file.filename}`;
    }

    if (isSupabase) {
      const row = await supabase.insert("programs", {
        title,
        slug,
        description,
        duration: duration || null,
        price: Number(price || 0),
        image: imagePath,
        program_type: program_type || "reguler",
        status: status || "aktif",
        category_id: category_id || null,
        created_by: req.user.id,
      });
      await replaceSchedulesOnline(row.id, schedules);
      const [program] = await attachSchedulesOnline([buildProgramResponse(req, row)]);
      return sendCreated(res, "Program berhasil dibuat.", program);
    }

    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO programs (title, slug, description, duration, price, image, program_type, status, category_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, description, duration || null, price || 0, imagePath, program_type || "reguler", status || "aktif",
       category_id || null, req.user.id]
    );

    await replaceSchedules(conn, result.insertId, schedules);
    await conn.commit();

    const [rows] = await pool.query("SELECT * FROM programs WHERE id = ?", [result.insertId]);
    const [program] = await attachSchedules([buildProgramResponse(req, rows[0])]);
    return sendCreated(res, "Program berhasil dibuat.", program);
  } catch (error) {
    if (conn) await conn.rollback();
    if (req.file) deleteFile(`uploads/programs/${req.file.filename}`);
    next(error);
  } finally {
    if (conn) conn.release();
  }
};

/**
 * PUT /api/programs/:id
 */
const update = async (req, res, next) => {
  const conn = isSupabase ? null : await pool.getConnection();
  try {
    if (isSupabase) {
      const existing = await supabase.findById("programs", req.params.id);
      if (!existing) return sendNotFound(res, "Program tidak ditemukan.");

      const { title, description, duration, price, program_type, status, category_id } = req.body;
      const hasSchedules = req.body.schedules !== undefined;
      const schedules = hasSchedules ? parseSchedules(req.body.schedules) : [];
      const updates = {};

      if (title) { updates.title = title; updates.slug = generateSlug(title); }
      if (description !== undefined) updates.description = description;
      if (duration !== undefined) updates.duration = duration;
      if (price !== undefined) updates.price = Number(price || 0);
      if (program_type) updates.program_type = program_type;
      if (status) updates.status = status;
      if (category_id !== undefined) updates.category_id = category_id || null;
      if (req.file) {
        await supabase.deleteFile(existing.image);
        updates.image = await supabase.uploadFile(req.file, "programs");
      }

      if (Object.keys(updates).length === 0 && !hasSchedules) return sendError(res, "Tidak ada data yang diubah.", 400);
      const row = Object.keys(updates).length > 0 ? await supabase.update("programs", req.params.id, updates) : existing;
      if (hasSchedules) await replaceSchedulesOnline(req.params.id, schedules);
      const [program] = await attachSchedulesOnline([buildProgramResponse(req, row)]);
      return sendSuccess(res, "Program berhasil diperbarui.", program);
    }

    const [existing] = await pool.query("SELECT * FROM programs WHERE id = ?", [req.params.id]);
    if (existing.length === 0) return sendNotFound(res, "Program tidak ditemukan.");

    const { title, description, duration, price, program_type, status, category_id } = req.body;
    const hasSchedules = req.body.schedules !== undefined;
    const schedules = hasSchedules ? parseSchedules(req.body.schedules) : [];
    const updates = {};

    if (title) { updates.title = title; updates.slug = generateSlug(title); }
    if (description !== undefined) updates.description = description;
    if (duration !== undefined) updates.duration = duration;
    if (price !== undefined) updates.price = price;
    if (program_type) updates.program_type = program_type;
    if (status) updates.status = status;
    if (category_id !== undefined) updates.category_id = category_id || null;

    if (req.file) {
      if (existing[0].image) deleteFile(existing[0].image);
      updates.image = `uploads/programs/${req.file.filename}`;
    }

    if (Object.keys(updates).length === 0 && !hasSchedules) {
      return sendError(res, "Tidak ada data yang diubah.", 400);
    }

    await conn.beginTransaction();

    if (Object.keys(updates).length > 0) {
      const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(", ");
      const values = [...Object.values(updates), req.params.id];
      await conn.query(`UPDATE programs SET ${setClauses} WHERE id = ?`, values);
    }

    if (hasSchedules) {
      await replaceSchedules(conn, req.params.id, schedules);
    }

    await conn.commit();
    const [rows] = await pool.query("SELECT * FROM programs WHERE id = ?", [req.params.id]);

    const [program] = await attachSchedules([buildProgramResponse(req, rows[0])]);
    return sendSuccess(res, "Program berhasil diperbarui.", program);
  } catch (error) {
    if (conn) await conn.rollback();
    if (req.file) deleteFile(`uploads/programs/${req.file.filename}`);
    next(error);
  } finally {
    if (conn) conn.release();
  }
};

/**
 * DELETE /api/programs/:id
 */
const remove = async (req, res, next) => {
  try {
    if (isSupabase) {
      const existing = await supabase.findById("programs", req.params.id);
      if (!existing) return sendNotFound(res, "Program tidak ditemukan.");
      await supabase.deleteFile(existing.image);
      await replaceSchedulesOnline(req.params.id, []);
      await supabase.remove("programs", req.params.id);
      return sendSuccess(res, "Program berhasil dihapus.");
    }

    const [existing] = await pool.query("SELECT * FROM programs WHERE id = ?", [req.params.id]);
    if (existing.length === 0) return sendNotFound(res, "Program tidak ditemukan.");

    if (existing[0].image) deleteFile(existing[0].image);

    await pool.query("DELETE FROM programs WHERE id = ?", [req.params.id]);

    return sendSuccess(res, "Program berhasil dihapus.");
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/programs/:id/featured
 */
const toggleFeatured = async (req, res, next) => {
  try {
    const { is_featured } = req.body;
    const isFeaturedBool = is_featured === true || is_featured === 1 || String(is_featured) === 'true';

    if (isSupabase) {
      const existing = await supabase.findById("programs", req.params.id);
      if (!existing) return sendNotFound(res, "Program tidak ditemukan.");
      const row = await supabase.update("programs", req.params.id, { is_featured: isFeaturedBool });
      const [program] = await attachSchedulesOnline([buildProgramResponse(req, row)]);
      return sendSuccess(res, "Status program unggulan berhasil diubah.", program);
    }

    const [existing] = await pool.query("SELECT * FROM programs WHERE id = ?", [req.params.id]);
    if (existing.length === 0) return sendNotFound(res, "Program tidak ditemukan.");

    await pool.query("UPDATE programs SET is_featured = ? WHERE id = ?", [isFeaturedBool ? 1 : 0, req.params.id]);
    const [rows] = await pool.query("SELECT * FROM programs WHERE id = ?", [req.params.id]);
    const [program] = await attachSchedules([buildProgramResponse(req, rows[0])]);
    return sendSuccess(res, "Status program unggulan berhasil diubah.", program);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getOne, getBySlug, create, update, remove, toggleFeatured };
