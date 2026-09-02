// backend/routes/settingsRoutes.js
const express = require('express')
const router = express.Router()
const {
  getSettings, updateSettings,
  getVisi, updateVisi,
  getMisi, createMisi, updateMisi, deleteMisi,
  getKeunggulan, createKeunggulan, updateKeunggulan, deleteKeunggulan,
} = require('../controllers/settingsController')
const { verifyToken, isAdmin } = require('../middleware/auth')

// General settings
router.get('/', getSettings)                          // publik
router.put('/', verifyToken, isAdmin, updateSettings) // admin only

// Visi
router.get('/visi', getVisi)
router.put('/visi', verifyToken, isAdmin, updateVisi)

// Misi
router.get('/misi', getMisi)
router.post('/misi', verifyToken, isAdmin, createMisi)
router.put('/misi/:id', verifyToken, isAdmin, updateMisi)
router.delete('/misi/:id', verifyToken, isAdmin, deleteMisi)

// Keunggulan
router.get('/keunggulan', getKeunggulan)
router.post('/keunggulan', verifyToken, isAdmin, createKeunggulan)
router.put('/keunggulan/:id', verifyToken, isAdmin, updateKeunggulan)
router.delete('/keunggulan/:id', verifyToken, isAdmin, deleteKeunggulan)

module.exports = router
