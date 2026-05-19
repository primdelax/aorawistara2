const { body } = require("express-validator");

const programValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Judul program wajib diisi.")
    .isLength({ min: 3, max: 150 }).withMessage("Judul program harus antara 3-150 karakter."),

  body("description")
    .trim()
    .notEmpty().withMessage("Deskripsi program wajib diisi.")
    .isLength({ min: 10 }).withMessage("Deskripsi minimal 10 karakter."),

  body("duration")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Durasi maksimal 100 karakter."),

  body("price")
    .optional()
    .isFloat({ min: 0 }).withMessage("Harga tidak boleh negatif."),

  body("status")
    .optional()
    .isIn(["aktif", "tidak_aktif"]).withMessage("Status harus 'aktif' atau 'tidak_aktif'."),

  body("category_id")
    .optional()
    .isInt({ min: 1 }).withMessage("Category ID tidak valid."),
];

const updateProgramValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 }).withMessage("Judul program harus antara 3-150 karakter."),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage("Deskripsi minimal 10 karakter."),

  body("duration")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Durasi maksimal 100 karakter."),

  body("price")
    .optional()
    .isFloat({ min: 0 }).withMessage("Harga tidak boleh negatif."),

  body("status")
    .optional()
    .isIn(["aktif", "tidak_aktif"]).withMessage("Status harus 'aktif' atau 'tidak_aktif'."),

  body("category_id")
    .optional()
    .isInt({ min: 1 }).withMessage("Category ID tidak valid."),
];

module.exports = { programValidator, updateProgramValidator };
