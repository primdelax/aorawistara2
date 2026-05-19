const { sendError } = require("../utils/response");

/**
 * Middleware: Handle Multer errors dan global errors
 */
const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message);

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return sendError(res, "Ukuran file terlalu besar. Maksimal 5MB.", 413);
  }

  // Multer unexpected field error
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return sendError(res, "Field file tidak dikenali.", 400);
  }

  // Custom multer message
  if (err.message && err.message.includes("Format file")) {
    return sendError(res, err.message, 400);
  }

  // MySQL duplicate entry
  if (err.code === "ER_DUP_ENTRY") {
    return sendError(res, "Data sudah ada. Gunakan nilai yang berbeda.", 409);
  }

  // MySQL foreign key constraint
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return sendError(res, "Referensi data tidak ditemukan.", 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, "Token tidak valid.", 401);
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, "Token sudah kadaluarsa.", 401);
  }

  // Default
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === "production"
    ? "Terjadi kesalahan pada server."
    : err.message || "Terjadi kesalahan pada server.";

  return sendError(res, message, statusCode);
};

/**
 * Middleware: 404 Not Found
 */
const notFound = (req, res) => {
  return sendError(res, `Endpoint '${req.originalUrl}' tidak ditemukan.`, 404);
};

module.exports = { errorHandler, notFound };
