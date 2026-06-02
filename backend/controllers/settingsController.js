// backend/controllers/settingsController.js
const { pool } = require('../config/database')
const { isSupabase } = require('../config/dataProvider')
const supabase = require('../services/supabaseService')

const ALLOWED_KEYS = [
  'site_name', 'tagline', 'address', 'phone', 'email', 'instagram', 'facebook', 'youtube',
  'tiktok', 'maps_url', 'operational_hours', 'logo_url', 'about_text',
  'desc_intensif', 'desc_short_course', 'desc_reguler',
]

const DEFAULT_SETTINGS = {
  site_name: 'Aora',
  tagline: 'Lembaga Kursus',
  address: 'Jl Tambak Medokan Ayu 6-C/56B',
  phone: '0822 2591 6619 (pak hari)',
  email: 'info@aora.id',
  instagram: 'https://instagram.com/aora',
  facebook: 'https://facebook.com/aora',
  youtube: 'https://youtube.com/@aora',
  tiktok: 'https://tiktok.com/@aora',
  maps_url: 'https://share.google/SVdjuvR7RWXbMcyMe',
  operational_hours: 'Senin-Jumat 10.00-17.00',
  logo_url: null,
  about_text: 'Aora adalah Lembaga Kursus yang membentuk individu berdaya saing melalui kombinasi lifeskill praktis dan ekspresi seni.',
  desc_intensif: 'Program pembelajaran intensif dengan jadwal padat dan materi mendalam. Cocok untuk peserta yang ingin menguasai keahlian dalam waktu singkat dengan bimbingan instruktur berpengalaman.',
  desc_short_course: 'Kelas singkat yang fokus pada Program Membatik dan Fotografi, dirancang untuk praktik kreatif dan hasil karya nyata dalam waktu yang lebih ringkas.',
  desc_reguler: 'Program pembelajaran rutin dengan jadwal fleksibel dan biaya terjangkau. Ideal bagi peserta yang ingin belajar secara konsisten tanpa tekanan waktu yang ketat.',
}

const getSettings = async (req, res, next) => {
  try {
    if (isSupabase) {
      const rows = await supabase.list('settings', { select: 'setting_key,setting_value' })
      const data = { ...DEFAULT_SETTINGS }
      rows.forEach(r => { data[r.setting_key] = r.setting_value })
      return res.json({ success: true, message: 'Pengaturan berhasil diambil.', data })
    }

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

    if (isSupabase) {
      await supabase.upsertByKey('settings', 'setting_key', entries.map(([setting_key, setting_value]) => ({
        setting_key,
        setting_value: setting_value ?? '',
      })))
      const rows = await supabase.list('settings', { select: 'setting_key,setting_value' })
      const data = { ...DEFAULT_SETTINGS }
      rows.forEach(r => { data[r.setting_key] = r.setting_value })
      return res.json({ success: true, message: 'Pengaturan berhasil disimpan.', data })
    }

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
