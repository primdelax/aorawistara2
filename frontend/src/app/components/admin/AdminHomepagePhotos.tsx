import { useEffect, useRef, useState } from 'react'
import { homepagePhotoApi, type HomepagePhoto } from '../../lib/api'
import { Check, Image as ImageIcon, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react'

export function AdminHomepagePhotos() {
  const [items, setItems] = useState<HomepagePhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<HomepagePhoto | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<HomepagePhoto | null>(null)
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ title: '', status: 'aktif', sort_order: '0' })
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
      const data = await homepagePhotoApi.getAll({ search: search || undefined })
      setItems(data)
    } catch (e: unknown) {
      showToast('err', e instanceof Error ? e.message : 'Gagal memuat foto homepage')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search])

  const openAdd = () => {
    setEditing(null)
    setForm({ title: '', status: 'aktif', sort_order: String(items.length + 1) })
    setImgFile(null); setImgPreview(null); setFormError(''); setShowForm(true)
  }

  const openEdit = (item: HomepagePhoto) => {
    setEditing(item)
    setForm({ title: item.title, status: item.status, sort_order: String(item.sort_order ?? 0) })
    setImgFile(null); setImgPreview(item.image_url); setFormError(''); setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) { setFormError('Judul foto wajib diisi.'); return }
    if (!editing && !imgFile) { setFormError('Foto wajib diupload.'); return }
    setSaving(true); setFormError('')
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('status', form.status)
      fd.append('sort_order', form.sort_order || '0')
      if (imgFile) fd.append('image', imgFile)

      if (editing) {
        await homepagePhotoApi.update(editing.id, fd)
        showToast('ok', 'Foto homepage berhasil diperbarui!')
      } else {
        await homepagePhotoApi.create(fd)
        showToast('ok', 'Foto homepage berhasil ditambahkan!')
      }
      setShowForm(false)
      load()
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await homepagePhotoApi.remove(deleteConfirm.id)
      setDeleteConfirm(null)
      showToast('ok', 'Foto homepage berhasil dihapus!')
      load()
    } catch (e: unknown) {
      showToast('err', e instanceof Error ? e.message : 'Gagal menghapus')
    }
  }

  return (
    <div>
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 text-sm ${toast.type === 'ok' ? 'bg-green-600 text-white' : 'bg-[#E63946] text-white'}`} style={{ fontWeight: 700 }}>
          {toast.type === 'ok' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5 mb-8">
        <div className="bg-[#0A1F44] text-white rounded-2xl p-6">
          <p className="text-white/60 text-xs uppercase tracking-widest mb-3" style={{ fontWeight: 800 }}>Total Foto Homepage</p>
          <p style={{ fontWeight: 900, fontSize: 48, letterSpacing: '-0.04em', lineHeight: 1 }}>{items.length}</p>
        </div>
        <div className="bg-white border border-[#0A1F44]/5 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0A1F44] rounded-xl flex items-center justify-center shrink-0">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[#0A1F44]" style={{ fontWeight: 800 }}>Animasi Foto Home</p>
            <p className="text-[#0A1F44]/50 text-sm mt-0.5">Foto aktif akan muncul bergantian di animasi halaman Home.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-[#0A1F44]/5 flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#0A1F44]/40" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari foto homepage..."
            className="w-full bg-[#F7F7F9] pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 text-sm" />
        </div>
        <button onClick={load} className="w-11 h-11 rounded-xl bg-[#F7F7F9] flex items-center justify-center text-[#0A1F44]/60 hover:text-[#0A1F44]">
          <RefreshCw className="w-4 h-4" />
        </button>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 bg-[#E63946] hover:bg-[#c42d3a] text-white px-5 py-3 rounded-xl transition-all"
          style={{ fontWeight: 800 }}>
          <Plus className="w-5 h-5" /> Tambah Foto
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg my-4">
            <div className="p-6 border-b border-[#0A1F44]/5 flex items-center justify-between">
              <h2 style={{ fontWeight: 900, fontSize: 20, color: '#0A1F44' }}>{editing ? 'Edit Foto Homepage' : 'Tambah Foto Homepage'}</h2>
              <button onClick={() => setShowForm(false)} className="w-9 h-9 rounded-xl bg-[#F7F7F9] flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{formError}</div>}
              <div>
                <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Foto {!editing && '*'}</label>
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-[#0A1F44]/20 rounded-2xl h-56 flex items-center justify-center cursor-pointer hover:border-[#E63946]/40 overflow-hidden relative group">
                  {imgPreview
                    ? <><img src={imgPreview} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <p className="text-white text-sm font-bold">Ganti Foto</p></div></>
                    : <div className="text-center text-[#0A1F44]/40">
                        <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-sm">Klik untuk upload foto</p>
                        <p className="text-xs mt-1">JPG, PNG, WebP - maks 5MB</p>
                      </div>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setImgFile(f); setImgPreview(URL.createObjectURL(f)) } }} />
              </div>
              <Field label="Judul Foto *" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="Kegiatan membatik" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Urutan" value={form.sort_order} onChange={v => setForm(f => ({ ...f, sort_order: v }))} placeholder="1" type="number" />
                <div>
                  <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none text-sm">
                    <option value="aktif">Aktif</option>
                    <option value="tidak_aktif">Tidak Aktif</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#0A1F44]/5 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-5 py-3 rounded-xl text-[#0A1F44]/60 hover:bg-[#F7F7F9] text-sm" style={{ fontWeight: 700 }}>Batal</button>
              <button onClick={handleSave} disabled={saving}
                className="bg-[#E63946] hover:bg-[#c42d3a] disabled:opacity-60 text-white px-7 py-3 rounded-xl text-sm"
                style={{ fontWeight: 800 }}>
                {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Foto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-[#E63946]" />
            </div>
            <h3 style={{ fontWeight: 900, fontSize: 20, color: '#0A1F44' }} className="mb-2">Hapus Foto?</h3>
            <p className="text-[#0A1F44]/60 text-sm mb-1">Anda akan menghapus:</p>
            <p className="text-[#0A1F44] text-sm mb-6" style={{ fontWeight: 800 }}>"{deleteConfirm.title}"</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteConfirm(null)} className="px-6 py-3 rounded-xl border border-[#0A1F44]/10 text-[#0A1F44] text-sm" style={{ fontWeight: 700 }}>Batal</button>
              <button onClick={handleDelete} className="bg-[#E63946] text-white px-6 py-3 rounded-xl text-sm" style={{ fontWeight: 800 }}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-[#0A1F44]/40">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /><p className="text-sm">Memuat foto homepage...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl py-20 text-center text-[#0A1F44]/40 border border-[#0A1F44]/5">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Belum ada foto homepage. Klik "Tambah Foto" untuk memulai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="group relative bg-white rounded-2xl overflow-hidden border border-[#0A1F44]/5">
              <div className="aspect-square overflow-hidden bg-[#F7F7F9]">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[#0A1F44] text-sm truncate" style={{ fontWeight: 800 }}>{item.title}</p>
                  <span className={`text-[10px] px-2 py-1 rounded-full ${item.status === 'aktif' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`} style={{ fontWeight: 800 }}>
                    {item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <p className="text-[#0A1F44]/40 text-xs mt-0.5">Urutan {item.sort_order}</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-lg bg-white/95 text-[#0A1F44] flex items-center justify-center shadow-md">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeleteConfirm(item)} className="w-8 h-8 rounded-lg bg-[#E63946] text-white flex items-center justify-center shadow-md">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
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
