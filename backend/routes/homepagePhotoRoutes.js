const express = require("express");
const router = express.Router();
const { getAll, create, update, remove } = require("../controllers/homepagePhotoController");
const { verifyToken, isAdmin } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { homepagePhotoValidator, updateHomepagePhotoValidator } = require("../validators/contentValidator");
const { uploadHomepage } = require("../utils/upload");

router.get("/", getAll);

router.post(
  "/",
  verifyToken,
  isAdmin,
  uploadHomepage.single("image"),
  homepagePhotoValidator,
  validate,
  create
);

router.put(
  "/:id",
  verifyToken,
  isAdmin,
  uploadHomepage.single("image"),
  updateHomepagePhotoValidator,
  validate,
  update
);

router.delete("/:id", verifyToken, isAdmin, remove);

module.exports = router;
