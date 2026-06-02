const express = require("express");
const router = express.Router();
const { getStats, getUsers, createUser, updateUser, deleteUser, toggleUserStatus } = require("../controllers/dashboardController");
const { verifyToken, isAdmin } = require("../middleware/auth");

// Semua route dashboard butuh auth + admin
router.use(verifyToken, isAdmin);

// GET /api/dashboard/stats
router.get("/stats", getStats);

// GET /api/dashboard/users
router.get("/users", getUsers);

// POST /api/dashboard/users
router.post("/users", createUser);

// PUT /api/dashboard/users/:id
router.put("/users/:id", updateUser);

// DELETE /api/dashboard/users/:id
router.delete("/users/:id", deleteUser);

// PATCH /api/dashboard/users/:id/toggle-status
router.patch("/users/:id/toggle-status", toggleUserStatus);

module.exports = router;
