const { body } = require("express-validator");

const registerValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Nama wajib diisi.")
    .isLength({ min: 2, max: 100 }).withMessage("Nama harus antara 2-100 karakter."),

  body("email")
    .trim()
    .notEmpty().withMessage("Email wajib diisi.")
    .isEmail().withMessage("Format email tidak valid.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password wajib diisi.")
    .isLength({ min: 8 }).withMessage("Password minimal 8 karakter.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password harus mengandung huruf besar, huruf kecil, dan angka."),
];

const loginValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email wajib diisi.")
    .isEmail().withMessage("Format email tidak valid.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password wajib diisi."),
];

module.exports = { registerValidator, loginValidator };
