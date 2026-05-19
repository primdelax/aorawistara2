const express = require("express");
const router = express.Router();
const { getAll, getOne, create, update, remove } = require("../controllers/categoryController");
const { verifyToken, isAdmin } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { body } = require("express-validator");

const categoryValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Nama kategori wajib diisi.")
    .isLength({ min: 2, max: 100 }).withMessage("Nama kategori harus antara 2-100 karakter."),
  body("description").optional().trim(),
];

// GET /api/categories
router.get("/", getAll);

// GET /api/categories/:id
router.get("/:id", getOne);

// POST /api/categories  (admin only)
router.post("/", verifyToken, isAdmin, categoryValidator, validate, create);

// PUT /api/categories/:id  (admin only)
router.put("/:id", verifyToken, isAdmin, categoryValidator, validate, update);

// DELETE /api/categories/:id  (admin only)
router.delete("/:id", verifyToken, isAdmin, remove);

module.exports = router;
