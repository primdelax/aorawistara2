const express = require("express");
const router = express.Router();
const { register, login, logout, getMe } = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { registerValidator, loginValidator } = require("../validators/authValidator");

// POST /api/auth/register
router.post("/register", registerValidator, validate, register);

// POST /api/auth/login
router.post("/login", loginValidator, validate, login);

// POST /api/auth/logout
router.post("/logout", verifyToken, logout);

// GET /api/auth/me
router.get("/me", verifyToken, getMe);

module.exports = router;
