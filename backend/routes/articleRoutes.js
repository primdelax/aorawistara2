const express = require("express");
const router = express.Router();
const { getAll, getOne, getBySlug, create, update, remove } = require("../controllers/articleController");
const { verifyToken, isAdmin, optionalAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { articleValidator, updateArticleValidator } = require("../validators/contentValidator");
const { uploadArticle } = require("../utils/upload");

// GET /api/articles (publik, dengan optionalAuth untuk admin bisa lihat draft)
router.get("/", optionalAuth, getAll);

// GET /api/articles/slug/:slug
router.get("/slug/:slug", optionalAuth, getBySlug);

// GET /api/articles/:id
router.get("/:id", optionalAuth, getOne);

// POST /api/articles  (admin only)
router.post(
  "/",
  verifyToken,
  isAdmin,
  uploadArticle.single("cover_image"),
  articleValidator,
  validate,
  create
);

// PUT /api/articles/:id  (admin only)
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  uploadArticle.single("cover_image"),
  updateArticleValidator,
  validate,
  update
);

// DELETE /api/articles/:id  (admin only)
router.delete("/:id", verifyToken, isAdmin, remove);

module.exports = router;
