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
  body("username")
    .trim()
    .notEmpty().withMessage("Username wajib diisi.")
    .matches(/^[A-Za-z0-9]+$/).withMessage("Username hanya boleh berisi huruf dan angka tanpa spasi.")
    .isLength({ min: 3, max: 32 }).withMessage("Username harus antara 3-32 karakter."),

  body("password")
    .notEmpty().withMessage("Password wajib diisi."),
];

module.exports = { registerValidator, loginValidator };
