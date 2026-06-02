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

// ============ HOMEPAGE PHOTO VALIDATORS ============
const homepagePhotoValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Judul foto wajib diisi.")
    .isLength({ min: 2, max: 150 }).withMessage("Judul harus antara 2-150 karakter."),

  body("status")
    .optional()
    .isIn(["aktif", "tidak_aktif"]).withMessage("Status harus 'aktif' atau 'tidak_aktif'."),

  body("sort_order")
    .optional()
    .isInt({ min: 0 }).withMessage("Urutan harus berupa angka 0 atau lebih."),
];

const updateHomepagePhotoValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage("Judul harus antara 2-150 karakter."),

  body("status")
    .optional()
    .isIn(["aktif", "tidak_aktif"]).withMessage("Status harus 'aktif' atau 'tidak_aktif'."),

  body("sort_order")
    .optional()
    .isInt({ min: 0 }).withMessage("Urutan harus berupa angka 0 atau lebih."),
];

// ============ FEATURED PROGRAM VALIDATORS ============
const featuredProgramValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Judul program unggulan wajib diisi.")
    .isLength({ min: 3, max: 150 }).withMessage("Judul harus antara 3-150 karakter."),

  body("description")
    .trim()
    .notEmpty().withMessage("Deskripsi wajib diisi.")
    .isLength({ min: 10, max: 500 }).withMessage("Deskripsi harus antara 10-500 karakter."),

  body("accent")
    .optional()
    .isIn(["0", "1", "true", "false", true, false]).withMessage("Accent tidak valid."),

  body("status")
    .optional()
    .isIn(["aktif", "tidak_aktif"]).withMessage("Status harus 'aktif' atau 'tidak_aktif'."),

  body("sort_order")
    .optional()
    .isInt({ min: 0 }).withMessage("Urutan harus berupa angka 0 atau lebih."),
];

const updateFeaturedProgramValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 }).withMessage("Judul harus antara 3-150 karakter."),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 }).withMessage("Deskripsi harus antara 10-500 karakter."),

  body("accent")
    .optional()
    .isIn(["0", "1", "true", "false", true, false]).withMessage("Accent tidak valid."),

  body("status")
    .optional()
    .isIn(["aktif", "tidak_aktif"]).withMessage("Status harus 'aktif' atau 'tidak_aktif'."),

  body("sort_order")
    .optional()
    .isInt({ min: 0 }).withMessage("Urutan harus berupa angka 0 atau lebih."),
];

// ============ TESTIMONIAL VALIDATORS ============
const testimonialValidator = [
  body("alumni_name")
    .trim()
    .notEmpty().withMessage("Nama alumni wajib diisi.")
    .isLength({ min: 2, max: 120 }).withMessage("Nama alumni harus antara 2-120 karakter."),

  body("profile")
    .trim()
    .notEmpty().withMessage("Profil alumni wajib diisi.")
    .isLength({ min: 3, max: 150 }).withMessage("Profil alumni harus antara 3-150 karakter."),

  body("comment")
    .trim()
    .notEmpty().withMessage("Komentar testimoni wajib diisi.")
    .isLength({ min: 10, max: 500 }).withMessage("Komentar harus antara 10-500 karakter."),

  body("status")
    .optional()
    .isIn(["aktif", "tidak_aktif"]).withMessage("Status harus 'aktif' atau 'tidak_aktif'."),

  body("sort_order")
    .optional()
    .isInt({ min: 0 }).withMessage("Urutan harus berupa angka 0 atau lebih."),
];

const updateTestimonialValidator = [
  body("alumni_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 }).withMessage("Nama alumni harus antara 2-120 karakter."),

  body("profile")
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 }).withMessage("Profil alumni harus antara 3-150 karakter."),

  body("comment")
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 }).withMessage("Komentar harus antara 10-500 karakter."),

  body("status")
    .optional()
    .isIn(["aktif", "tidak_aktif"]).withMessage("Status harus 'aktif' atau 'tidak_aktif'."),

  body("sort_order")
    .optional()
    .isInt({ min: 0 }).withMessage("Urutan harus berupa angka 0 atau lebih."),
];

module.exports = {
  articleValidator,
  updateArticleValidator,
  galleryValidator,
  updateGalleryValidator,
  homepagePhotoValidator,
  updateHomepagePhotoValidator,
  featuredProgramValidator,
  updateFeaturedProgramValidator,
  testimonialValidator,
  updateTestimonialValidator,
};
