const express = require("express");
const router = express.Router();
const { getAll, create, update, remove } = require("../controllers/testimonialController");
const { verifyToken, isAdmin } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { testimonialValidator, updateTestimonialValidator } = require("../validators/contentValidator");
const { uploadTestimonial } = require("../utils/upload");

router.get("/", getAll);

router.post(
  "/",
  verifyToken,
  isAdmin,
  uploadTestimonial.single("image"),
  testimonialValidator,
  validate,
  create
);

router.put(
  "/:id",
  verifyToken,
  isAdmin,
  uploadTestimonial.single("image"),
  updateTestimonialValidator,
  validate,
  update
);

router.delete("/:id", verifyToken, isAdmin, remove);

module.exports = router;
