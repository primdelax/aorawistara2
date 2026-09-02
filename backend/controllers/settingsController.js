// backend/controllers/settingsController.js
const { pool } = require('../config/database')
const { isSupabase } = require('../config/dataProvider')
const supabase = require('../services/supabaseService')
const { sendSuccess, sendCreated, sendError, sendNotFound } = require('../utils/response')

const ALLOWED_KEYS = [
  'site_name', 'tagline', 'address', 'phone', 'email', 'instagram', 'facebook', 'youtube',
  'tiktok', 'maps_url', 'operational_hours', 'logo_url', 'about_text',
  'desc_intensif', 'desc_short_course', 'desc_reguler',
  'visi', 'misi', 'keunggulan',
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
  visi: 'Menjadi lembaga pelatihan terdepan yang melahirkan pribadi luar biasa — kreatif, kompeten, dan percaya diri.',
  misi: JSON.stringify([
    { id: 1, num: '01', title: 'Pelatihan Berkualitas', desc: 'Menyelenggarakan pelatihan berbasis praktik dengan kurikulum yang terus diperbarui sesuai kebutuhan industri.' },
    { id: 2, num: '02', title: 'Pengembangan Karakter', desc: 'Membangun pribadi berdaya saing yang berani tampil beda dengan integritas dan kepercayaan diri.' },
    { id: 3, num: '03', title: 'Pelestarian Budaya', desc: 'Menjadi rumah bagi seni dan budaya lokal melalui program menari, batik, dan ekspresi kreatif lainnya.' },
    { id: 4, num: '04', title: 'Komunitas yang Kuat', desc: 'Menumbuhkan jaringan alumni dan komunitas yang saling mendukung di dunia kerja dan kehidupan.' },
  ]),
  keunggulan: JSON.stringify([
    { id: 1, icon: 'Sparkles', title: 'Beragam Program', desc: 'Dari barista hingga seni budaya — pilihan luas sesuai minat dan bakat.' },
    { id: 2, icon: 'Award', title: 'Pengajar Berpengalaman', desc: 'Praktisi profesional yang membimbing langsung dengan standar industri.' },
    { id: 3, icon: 'Users', title: 'Berbasis Komunitas', desc: 'Bergabung dengan komunitas alumni yang aktif dan saling mendukung.' },
    { id: 4, icon: 'Heart', title: 'Berkarakter & Kreatif', desc: 'Lebih dari sekadar skill — kami membentuk pribadi luar biasa.' },
  ]),
}

// ─── Helper: load raw settings from DB ──────────────────────────
const loadRawSettings = async () => {
  if (isSupabase) {
    const rows = await supabase.list('settings', { select: 'setting_key,setting_value' })
    const data = { ...DEFAULT_SETTINGS }
    rows.forEach(r => { data[r.setting_key] = r.setting_value })
    return data
  }
  const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings')
  const data = { ...DEFAULT_SETTINGS }
  rows.forEach(r => { data[r.setting_key] = r.setting_value })
  return data
}

// ─── Helper: save a single key-value to DB ───────────────────────
const saveKey = async (key, value) => {
  if (isSupabase) {
    await supabase.upsertByKey('settings', 'setting_key', [{ setting_key: key, setting_value: value }])
    return
  }
  await pool.query(
    'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
    [key, value]
  )
}

// ─── Helper: parse JSON field safely ────────────────────────────
const parseJsonField = (raw, fallback = []) => {
  try { return JSON.parse(raw) } catch { return fallback }
}

const getSettings = async (req, res, next) => {
  try {
    const data = await loadRawSettings()
    return res.json({ success: true, message: 'Pengaturan berhasil diambil.', data })
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
      const data = await loadRawSettings()
      return res.json({ success: true, message: 'Pengaturan berhasil disimpan.', data })
    }

    for (const [key, value] of entries) {
      await pool.query(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
        [key, value ?? '']
      )
    }

    const data = await loadRawSettings()
    res.json({ success: true, message: 'Pengaturan berhasil disimpan.', data })
  } catch (error) { next(error) }
}

// ═══════════════════════════════════════════════════════════
// VISI
// ═══════════════════════════════════════════════════════════

const getVisi = async (req, res, next) => {
  try {
    const raw = await loadRawSettings()
    return sendSuccess(res, 'Visi berhasil diambil.', { visi: raw.visi || DEFAULT_SETTINGS.visi })
  } catch (error) { next(error) }
}

const updateVisi = async (req, res, next) => {
  try {
    const { visi } = req.body
    if (!visi || !visi.trim()) return sendError(res, 'Teks visi wajib diisi.', 400)
    await saveKey('visi', visi.trim())
    return sendSuccess(res, 'Visi berhasil diperbarui.', { visi: visi.trim() })
  } catch (error) { next(error) }
}

// ═══════════════════════════════════════════════════════════
// MISI (CRUD array items)
// ═══════════════════════════════════════════════════════════

const getMisi = async (req, res, next) => {
  try {
    const raw = await loadRawSettings()
    const misi = parseJsonField(raw.misi, parseJsonField(DEFAULT_SETTINGS.misi, []))
    return sendSuccess(res, 'Misi berhasil diambil.', misi)
  } catch (error) { next(error) }
}

const createMisi = async (req, res, next) => {
  try {
    const { title, desc } = req.body
    if (!title || !title.trim()) return sendError(res, 'Judul misi wajib diisi.', 400)
    if (!desc || !desc.trim()) return sendError(res, 'Deskripsi misi wajib diisi.', 400)

    const raw = await loadRawSettings()
    const misi = parseJsonField(raw.misi, parseJsonField(DEFAULT_SETTINGS.misi, []))
    const newId = misi.length > 0 ? Math.max(...misi.map(m => m.id)) + 1 : 1
    const newItem = { id: newId, num: String(newId).padStart(2, '0'), title: title.trim(), desc: desc.trim() }
    misi.push(newItem)
    await saveKey('misi', JSON.stringify(misi))
    return sendCreated(res, 'Misi berhasil ditambahkan.', newItem)
  } catch (error) { next(error) }
}

const updateMisi = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const { title, desc } = req.body

    const raw = await loadRawSettings()
    const misi = parseJsonField(raw.misi, parseJsonField(DEFAULT_SETTINGS.misi, []))
    const idx = misi.findIndex(m => m.id === id)
    if (idx === -1) return sendNotFound(res, 'Item misi tidak ditemukan.')

    if (title !== undefined) misi[idx].title = title.trim()
    if (desc !== undefined) misi[idx].desc = desc.trim()
    await saveKey('misi', JSON.stringify(misi))
    return sendSuccess(res, 'Misi berhasil diperbarui.', misi[idx])
  } catch (error) { next(error) }
}

const deleteMisi = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const raw = await loadRawSettings()
    const misi = parseJsonField(raw.misi, parseJsonField(DEFAULT_SETTINGS.misi, []))
    const idx = misi.findIndex(m => m.id === id)
    if (idx === -1) return sendNotFound(res, 'Item misi tidak ditemukan.')
    misi.splice(idx, 1)
    await saveKey('misi', JSON.stringify(misi))
    return sendSuccess(res, 'Misi berhasil dihapus.')
  } catch (error) { next(error) }
}

// ═══════════════════════════════════════════════════════════
// KEUNGGULAN (CRUD array items)
// ═══════════════════════════════════════════════════════════

const getKeunggulan = async (req, res, next) => {
  try {
    const raw = await loadRawSettings()
    const keunggulan = parseJsonField(raw.keunggulan, parseJsonField(DEFAULT_SETTINGS.keunggulan, []))
    return sendSuccess(res, 'Keunggulan berhasil diambil.', keunggulan)
  } catch (error) { next(error) }
}

const createKeunggulan = async (req, res, next) => {
  try {
    const { icon, title, desc } = req.body
    if (!title || !title.trim()) return sendError(res, 'Judul keunggulan wajib diisi.', 400)
    if (!desc || !desc.trim()) return sendError(res, 'Deskripsi keunggulan wajib diisi.', 400)

    const raw = await loadRawSettings()
    const keunggulan = parseJsonField(raw.keunggulan, parseJsonField(DEFAULT_SETTINGS.keunggulan, []))
    const newId = keunggulan.length > 0 ? Math.max(...keunggulan.map(k => k.id)) + 1 : 1
    const newItem = { id: newId, icon: icon || 'Sparkles', title: title.trim(), desc: desc.trim() }
    keunggulan.push(newItem)
    await saveKey('keunggulan', JSON.stringify(keunggulan))
    return sendCreated(res, 'Keunggulan berhasil ditambahkan.', newItem)
  } catch (error) { next(error) }
}

const updateKeunggulan = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const { icon, title, desc } = req.body

    const raw = await loadRawSettings()
    const keunggulan = parseJsonField(raw.keunggulan, parseJsonField(DEFAULT_SETTINGS.keunggulan, []))
    const idx = keunggulan.findIndex(k => k.id === id)
    if (idx === -1) return sendNotFound(res, 'Item keunggulan tidak ditemukan.')

    if (icon !== undefined) keunggulan[idx].icon = icon
    if (title !== undefined) keunggulan[idx].title = title.trim()
    if (desc !== undefined) keunggulan[idx].desc = desc.trim()
    await saveKey('keunggulan', JSON.stringify(keunggulan))
    return sendSuccess(res, 'Keunggulan berhasil diperbarui.', keunggulan[idx])
  } catch (error) { next(error) }
}

const deleteKeunggulan = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const raw = await loadRawSettings()
    const keunggulan = parseJsonField(raw.keunggulan, parseJsonField(DEFAULT_SETTINGS.keunggulan, []))
    const idx = keunggulan.findIndex(k => k.id === id)
    if (idx === -1) return sendNotFound(res, 'Item keunggulan tidak ditemukan.')
    keunggulan.splice(idx, 1)
    await saveKey('keunggulan', JSON.stringify(keunggulan))
    return sendSuccess(res, 'Keunggulan berhasil dihapus.')
  } catch (error) { next(error) }
}

module.exports = {
  getSettings, updateSettings,
  getVisi, updateVisi,
  getMisi, createMisi, updateMisi, deleteMisi,
  getKeunggulan, createKeunggulan, updateKeunggulan, deleteKeunggulan,
}
