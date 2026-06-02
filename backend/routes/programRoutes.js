const express = require("express");
const router = express.Router();
const { getAll, getOne, getBySlug, create, update, remove, toggleFeatured } = require("../controllers/programController");
const { verifyToken, isAdmin } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { programValidator, updateProgramValidator } = require("../validators/programValidator");
const { uploadProgram } = require("../utils/upload");

// GET /api/programs
router.get("/", getAll);

// GET /api/programs/slug/:slug
router.get("/slug/:slug", getBySlug);

// GET /api/programs/:id
router.get("/:id", getOne);

// POST /api/programs  (admin only)
router.post(
  "/",
  verifyToken,
  isAdmin,
  uploadProgram.single("image"),
  programValidator,
  validate,
  create
);

// PUT /api/programs/:id  (admin only)
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  uploadProgram.single("image"),
  updateProgramValidator,
  validate,
  update
);

// PATCH /api/programs/:id/featured (admin only)
router.patch("/:id/featured", verifyToken, isAdmin, toggleFeatured);

// DELETE /api/programs/:id  (admin only)
router.delete("/:id", verifyToken, isAdmin, remove);

module.exports = router;
