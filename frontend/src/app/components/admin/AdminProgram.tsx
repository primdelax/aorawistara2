// src/app/components/admin/AdminProgram.tsx
import { useState, useEffect, useRef } from 'react'
import { programApi, categoryApi, type Program, type Category } from '../../lib/api'
import { Plus, Pencil, Trash2, Search, X, Check, BookOpen, RefreshCw, Image as ImageIcon, Zap, GraduationCap, Calendar } from 'lucide-react'

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
    key: 'bimbel',
    label: 'Program Bimbel',
    desc: 'Bimbingan belajar terstruktur dengan pendekatan personal dan interaktif. Fokus pada penguatan pemahaman dasar hingga mahir sesuai kecepatan belajar masing-masing peserta.',
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

export function AdminProgram() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Program | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Program | null>(null)
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [formError, setFormError] = useState('')

  const [form, setForm] = useState({ title: '', description: '', duration: '', price: '0', status: 'aktif', category_id: '' })
  const [imgFile, setImgFile] = useState<File | null>(null)
  const [imgPreview, setImgPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const showToast = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  const load = async () => {
    setLoading(true)
    try {
      const [progs, cats] = await Promise.all([
        programApi.getAll({ search: search || undefined }),
        categoryApi.getAll(),
      ])
      setPrograms(progs)
      setCategories(cats)
    } catch (e: unknown) {
      showToast('err', e instanceof Error ? e.message : 'Gagal memuat data')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search])

  const openAdd = () => {
    setEditing(null)
    setForm({ title: '', description: '', duration: '', price: '0', status: 'aktif', category_id: '' })
    setImgFile(null); setImgPreview(null); setFormError(''); setShowForm(true)
  }

  const openEdit = (p: Program) => {
    setEditing(p)
    setForm({ title: p.title, description: p.description, duration: p.duration ?? '', price: String(p.price), status: p.status, category_id: p.category_id ? String(p.category_id) : '' })
    setImgFile(null); setImgPreview(p.image_url); setFormError(''); setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) { setFormError('Judul program wajib diisi.'); return }
    if (!form.description.trim()) { setFormError('Deskripsi wajib diisi.'); return }
    setSaving(true); setFormError('')
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('description', form.description)
      if (form.duration) fd.append('duration', form.duration)
      fd.append('price', form.price || '0')
      fd.append('status', form.status)
      if (form.category_id) fd.append('category_id', form.category_id)
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

  const filtered = programs.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

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
            p.title.toLowerCase().includes(pt.key) ||
            (p.category_name ?? '').toLowerCase().includes(pt.key)
          ).length
          return (
            <div
              key={pt.key}
              style={{ background: pt.bg }}
              className="rounded-3xl p-7 flex flex-col min-h-[280px] relative overflow-hidden shadow-xl"
            >
              {/* decorative circle */}
              <div style={{ background: 'rgba(255,255,255,0.05)', width: 160, height: 160, borderRadius: '50%', position: 'absolute', right: -40, top: -40, pointerEvents: 'none' }} />
              <div style={{ background: 'rgba(255,255,255,0.04)', width: 100, height: 100, borderRadius: '50%', position: 'absolute', right: 40, bottom: -30, pointerEvents: 'none' }} />

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
                {pt.desc}
              </p>

              {/* CTA */}
              <button
                onClick={openAdd}
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
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 bg-[#E63946] hover:bg-[#c42d3a] text-white px-5 py-3 rounded-xl transition-all"
          style={{ fontWeight: 800 }}>
          <Plus className="w-5 h-5" /> Tambah Program
        </button>
      </div>

      {/* ── Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl my-4">
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
                <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Deskripsi *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={4} placeholder="Deskripsi singkat program..." className="w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 resize-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Durasi" value={form.duration} onChange={v => setForm(f => ({ ...f, duration: v }))} placeholder="3 Bulan" />
                <div>
                  <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Kategori</label>
                  <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                    className="w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none text-sm">
                    <option value="">-- Tanpa Kategori --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
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
      <div className="bg-white rounded-2xl overflow-hidden border border-[#0A1F44]/5">
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
          <table className="w-full">
            <thead className="bg-[#0A1F44] text-white">
              <tr>
                {['No', 'Program', 'Kategori', 'Durasi', 'Aksi'].map((h, i) => (
                  <th key={i} className={`px-5 py-4 text-xs uppercase tracking-widest ${i === 4 ? 'text-right' : 'text-left'}`} style={{ fontWeight: 800 }}>{h}</th>
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
                  <td className="px-5 py-4 text-[#0A1F44]/60 text-sm">{p.category_name ?? '—'}</td>
                  <td className="px-5 py-4 text-[#0A1F44]/60 text-sm">{p.duration ?? '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="w-9 h-9 rounded-lg bg-[#0A1F44]/5 hover:bg-[#0A1F44] hover:text-white text-[#0A1F44] flex items-center justify-center transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteConfirm(p)} className="w-9 h-9 rounded-lg bg-[#E63946]/10 hover:bg-[#E63946] hover:text-white text-[#E63946] flex items-center justify-center transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-16 text-[#0A1F44]/40 text-sm">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  Belum ada program. Klik "Tambah Program" untuk memulai.
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
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
