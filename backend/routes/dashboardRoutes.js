const express = require("express");
const router = express.Router();
const { getStats, getUsers, toggleUserStatus } = require("../controllers/dashboardController");
const { verifyToken, isAdmin } = require("../middleware/auth");

// Semua route dashboard butuh auth + admin
router.use(verifyToken, isAdmin);

// GET /api/dashboard/stats
router.get("/stats", getStats);

// GET /api/dashboard/users
router.get("/users", getUsers);

// PATCH /api/dashboard/users/:id/toggle-status
router.patch("/users/:id/toggle-status", toggleUserStatus);

module.exports = router;
