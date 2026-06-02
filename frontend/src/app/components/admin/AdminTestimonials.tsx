import { useEffect, useRef, useState } from 'react'
import { testimonialApi, type Testimonial } from '../../lib/api'
import { Check, Image as ImageIcon, MessageSquareQuote, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react'

export function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Testimonial | null>(null)
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ alumni_name: '', profile: '', comment: '', status: 'aktif', sort_order: '0' })
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
      const data = await testimonialApi.getAll({ search: search || undefined })
      setItems(data)
    } catch (e: unknown) {
      showToast('err', e instanceof Error ? e.message : 'Gagal memuat testimoni')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search])

  const openAdd = () => {
    setEditing(null)
    setForm({ alumni_name: '', profile: '', comment: '', status: 'aktif', sort_order: String(items.length + 1) })
    setImgFile(null); setImgPreview(null); setFormError(''); setShowForm(true)
  }

  const openEdit = (item: Testimonial) => {
    setEditing(item)
    setForm({
      alumni_name: item.alumni_name,
      profile: item.profile,
      comment: item.comment,
      status: item.status,
      sort_order: String(item.sort_order ?? 0),
    })
    setImgFile(null); setImgPreview(item.image_url); setFormError(''); setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.alumni_name.trim()) { setFormError('Nama alumni wajib diisi.'); return }
    if (!form.profile.trim()) { setFormError('Profil alumni wajib diisi.'); return }
    if (!form.comment.trim()) { setFormError('Komentar testimoni wajib diisi.'); return }
    if (!editing && !imgFile) { setFormError('Foto alumni wajib diupload.'); return }

    setSaving(true); setFormError('')
    try {
      const fd = new FormData()
      fd.append('alumni_name', form.alumni_name)
      fd.append('profile', form.profile)
      fd.append('comment', form.comment)
      fd.append('status', form.status)
      fd.append('sort_order', form.sort_order || '0')
      if (imgFile) fd.append('image', imgFile)

      if (editing) {
        await testimonialApi.update(editing.id, fd)
        showToast('ok', 'Testimoni berhasil diperbarui!')
      } else {
        await testimonialApi.create(fd)
        showToast('ok', 'Testimoni berhasil ditambahkan!')
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
      await testimonialApi.remove(deleteConfirm.id)
      setDeleteConfirm(null)
      showToast('ok', 'Testimoni berhasil dihapus!')
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
          <p className="text-white/60 text-xs uppercase tracking-widest mb-3" style={{ fontWeight: 800 }}>Total Testimoni</p>
          <p style={{ fontWeight: 900, fontSize: 48, letterSpacing: '-0.04em', lineHeight: 1 }}>{items.length}</p>
        </div>
        <div className="bg-white border border-[#0A1F44]/5 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0A1F44] rounded-xl flex items-center justify-center shrink-0">
            <MessageSquareQuote className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[#0A1F44]" style={{ fontWeight: 800 }}>Alumni di Home</p>
            <p className="text-[#0A1F44]/50 text-sm mt-0.5">Testimoni aktif akan tampil di bagian Apa Kata Mereka halaman Home.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-[#0A1F44]/5 flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#0A1F44]/40" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari testimoni alumni..."
            className="w-full bg-[#F7F7F9] pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 text-sm" />
        </div>
        <button onClick={load} className="w-11 h-11 rounded-xl bg-[#F7F7F9] flex items-center justify-center text-[#0A1F44]/60 hover:text-[#0A1F44]">
          <RefreshCw className="w-4 h-4" />
        </button>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 bg-[#E63946] hover:bg-[#c42d3a] text-white px-5 py-3 rounded-xl transition-all"
          style={{ fontWeight: 800 }}>
          <Plus className="w-5 h-5" /> Tambah Testimoni
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl my-4">
            <div className="p-6 border-b border-[#0A1F44]/5 flex items-center justify-between">
              <h2 style={{ fontWeight: 900, fontSize: 20, color: '#0A1F44' }}>{editing ? 'Edit Testimoni' : 'Tambah Testimoni'}</h2>
              <button onClick={() => setShowForm(false)} className="w-9 h-9 rounded-xl bg-[#F7F7F9] flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{formError}</div>}
              <div>
                <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Foto Alumni {!editing && '*'}</label>
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-[#0A1F44]/20 rounded-2xl h-56 flex items-center justify-center cursor-pointer hover:border-[#E63946]/40 overflow-hidden relative group">
                  {imgPreview
                    ? <><img src={imgPreview} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <p className="text-white text-sm font-bold">Ganti Foto</p></div></>
                    : <div className="text-center text-[#0A1F44]/40">
                        <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-sm">Klik untuk upload foto alumni</p>
                        <p className="text-xs mt-1">JPG, PNG, WebP - maks 5MB</p>
                      </div>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setImgFile(f); setImgPreview(URL.createObjectURL(f)) } }} />
              </div>
              <Field label="Nama Alumni *" value={form.alumni_name} onChange={v => setForm(f => ({ ...f, alumni_name: v }))} placeholder="Nadia Putri" />
              <Field label="Profil Alumni *" value={form.profile} onChange={v => setForm(f => ({ ...f, profile: v }))} placeholder="Alumni Program Membatik" />
              <div>
                <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Komentar *</label>
                <textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                  rows={4} placeholder="Tulis testimoni alumni..." className="w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 resize-none text-sm" />
              </div>
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
                {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Testimoni'}
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
            <h3 style={{ fontWeight: 900, fontSize: 20, color: '#0A1F44' }} className="mb-2">Hapus Testimoni?</h3>
            <p className="text-[#0A1F44]/60 text-sm mb-1">Anda akan menghapus testimoni:</p>
            <p className="text-[#0A1F44] text-sm mb-6" style={{ fontWeight: 800 }}>"{deleteConfirm.alumni_name}"</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteConfirm(null)} className="px-6 py-3 rounded-xl border border-[#0A1F44]/10 text-[#0A1F44] text-sm" style={{ fontWeight: 700 }}>Batal</button>
              <button onClick={handleDelete} className="bg-[#E63946] text-white px-6 py-3 rounded-xl text-sm" style={{ fontWeight: 800 }}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-[#0A1F44]/40">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /><p className="text-sm">Memuat testimoni...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl py-20 text-center text-[#0A1F44]/40 border border-[#0A1F44]/5">
          <MessageSquareQuote className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Belum ada testimoni. Klik "Tambah Testimoni" untuk memulai.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => (
            <div key={item.id} className="group bg-white rounded-2xl overflow-hidden border border-[#0A1F44]/5">
              <div className="p-5 flex gap-4">
                <img src={item.image_url} alt={item.alumni_name} className="w-20 h-20 rounded-full object-cover border-4 border-[#F7F7F9]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] px-2 py-1 rounded-full ${item.status === 'aktif' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`} style={{ fontWeight: 800 }}>
                      {item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <span className="text-[#0A1F44]/40 text-xs">Urutan {item.sort_order}</span>
                  </div>
                  <p className="text-[#0A1F44] mt-2 truncate" style={{ fontWeight: 900, fontSize: 18 }}>{item.alumni_name}</p>
                  <p className="text-[#E63946] text-xs truncate" style={{ fontWeight: 800 }}>{item.profile}</p>
                </div>
              </div>
              <p className="px-5 pb-5 text-sm leading-relaxed text-[#0A1F44]/65">"{item.comment}"</p>
              <div className="px-5 pb-5 flex gap-2">
                <button onClick={() => openEdit(item)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#F7F7F9] text-[#0A1F44] py-3 text-sm" style={{ fontWeight: 800 }}>
                  <Pencil className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => setDeleteConfirm(item)} className="w-12 rounded-xl bg-[#E63946] text-white flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
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
