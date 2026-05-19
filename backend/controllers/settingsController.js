// backend/controllers/settingsController.js
const { pool } = require('../config/database')

const ALLOWED_KEYS = ['site_name', 'tagline', 'address', 'phone', 'email', 'instagram', 'facebook', 'youtube', 'logo_url', 'about_text']

const DEFAULT_SETTINGS = {
  site_name: 'AORA Wistara',
  tagline: 'Lembaga Kursus & Pelatihan',
  address: '', phone: '', email: '', instagram: '', facebook: '',
  youtube: '', logo_url: null, about_text: '',
}

const getSettings = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings')
    const data = { ...DEFAULT_SETTINGS }
    rows.forEach(r => { data[r.setting_key] = r.setting_value })
    res.json({ success: true, message: 'Pengaturan berhasil diambil.', data })
  } catch (error) { next(error) }
}

const updateSettings = async (req, res, next) => {
  try {
    const entries = Object.entries(req.body).filter(([k]) => ALLOWED_KEYS.includes(k))
    if (!entries.length) return res.status(400).json({ success: false, message: 'Tidak ada data valid.' })

    for (const [key, value] of entries) {
      await pool.query(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
        [key, value ?? '']
      )
    }

    const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings')
    const data = { ...DEFAULT_SETTINGS }
    rows.forEach(r => { data[r.setting_key] = r.setting_value })
    res.json({ success: true, message: 'Pengaturan berhasil disimpan.', data })
  } catch (error) { next(error) }
}

module.exports = { getSettings, updateSettings }
