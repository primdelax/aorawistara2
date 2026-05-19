/**
 * Reusable API Response Helpers
 * Format standar: { success, message, data, meta }
 */

const sendSuccess = (res, message = "Berhasil", data = null, statusCode = 200) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

const sendCreated = (res, message = "Data berhasil dibuat", data = null) => {
  return sendSuccess(res, message, data, 201);
};

const sendPaginated = (res, message = "Data berhasil diambil", data, pagination) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

const sendError = (res, message = "Terjadi kesalahan", statusCode = 500, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const sendNotFound = (res, message = "Data tidak ditemukan") => {
  return sendError(res, message, 404);
};

const sendUnauthorized = (res, message = "Akses tidak diizinkan") => {
  return sendError(res, message, 401);
};

const sendForbidden = (res, message = "Anda tidak memiliki hak akses") => {
  return sendError(res, message, 403);
};

const sendValidationError = (res, errors) => {
  return res.status(422).json({
    success: false,
    message: "Validasi gagal",
    errors,
  });
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendValidationError,
};
