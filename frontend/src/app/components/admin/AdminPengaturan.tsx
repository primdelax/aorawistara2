// src/app/components/admin/AdminPengaturan.tsx
import { useState, useEffect } from 'react'
import { adminUserApi, authApi, settingsApi, type AdminUser, type SiteSettings } from '../../lib/api'
import { Check, RefreshCw, Globe, Phone, Mail, Instagram, Youtube, MapPin, Save, X, Clock, UserCog, Plus, Pencil, Trash2 } from 'lucide-react'

const DEFAULT: SiteSettings = {
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
  about_text: '',
  desc_intensif: '',
  desc_short_course: '',
  desc_reguler: '',
}

export function AdminPengaturan() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingUser, setSavingUser] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [showUserForm, setShowUserForm] = useState(false)
  const [userForm, setUserForm] = useState({ name: '', username: '', password: '', is_active: true })
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null)
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const showToast = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg }); setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    Promise.all([
      settingsApi.get().then(data => setSettings({ ...DEFAULT, ...data })).catch(() => { /* pakai default */ }),
      adminUserApi.getAll().then(setUsers).catch(() => { /* akun admin gagal dimuat */ }),
    ]).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await settingsApi.update(settings)
      showToast('ok', 'Pengaturan berhasil disimpan!')
    } catch (e: unknown) {
      showToast('err', e instanceof Error ? e.message : 'Gagal menyimpan')
    } finally { setSaving(false) }
  }

  const set = (key: keyof SiteSettings, val: string) => setSettings(s => ({ ...s, [key]: val }))

  const normalizeUsername = (value: string) => value.replace(/[^A-Za-z0-9]/g, '').toLowerCase()

  const openAddUser = () => {
    setEditingUser(null)
    setUserForm({ name: '', username: '', password: '', is_active: true })
    setShowUserForm(true)
  }

  const openEditUser = (user: AdminUser) => {
    setEditingUser(user)
    setUserForm({
      name: user.name || '',
      username: user.username || '',
      password: '',
      is_active: user.is_active !== false,
    })
    setShowUserForm(true)
  }

  const reloadUsers = async () => {
    const data = await adminUserApi.getAll()
    setUsers(data)
  }

  const saveUser = async () => {
    if (!userForm.name.trim()) return showToast('err', 'Nama admin wajib diisi.')
    if (!/^[A-Za-z0-9]{3,32}$/.test(userForm.username)) return showToast('err', 'Username harus 3-32 karakter, hanya huruf dan angka.')
    if (!editingUser && !userForm.password) return showToast('err', 'Password wajib diisi untuk akun baru.')
    if (userForm.password && userForm.password.length < 6) return showToast('err', 'Password minimal 6 karakter.')

    setSavingUser(true)
    try {
      if (editingUser) {
        await adminUserApi.update(editingUser.id, {
          name: userForm.name,
          username: userForm.username,
          password: userForm.password || undefined,
          is_active: userForm.is_active,
        })
        showToast('ok', 'Akun admin berhasil diperbarui!')
      } else {
        await adminUserApi.create({
          name: userForm.name,
          username: userForm.username,
          password: userForm.password,
        })
        showToast('ok', 'Akun admin berhasil ditambahkan!')
      }
      setShowUserForm(false)
      await reloadUsers()
    } catch (e: unknown) {
      showToast('err', e instanceof Error ? e.message : 'Gagal menyimpan akun admin')
    } finally {
      setSavingUser(false)
    }
  }

  const removeUser = async () => {
    if (!deleteUser) return
    try {
      await adminUserApi.remove(deleteUser.id)
      setDeleteUser(null)
      showToast('ok', 'Akun admin berhasil dihapus!')
      await reloadUsers()
    } catch (e: unknown) {
      showToast('err', e instanceof Error ? e.message : 'Gagal menghapus akun admin')
    }
  }

  if (loading) return (
    <div className="py-20 text-center text-[#0A1F44]/40">
      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /><p className="text-sm">Memuat pengaturan...</p>
    </div>
  )

  return (
    <div className="max-w-4xl">
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 text-sm ${toast.type === 'ok' ? 'bg-green-600 text-white' : 'bg-[#E63946] text-white'}`} style={{ fontWeight: 700 }}>
          {toast.type === 'ok' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      {/* Identitas */}
      <Section title="Identitas Website" icon={<Globe className="w-4 h-4" />}>
        <Field label="Nama Website" value={settings.site_name} onChange={v => set('site_name', v)} placeholder="Aora" />
        <Field label="Tagline / Slogan" value={settings.tagline} onChange={v => set('tagline', v)} placeholder="Lembaga Kursus" />
        <div>
          <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Tentang Kami</label>
          <textarea value={settings.about_text} onChange={e => set('about_text', e.target.value)} rows={4}
            placeholder="Deskripsi singkat tentang lembaga..."
            className="w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 resize-none text-sm" />
        </div>
      </Section>

      {/* Kontak */}
      <Section title="Informasi Kontak" icon={<Phone className="w-4 h-4" />}>
        <Field label="Nomor Telepon / WhatsApp" value={settings.phone} onChange={v => set('phone', v)} placeholder="0822 2591 6619 (pak hari)" />
        <Field label="Email" value={settings.email} onChange={v => set('email', v)} placeholder="info@aora.id" icon={<Mail className="w-4 h-4" />} />
        <Field label="Jam Operasional" value={settings.operational_hours} onChange={v => set('operational_hours', v)} placeholder="Senin-Jumat 10.00-17.00" icon={<Clock className="w-4 h-4" />} />
        <div>
          <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Alamat Lengkap</label>
          <textarea value={settings.address} onChange={e => set('address', e.target.value)} rows={3}
            placeholder="Jl. Contoh No. 1, Surabaya, Jawa Timur"
            className="w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 resize-none text-sm" />
        </div>
      </Section>

      {/* Medsos */}
      <Section title="Media Sosial" icon={<Instagram className="w-4 h-4" />}>
        <Field label="Instagram" value={settings.instagram} onChange={v => set('instagram', v)} placeholder="https://instagram.com/aora" />
        <Field label="Facebook" value={settings.facebook} onChange={v => set('facebook', v)} placeholder="https://facebook.com/aora" />
        <Field label="YouTube" value={settings.youtube} onChange={v => set('youtube', v)} placeholder="https://youtube.com/@aora" icon={<Youtube className="w-4 h-4" />} />
        <Field label="TikTok" value={settings.tiktok} onChange={v => set('tiktok', v)} placeholder="https://tiktok.com/@aora" />
      </Section>

      {/* Maps */}
      <Section title="Lokasi Google Maps" icon={<MapPin className="w-4 h-4" />}>
        <div>
          <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Link Google Maps</label>
          <input placeholder="https://share.google/SVdjuvR7RWXbMcyMe" onChange={e => set('maps_url', e.target.value)} value={settings.maps_url}
            className="w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 text-sm" />
          <p className="text-[#0A1F44]/40 text-xs mt-1.5">Link ini dipakai untuk tombol Buka Google Maps di halaman kontak.</p>
        </div>
      </Section>

      <Section title="Akun Admin" icon={<UserCog className="w-4 h-4" />}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[#0A1F44] text-sm" style={{ fontWeight: 800 }}>Username & Password Login</p>
            <p className="text-[#0A1F44]/45 text-xs mt-1">Username hanya boleh huruf dan angka tanpa spasi.</p>
          </div>
          <button onClick={openAddUser}
            className="inline-flex items-center gap-2 bg-[#E63946] text-white px-4 py-2.5 rounded-xl text-sm"
            style={{ fontWeight: 800 }}>
            <Plus className="w-4 h-4" /> Tambah
          </button>
        </div>

        <div className="space-y-3">
          {users.map(user => {
            const isCurrent = user.id === authApi.getUser()?.id
            return (
              <div key={user.id} className="border border-[#0A1F44]/8 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[#0A1F44] text-sm truncate" style={{ fontWeight: 900 }}>{user.username}</p>
                    {isCurrent && <span className="text-[10px] uppercase tracking-widest bg-[#0A1F44]/8 text-[#0A1F44]/60 px-2 py-1 rounded-full" style={{ fontWeight: 800 }}>Sedang login</span>}
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${user.is_active === false ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`} style={{ fontWeight: 800 }}>
                      {user.is_active === false ? 'Nonaktif' : 'Aktif'}
                    </span>
                  </div>
                  <p className="text-[#0A1F44]/45 text-xs mt-1 truncate">{user.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditUser(user)} className="w-9 h-9 rounded-xl bg-[#F7F7F9] text-[#0A1F44] flex items-center justify-center">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteUser(user)} disabled={isCurrent}
                    className="w-9 h-9 rounded-xl bg-red-50 text-[#E63946] disabled:opacity-30 flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {showUserForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-[#0A1F44]/5 flex items-center justify-between">
              <h2 className="text-[#0A1F44]" style={{ fontWeight: 900, fontSize: 20 }}>{editingUser ? 'Edit Akun Admin' : 'Tambah Akun Admin'}</h2>
              <button onClick={() => setShowUserForm(false)} className="w-9 h-9 rounded-xl bg-[#F7F7F9] flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Nama" value={userForm.name} onChange={v => setUserForm(f => ({ ...f, name: v }))} placeholder="" />
              <Field label="Username" value={userForm.username} onChange={v => setUserForm(f => ({ ...f, username: normalizeUsername(v) }))} placeholder="" />
              <Field label={editingUser ? 'Password Baru (opsional)' : 'Password'} value={userForm.password} onChange={v => setUserForm(f => ({ ...f, password: v }))} placeholder="" />
              {editingUser && (
                <label className="flex items-center gap-3 text-sm text-[#0A1F44]" style={{ fontWeight: 700 }}>
                  <input type="checkbox" checked={userForm.is_active} onChange={e => setUserForm(f => ({ ...f, is_active: e.target.checked }))} />
                  Akun aktif
                </label>
              )}
            </div>
            <div className="p-6 border-t border-[#0A1F44]/5 flex justify-end gap-3">
              <button onClick={() => setShowUserForm(false)} className="px-5 py-3 rounded-xl text-[#0A1F44]/60 hover:bg-[#F7F7F9] text-sm" style={{ fontWeight: 700 }}>Batal</button>
              <button onClick={saveUser} disabled={savingUser}
                className="bg-[#E63946] hover:bg-[#c42d3a] disabled:opacity-60 text-white px-7 py-3 rounded-xl text-sm"
                style={{ fontWeight: 800 }}>
                {savingUser ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-[#E63946]" />
            </div>
            <h3 className="text-[#0A1F44] mb-2" style={{ fontWeight: 900, fontSize: 20 }}>Hapus Akun?</h3>
            <p className="text-[#0A1F44]/60 text-sm mb-6">Akun "{deleteUser.username}" tidak akan bisa login lagi.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteUser(null)} className="px-6 py-3 rounded-xl border border-[#0A1F44]/10 text-[#0A1F44] text-sm" style={{ fontWeight: 700 }}>Batal</button>
              <button onClick={removeUser} className="bg-[#E63946] text-white px-6 py-3 rounded-xl text-sm" style={{ fontWeight: 800 }}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-2 mb-8">
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 bg-[#E63946] hover:bg-[#c42d3a] disabled:opacity-60 text-white px-8 py-4 rounded-xl shadow-lg shadow-[#E63946]/20 transition-all"
          style={{ fontWeight: 800 }}>
          <Save className="w-5 h-5" />
          {saving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}
        </button>
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#0A1F44]/5 overflow-hidden mb-5">
      <div className="px-6 py-4 border-b border-[#0A1F44]/5 flex items-center gap-3 bg-[#0A1F44]/[0.02]">
        <div className="w-8 h-8 bg-[#0A1F44] rounded-lg flex items-center justify-center text-white">{icon}</div>
        <h3 className="text-[#0A1F44]" style={{ fontWeight: 800, fontSize: 15 }}>{title}</h3>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, icon }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0A1F44]/40">{icon}</span>}
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={`w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 text-sm ${icon ? 'pl-10' : ''}`} />
      </div>
    </div>
  )
}
