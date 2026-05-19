const { body } = require("express-validator");

// ============ ARTICLE VALIDATORS ============
const articleValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Judul artikel wajib diisi.")
    .isLength({ min: 5, max: 200 }).withMessage("Judul artikel harus antara 5-200 karakter."),

  body("content")
    .trim()
    .notEmpty().withMessage("Konten artikel wajib diisi.")
    .isLength({ min: 20 }).withMessage("Konten minimal 20 karakter."),

  body("excerpt")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Excerpt maksimal 500 karakter."),

  body("status")
    .optional()
    .isIn(["draft", "published"]).withMessage("Status harus 'draft' atau 'published'."),

  body("category_id")
    .optional()
    .isInt({ min: 1 }).withMessage("Category ID tidak valid."),
];

const updateArticleValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage("Judul artikel harus antara 5-200 karakter."),

  body("content")
    .optional()
    .trim()
    .isLength({ min: 20 }).withMessage("Konten minimal 20 karakter."),

  body("excerpt")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Excerpt maksimal 500 karakter."),

  body("status")
    .optional()
    .isIn(["draft", "published"]).withMessage("Status harus 'draft' atau 'published'."),

  body("category_id")
    .optional()
    .isInt({ min: 1 }).withMessage("Category ID tidak valid."),
];

// ============ GALLERY VALIDATORS ============
const galleryValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Judul galeri wajib diisi.")
    .isLength({ min: 2, max: 150 }).withMessage("Judul harus antara 2-150 karakter."),

  body("caption")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Caption maksimal 500 karakter."),

  body("category")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Kategori maksimal 100 karakter."),

  body("program_id")
    .optional()
    .isInt({ min: 1 }).withMessage("Program ID tidak valid."),
];

const updateGalleryValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage("Judul harus antara 2-150 karakter."),

  body("caption")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Caption maksimal 500 karakter."),

  body("category")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Kategori maksimal 100 karakter."),

  body("program_id")
    .optional()
    .isInt({ min: 1 }).withMessage("Program ID tidak valid."),
];

module.exports = {
  articleValidator,
  updateArticleValidator,
  galleryValidator,
  updateGalleryValidator,
};
