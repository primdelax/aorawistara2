// src/app/components/admin/AdminProgram.tsx
import { useState, useEffect, useRef } from 'react'
import { programApi, settingsApi, type Program, type ProgramSchedule } from '../../lib/api'
import { Plus, Pencil, Trash2, Search, X, Check, BookOpen, RefreshCw, Image as ImageIcon, Zap, GraduationCap, Calendar, Star } from 'lucide-react'

// ─── Definisi 3 jenis program ──────────────────────────────────────
const PROGRAM_TYPES = [
  {
    key: 'intensif',
    label: 'Program Intensif',
    desc: 'Program pembelajaran intensif dengan jadwal padat dan materi mendalam. Cocok untuk peserta yang ingin menguasai keahlian dalam waktu singkat dengan bimbingan instruktur berpengalaman.',
    icon: Zap,
    bg: 'linear-gradient(135deg, #0A1F44 0%, #1a3a6b 100%)',
    accent: '#E63946',
    textColor: 'white',
    subColor: 'rgba(255,255,255,0.65)',
    badgeBg: 'rgba(230,57,70,0.2)',
    badgeText: '#ff8a8f',
    iconBg: 'rgba(230,57,70,0.18)',
  },
  {
    key: 'short_course',
    label: 'Short Course',
    desc: 'Kelas singkat yang fokus pada Program Membatik dan Fotografi, dirancang untuk praktik kreatif dan hasil karya nyata dalam waktu yang lebih ringkas.',
    icon: GraduationCap,
    bg: 'linear-gradient(135deg, #E63946 0%, #b5202d 100%)',
    accent: '#fff',
    textColor: 'white',
    subColor: 'rgba(255,255,255,0.65)',
    badgeBg: 'rgba(255,255,255,0.15)',
    badgeText: 'rgba(255,255,255,0.9)',
    iconBg: 'rgba(255,255,255,0.15)',
  },
  {
    key: 'reguler',
    label: 'Program Reguler',
    desc: 'Program pembelajaran rutin dengan jadwal fleksibel dan biaya terjangkau. Ideal bagi peserta yang ingin belajar secara konsisten tanpa tekanan waktu yang ketat.',
    icon: Calendar,
    bg: 'linear-gradient(135deg, #1d7a5f 0%, #134f3e 100%)',
    accent: '#4dd9ac',
    textColor: 'white',
    subColor: 'rgba(255,255,255,0.65)',
    badgeBg: 'rgba(77,217,172,0.2)',
    badgeText: '#4dd9ac',
    iconBg: 'rgba(77,217,172,0.18)',
  },
]

type ScheduleFormRow = Pick<ProgramSchedule, 'day' | 'time' | 'note'>

const emptySchedule = (): ScheduleFormRow => ({ day: '', time: '', note: '' })

const getProgramTypeLabel = (type: string) =>
  PROGRAM_TYPES.find(pt => pt.key === type)?.label ?? 'Program Reguler'

export function AdminProgram() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Program | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Program | null>(null)
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [formError, setFormError] = useState('')

  const [form, setForm] = useState({ title: '', description: '', duration: '', price: '0', status: 'aktif', program_type: 'reguler' })
  const [schedules, setSchedules] = useState<ScheduleFormRow[]>([emptySchedule()])
  const [imgFile, setImgFile] = useState<File | null>(null)
  const [imgPreview, setImgPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string | null>(null)
  const [siteSettings, setSiteSettings] = useState<any>(null)
  const [editingDesc, setEditingDesc] = useState<{ key: string; label: string; desc: string } | null>(null)
  const [savingDesc, setSavingDesc] = useState(false)

  const showToast = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  const load = async () => {
    setLoading(true)
    try {
      const progs = await programApi.getAll({ search: search || undefined })
      setPrograms(progs)
    } catch (e: unknown) {
      showToast('err', e instanceof Error ? e.message : 'Gagal memuat data')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search])

  useEffect(() => {
    settingsApi.get().then(setSiteSettings).catch(() => { /* Abaikan jika gagal */ })
  }, [])

  const getDesc = (key: string) => {
    if (siteSettings) {
      if (key === 'intensif' && siteSettings.desc_intensif) return siteSettings.desc_intensif
      if (key === 'short_course' && siteSettings.desc_short_course) return siteSettings.desc_short_course
      if (key === 'reguler' && siteSettings.desc_reguler) return siteSettings.desc_reguler
    }
    return PROGRAM_TYPES.find(pt => pt.key === key)?.desc ?? ''
  }

  const openAdd = (programType = 'reguler') => {
    setEditing(null)
    setForm({ title: '', description: '', duration: '', price: '0', status: 'aktif', program_type: programType })
    setSchedules([emptySchedule()])
    setImgFile(null); setImgPreview(null); setFormError(''); setShowForm(true)
  }

  const openEdit = (p: Program) => {
    setEditing(p)
    setForm({
      title: p.title,
      description: p.description,
      duration: p.duration ?? '',
      price: String(p.price),
      status: p.status,
      program_type: p.program_type ?? 'reguler',
    })
    setSchedules(p.schedules?.length ? p.schedules.map(s => ({ day: s.day, time: s.time, note: s.note ?? '' })) : [emptySchedule()])
    setImgFile(null); setImgPreview(p.image_url); setFormError(''); setShowForm(true)
  }

  const updateSchedule = (index: number, key: keyof ScheduleFormRow, value: string) => {
    setSchedules(rows => rows.map((row, i) => i === index ? { ...row, [key]: value } : row))
  }

  const addSchedule = () => setSchedules(rows => [...rows, emptySchedule()])

  const removeSchedule = (index: number) => {
    setSchedules(rows => rows.length === 1 ? [emptySchedule()] : rows.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!form.title.trim()) { setFormError('Judul program wajib diisi.'); return }
    if (!form.description.trim()) { setFormError('Deskripsi wajib diisi.'); return }
    const filledSchedules = schedules
      .map((item, index) => ({ ...item, day: item.day.trim(), time: item.time.trim(), note: (item.note ?? '').trim(), sort_order: index }))
      .filter(item => item.day || item.time || item.note)
    if (filledSchedules.some(item => !item.day || !item.time)) {
      setFormError('Setiap jadwal yang diisi wajib punya hari/tanggal dan jam.')
      return
    }
    setSaving(true); setFormError('')
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('description', form.description)
      if (form.duration) fd.append('duration', form.duration)
      fd.append('price', form.price || '0')
      fd.append('program_type', form.program_type)
      fd.append('status', form.status)
      fd.append('schedules', JSON.stringify(filledSchedules))
      if (imgFile) fd.append('image', imgFile)

      if (editing) { await programApi.update(editing.id, fd); showToast('ok', 'Program berhasil diperbarui!') }
      else { await programApi.create(fd); showToast('ok', 'Program berhasil ditambahkan!') }
      setShowForm(false); load()
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Gagal menyimpan')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await programApi.remove(deleteConfirm.id)
      setDeleteConfirm(null)
      showToast('ok', 'Program berhasil dihapus!')
      load()
    } catch (e: unknown) {
      showToast('err', e instanceof Error ? e.message : 'Gagal menghapus')
    }
  }

  const handleToggleFeatured = async (p: Program) => {
    try {
      const nextFeatured = !p.is_featured
      await programApi.toggleFeatured(p.id, nextFeatured)
      showToast('ok', nextFeatured ? 'Program ditambahkan ke unggulan!' : 'Program dihapus dari unggulan!')
      load()
    } catch (e: unknown) {
      showToast('err', e instanceof Error ? e.message : 'Gagal mengubah status unggulan')
    }
  }

  const filtered = programs.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesType = selectedTypeFilter ? p.program_type === selectedTypeFilter : true
    return matchesSearch && matchesType
  }).sort((a, b) => {
    const aFeatured = a.is_featured ? 1 : 0
    const bFeatured = b.is_featured ? 1 : 0
    if (aFeatured !== bFeatured) {
      return bFeatured - aFeatured
    }
    return b.id - a.id
  })

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 text-sm ${toast.type === 'ok' ? 'bg-green-600 text-white' : 'bg-[#E63946] text-white'}`} style={{ fontWeight: 700 }}>
          {toast.type === 'ok' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      {/* ── 3 Program Type Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {PROGRAM_TYPES.map((pt) => {
          const Icon = pt.icon
          const count = programs.filter(p =>
            p.program_type === pt.key
          ).length
          const isSelected = selectedTypeFilter === pt.key
          const isAnySelected = selectedTypeFilter !== null

          return (
            <div
              key={pt.key}
              onClick={() => setSelectedTypeFilter(isSelected ? null : pt.key)}
              style={{
                background: pt.bg,
                border: isSelected ? '3px solid #fff' : '3px solid transparent',
                boxShadow: isSelected ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 255, 255, 0.3)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                opacity: !isAnySelected || isSelected ? 1 : 0.45,
                filter: !isAnySelected || isSelected ? 'none' : 'grayscale(15%)',
                transform: isSelected ? 'scale(1.02)' : isAnySelected ? 'scale(0.97)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              className="rounded-3xl p-7 flex flex-col min-h-[280px] relative overflow-hidden shadow-xl group"
            >
              {/* decorative circle */}
              <div style={{ background: 'rgba(255,255,255,0.05)', width: 160, height: 160, borderRadius: '50%', position: 'absolute', right: -40, top: -40, pointerEvents: 'none' }} />
              <div style={{ background: 'rgba(255,255,255,0.04)', width: 100, height: 100, borderRadius: '50%', position: 'absolute', right: 40, bottom: -30, pointerEvents: 'none' }} />

              {/* Edit Description Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingDesc({ key: pt.key, label: pt.label, desc: getDesc(pt.key) });
                }}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                title="Edit Deskripsi Jenis Program"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>

              {/* Filter Active Badge */}
              {isSelected && (
                <span className="absolute top-6 left-1/2 -translate-x-1/2 bg-white text-[#0A1F44] text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md z-20 flex items-center gap-1" style={{ fontWeight: 900 }}>
                  <Check className="w-3 h-3 text-[#E63946]" style={{ strokeWidth: 3 }} /> Filter Aktif
                </span>
              )}

              {/* Icon + badge */}
              <div className="flex items-start justify-between mb-5 relative z-10">
                <div style={{ background: pt.iconBg, width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ color: pt.accent, width: 26, height: 26 }} />
                </div>
                <span style={{ background: pt.badgeBg, color: pt.badgeText, fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 99, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {count} program
                </span>
              </div>

              {/* Title */}
              <h2 style={{ color: pt.textColor, fontWeight: 900, fontSize: 22, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 10 }} className="relative z-10">
                {pt.label}
              </h2>

              {/* Description */}
              <p style={{ color: pt.subColor, fontSize: 13.5, lineHeight: 1.65, flex: 1 }} className="relative z-10">
                {getDesc(pt.key)}
              </p>

              {/* CTA */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openAdd(pt.key);
                }}
                style={{ marginTop: 20, background: pt.badgeBg, color: pt.badgeText, border: `1px solid ${pt.badgeText}30`, fontWeight: 800, fontSize: 13, padding: '10px 18px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, width: 'fit-content', cursor: 'pointer', transition: 'opacity 0.2s' }}
                className="relative z-10 hover:opacity-80"
              >
                <Plus style={{ width: 16, height: 16 }} />
                Tambah {pt.label.replace('Program ', '')}
              </button>
            </div>
          )
        })}
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white rounded-2xl p-4 border border-[#0A1F44]/5 flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#0A1F44]/40" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari program..."
            className="w-full bg-[#F7F7F9] pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 text-sm" />
        </div>
        <button onClick={load} className="w-11 h-11 rounded-xl bg-[#F7F7F9] flex items-center justify-center text-[#0A1F44]/60 hover:text-[#0A1F44]">
          <RefreshCw className="w-4 h-4" />
        </button>
        <button onClick={() => openAdd()}
          className="inline-flex items-center gap-2 bg-[#E63946] hover:bg-[#c42d3a] text-white px-5 py-3 rounded-xl transition-all"
          style={{ fontWeight: 800 }}>
          <Plus className="w-5 h-5" /> Tambah Program
        </button>
      </div>

      {/* ── Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl my-4">
            <div className="p-6 border-b border-[#0A1F44]/5 flex items-center justify-between">
              <h2 style={{ fontWeight: 900, fontSize: 20, color: '#0A1F44' }}>{editing ? 'Edit Program' : 'Tambah Program Baru'}</h2>
              <button onClick={() => setShowForm(false)} className="w-9 h-9 rounded-xl bg-[#F7F7F9] flex items-center justify-center hover:bg-[#0A1F44]/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {formError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{formError}</div>}

              {/* Image Upload */}
              <div>
                <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Foto Program</label>
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-[#0A1F44]/20 rounded-2xl h-44 flex items-center justify-center cursor-pointer hover:border-[#E63946]/40 overflow-hidden relative group">
                  {imgPreview
                    ? <><img src={imgPreview} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <p className="text-white text-sm font-bold">Ganti Foto</p></div></>
                    : <div className="text-center text-[#0A1F44]/40">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">Klik untuk pilih foto</p>
                        <p className="text-xs mt-1">JPG, PNG, WebP – maks 5MB</p>
                      </div>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setImgFile(f); setImgPreview(URL.createObjectURL(f)) } }} />
              </div>

              <Field label="Judul Program *" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="Pelatihan Batik Modern" />
              <div>
                <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Jenis Program *</label>
                <select value={form.program_type} onChange={e => setForm(f => ({ ...f, program_type: e.target.value }))}
                  className="w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none text-sm">
                  {PROGRAM_TYPES.map(pt => <option key={pt.key} value={pt.key}>{pt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Deskripsi *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={4} placeholder="Ini program apa dan ngapain aja di dalamnya..." className="w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 resize-none text-sm" />
              </div>
              <div>
                <Field label="Durasi" value={form.duration} onChange={v => setForm(f => ({ ...f, duration: v }))} placeholder="3 Bulan" />
              </div>
              <div className="rounded-2xl border border-[#0A1F44]/10 p-4">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[#0A1F44] text-sm" style={{ fontWeight: 900 }}>Jadwal Program</p>
                    <p className="text-[#0A1F44]/50 text-xs mt-1">Isi hari/tanggal, jam, dan catatan singkat bila perlu.</p>
                  </div>
                  <button type="button" onClick={addSchedule}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0A1F44] text-white text-xs"
                    style={{ fontWeight: 800 }}>
                    <Plus className="w-4 h-4" /> Tambah Jadwal
                  </button>
                </div>
                <div className="space-y-3">
                  {schedules.map((schedule, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.4fr_auto] gap-2 items-end">
                      <Field label="Hari / Tanggal" value={schedule.day} onChange={v => updateSchedule(index, 'day', v)} placeholder="Senin / 12 Juni" />
                      <Field label="Jam" value={schedule.time} onChange={v => updateSchedule(index, 'time', v)} placeholder="09.00 - 11.00" />
                      <Field label="Catatan" value={schedule.note ?? ''} onChange={v => updateSchedule(index, 'note', v)} placeholder="Kelas pagi / online" />
                      <button type="button" onClick={() => removeSchedule(index)}
                        className="h-11 rounded-xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center px-3 hover:bg-[#E63946] hover:text-white transition-colors"
                        aria-label="Hapus jadwal">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#0A1F44]/5 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-5 py-3 rounded-xl text-[#0A1F44]/60 hover:bg-[#F7F7F9] text-sm" style={{ fontWeight: 700 }}>Batal</button>
              <button onClick={handleSave} disabled={saving}
                className="bg-[#E63946] hover:bg-[#c42d3a] disabled:opacity-60 text-white px-7 py-3 rounded-xl text-sm flex items-center gap-2"
                style={{ fontWeight: 800 }}>
                {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Program'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-[#E63946]" />
            </div>
            <h3 style={{ fontWeight: 900, fontSize: 20, color: '#0A1F44' }} className="mb-2">Hapus Program?</h3>
            <p className="text-[#0A1F44]/60 text-sm mb-1">Anda akan menghapus:</p>
            <p className="text-[#0A1F44] text-sm mb-6" style={{ fontWeight: 800 }}>"{deleteConfirm.title}"</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteConfirm(null)} className="px-6 py-3 rounded-xl border border-[#0A1F44]/10 text-[#0A1F44] text-sm" style={{ fontWeight: 700 }}>Batal</button>
              <button onClick={handleDelete} className="bg-[#E63946] text-white px-6 py-3 rounded-xl text-sm" style={{ fontWeight: 800 }}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Program Table ── */}
      <div className="bg-white rounded-2xl overflow-x-auto border border-[#0A1F44]/5">
        <div className="px-6 py-4 border-b border-[#0A1F44]/5">
          <p className="text-[#0A1F44] text-sm" style={{ fontWeight: 800 }}>
            Semua Program <span className="text-[#0A1F44]/40 font-normal">({filtered.length} program)</span>
          </p>
        </div>
        {loading ? (
          <div className="py-16 text-center text-[#0A1F44]/40">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /><p className="text-sm">Memuat data...</p>
          </div>
        ) : (
          <table className="w-full min-w-[920px]">
            <thead className="bg-[#0A1F44] text-white">
              <tr>
                {['No', 'Program', 'Jenis', 'Durasi', 'Jadwal', 'Aksi'].map((h, i) => (
                  <th key={i} className={`px-5 py-4 text-xs uppercase tracking-widest ${i === 5 ? 'text-right' : 'text-left'}`} style={{ fontWeight: 800 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr key={p.id} className="border-t border-[#0A1F44]/5 hover:bg-[#F7F7F9] transition-colors">
                  <td className="px-5 py-4 text-[#0A1F44]/50 text-sm" style={{ fontWeight: 700 }}>{String(idx + 1).padStart(2, '0')}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {p.image_url
                        ? <img src={p.image_url} className="w-10 h-10 rounded-xl object-cover shrink-0" alt="" />
                        : <div className="w-10 h-10 rounded-xl bg-[#0A1F44]/5 flex items-center justify-center shrink-0"><BookOpen className="w-4 h-4 text-[#0A1F44]/30" /></div>}
                      <div>
                        <p className="text-[#0A1F44] text-sm" style={{ fontWeight: 800 }}>{p.title}</p>
                        {p.description && <p className="text-[#0A1F44]/45 text-xs mt-0.5 line-clamp-1">{p.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#0A1F44]/60 text-sm">{getProgramTypeLabel(p.program_type)}</td>
                  <td className="px-5 py-4 text-[#0A1F44]/60 text-sm">{p.duration ?? '—'}</td>
                  <td className="px-5 py-4 text-[#0A1F44]/60 text-sm">
                    {p.schedules?.length ? (
                      <div className="space-y-1">
                        {p.schedules.slice(0, 2).map((schedule, scheduleIndex) => (
                          <p key={schedule.id ?? scheduleIndex} className="whitespace-nowrap">{schedule.day}, {schedule.time}</p>
                        ))}
                        {p.schedules.length > 2 && <p className="text-[#0A1F44]/40 text-xs">+{p.schedules.length - 2} jadwal lain</p>}
                      </div>
                    ) : 'Belum ada'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleFeatured(p)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                          p.is_featured
                            ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-500'
                            : 'bg-[#0A1F44]/5 hover:bg-[#0A1F44] hover:text-white text-[#0A1F44]/40'
                        }`}
                        title={p.is_featured ? 'Hapus dari Unggulan' : 'Jadikan Unggulan'}
                      >
                        <Star className={`w-4 h-4 ${p.is_featured ? 'fill-yellow-500' : ''}`} />
                      </button>
                      <button onClick={() => openEdit(p)} className="w-9 h-9 rounded-lg bg-[#0A1F44]/5 hover:bg-[#0A1F44] hover:text-white text-[#0A1F44] flex items-center justify-center transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteConfirm(p)} className="w-9 h-9 rounded-lg bg-[#E63946]/10 hover:bg-[#E63946] hover:text-white text-[#E63946] flex items-center justify-center transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-[#0A1F44]/40 text-sm">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    Belum ada program. Klik "Tambah Program" untuk memulai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* ── Edit Program Type Description Modal ── */}
      {editingDesc && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-[#0A1F44]/5 flex items-center justify-between">
              <h2 className="text-[#0A1F44]" style={{ fontWeight: 900, fontSize: 20 }}>
                Edit Deskripsi {editingDesc.label}
              </h2>
              <button 
                onClick={() => setEditingDesc(null)} 
                className="w-9 h-9 rounded-xl bg-[#F7F7F9] flex items-center justify-center hover:bg-[#0A1F44]/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>
                  Deskripsi Jenis Program
                </label>
                <textarea 
                  value={editingDesc.desc} 
                  onChange={e => setEditingDesc(prev => prev ? { ...prev, desc: e.target.value } : null)} 
                  rows={6}
                  placeholder={`Masukkan deskripsi untuk ${editingDesc.label}...`} 
                  className="w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 resize-none text-sm leading-relaxed" 
                />
              </div>
            </div>
            <div className="p-6 border-t border-[#0A1F44]/5 flex justify-end gap-3">
              <button 
                onClick={() => setEditingDesc(null)} 
                className="px-5 py-3 rounded-xl text-[#0A1F44]/60 hover:bg-[#F7F7F9] text-sm" 
                style={{ fontWeight: 700 }}
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  const fieldName = editingDesc.key === 'intensif' ? 'desc_intensif' : editingDesc.key === 'short_course' ? 'desc_short_course' : 'desc_reguler';
                  setSavingDesc(true);
                  settingsApi.update({ [fieldName]: editingDesc.desc })
                    .then(() => {
                      setSiteSettings((prev: any) => ({ ...prev, [fieldName]: editingDesc.desc }));
                      showToast('ok', 'Deskripsi jenis program berhasil diperbarui!');
                      setEditingDesc(null);
                    })
                    .catch((err) => {
                      showToast('err', err instanceof Error ? err.message : 'Gagal memperbarui deskripsi');
                    })
                    .finally(() => {
                      setSavingDesc(false);
                    });
                }} 
                disabled={savingDesc}
                className="bg-[#E63946] hover:bg-[#c42d3a] disabled:opacity-60 text-white px-7 py-3 rounded-xl text-sm"
                style={{ fontWeight: 800 }}
              >
                {savingDesc ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 text-sm" />
    </div>
  )
}
