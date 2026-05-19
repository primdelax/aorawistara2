const express = require("express");
const router = express.Router();
const { getAll, getOne, create, update, remove } = require("../controllers/galleryController");
const { verifyToken, isAdmin } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { galleryValidator, updateGalleryValidator } = require("../validators/contentValidator");
const { uploadGallery } = require("../utils/upload");

// GET /api/galleries
router.get("/", getAll);

// GET /api/galleries/:id
router.get("/:id", getOne);

// POST /api/galleries  (admin only)
router.post(
  "/",
  verifyToken,
  isAdmin,
  uploadGallery.single("image"),
  galleryValidator,
  validate,
  create
);

// PUT /api/galleries/:id  (admin only)
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  uploadGallery.single("image"),
  updateGalleryValidator,
  validate,
  update
);

// DELETE /api/galleries/:id  (admin only)
router.delete("/:id", verifyToken, isAdmin, remove);

module.exports = router;
