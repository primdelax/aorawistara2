// backend/routes/settingsRoutes.js
const express = require('express')
const router = express.Router()
const { getSettings, updateSettings } = require('../controllers/settingsController')
const { verifyToken, isAdmin } = require('../middleware/auth')

router.get('/', getSettings)                        // publik
router.put('/', verifyToken, isAdmin, updateSettings) // admin only

module.exports = router
