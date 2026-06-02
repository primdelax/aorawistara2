const express = require("express");
const router = express.Router();
const { getAll, create, update, remove } = require("../controllers/featuredProgramController");
const { verifyToken, isAdmin } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { featuredProgramValidator, updateFeaturedProgramValidator } = require("../validators/contentValidator");
const { uploadFeatured } = require("../utils/upload");

router.get("/", getAll);

router.post(
  "/",
  verifyToken,
  isAdmin,
  uploadFeatured.single("image"),
  featuredProgramValidator,
  validate,
  create
);

router.put(
  "/:id",
  verifyToken,
  isAdmin,
  uploadFeatured.single("image"),
  updateFeaturedProgramValidator,
  validate,
  update
);

router.delete("/:id", verifyToken, isAdmin, remove);

module.exports = router;
