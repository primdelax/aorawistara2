const { validationResult } = require("express-validator");
const { sendValidationError } = require("../utils/response");

/**
 * Middleware: Jalankan setelah express-validator chain
 * Otomatis return 422 jika ada error validasi
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().reduce((acc, err) => {
      if (!acc[err.path]) acc[err.path] = [];
      acc[err.path].push(err.msg);
      return acc;
    }, {});
    return sendValidationError(res, formatted);
  }
  next();
};

module.exports = { validate };
