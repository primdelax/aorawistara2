// src/app/components/admin/AdminPengaturan.tsx
import { useState, useEffect } from 'react'
import {
  adminUserApi,
  authApi,
  settingsApi,
  visiMisiApi,
  keunggulanApi,
  type AdminUser,
  type SiteSettings,
  type MisiItem,
  type KeunggulanItem,
} from '../../lib/api'
import {
  Check,
  RefreshCw,
  Globe,
  Phone,
  Mail,
  Instagram,
  Youtube,
  MapPin,
  Save,
  X,
  Clock,
  UserCog,
  Plus,
  Pencil,
  Trash2,
  Shield,
  Smile,
  CheckCircle,
  Lightbulb,
  BookOpen,
  ThumbsUp,
  Star,
  Target,
  Eye,
  Sparkles,
  Award,
  Users,
  Heart,
  KeyRound,
  ShieldCheck,
  Images,
  Image as ImageIcon,
  MessageSquareQuote,
  Sparkle,
} from 'lucide-react'

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
  visi: '',
}

const AVAILABLE_ICONS = [
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Award', icon: Award },
  { name: 'Users', icon: Users },
  { name: 'Heart', icon: Heart },
  { name: 'Target', icon: Target },
  { name: 'Eye', icon: Eye },
  { name: 'Shield', icon: Shield },
  { name: 'Smile', icon: Smile },
  { name: 'CheckCircle', icon: CheckCircle },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'ThumbsUp', icon: ThumbsUp },
  { name: 'Star', icon: Star },
]

export function AdminPengaturan() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [misi, setMisi] = useState<MisiItem[]>([])
  const [keunggulan, setKeunggulan] = useState<KeunggulanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // User states
  const [savingUser, setSavingUser] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [showUserForm, setShowUserForm] = useState(false)
  const [userForm, setUserForm] = useState<{
    name: string
    username: string
    password: string
    is_active: boolean
    permissions: string[]
  }>({
    name: '',
    username: '',
    password: '',
    is_active: true,
    permissions: ['all_access', 'program', 'foto_homepage', 'testimoni', 'galeri'],
  })
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null)

  // Misi states
  const [showMisiForm, setShowMisiForm] = useState(false)
  const [misiForm, setMisiForm] = useState({ title: '', desc: '' })
  const [editingMisi, setEditingMisi] = useState<MisiItem | null>(null)
  const [savingMisi, setSavingMisi] = useState(false)
  const [deleteMisi, setDeleteMisi] = useState<MisiItem | null>(null)

  // Keunggulan states
  const [showKeunggulanForm, setShowKeunggulanForm] = useState(false)
  const [keunggulanForm, setKeunggulanForm] = useState({ title: '', desc: '', icon: 'Sparkles' })
  const [editingKeunggulan, setEditingKeunggulan] = useState<KeunggulanItem | null>(null)
  const [savingKeunggulan, setSavingKeunggulan] = useState(false)
  const [deleteKeunggulan, setDeleteKeunggulan] = useState<KeunggulanItem | null>(null)

  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const showToast = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg }); setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    Promise.all([
      settingsApi.get().then(data => setSettings({ ...DEFAULT, ...data })).catch(() => { /* pakai default */ }),
      adminUserApi.getAll().then(setUsers).catch(() => { /* akun admin gagal dimuat */ }),
      visiMisiApi.getMisi().then(setMisi).catch(() => {}),
      keunggulanApi.getAll().then(setKeunggulan).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        settingsApi.update(settings),
        visiMisiApi.updateVisi(settings.visi || ''),
      ])
      showToast('ok', 'Pengaturan berhasil disimpan!')
    } catch (e: unknown) {
      showToast('err', e instanceof Error ? e.message : 'Gagal menyimpan')
    } finally { setSaving(false) }
  }

  const set = (key: keyof SiteSettings, val: string) => setSettings(s => ({ ...s, [key]: val }))

  const normalizeUsername = (value: string) => value.replace(/[^A-Za-z0-9]/g, '').toLowerCase()

  // Admin User CRUD Handlers
  const openAddUser = () => {
    setEditingUser(null)
    setUserForm({
      name: '',
      username: '',
      password: '',
      is_active: true,
      permissions: ['all_access', 'program', 'foto_homepage', 'testimoni', 'galeri'],
    })
    setShowUserForm(true)
  }

  const openEditUser = (user: AdminUser) => {
    setEditingUser(user)
    const existingPerms = user.permissions || ['all_access']
    const hasAll = existingPerms.includes('all_access')
    setUserForm({
      name: user.name || '',
      username: user.username || '',
      password: '',
      is_active: user.is_active !== false,
      permissions: hasAll
        ? ['all_access', 'program', 'foto_homepage', 'testimoni', 'galeri']
        : existingPerms,
    })
    setShowUserForm(true)
  }

  const togglePermission = (key: string) => {
    const ALL_ITEMS = ['program', 'foto_homepage', 'testimoni', 'galeri']
    
    if (key === 'all_access') {
      const currentlyHasAll = userForm.permissions.includes('all_access')
      if (currentlyHasAll) {
        setUserForm(f => ({ ...f, permissions: [] }))
      } else {
        setUserForm(f => ({ ...f, permissions: ['all_access', ...ALL_ITEMS] }))
      }
      return
    }

    setUserForm(f => {
      const hasItem = f.permissions.includes(key)
      let next = hasItem
        ? f.permissions.filter(p => p !== key && p !== 'all_access')
        : [...f.permissions.filter(p => p !== 'all_access'), key]

      const hasAllSub = ALL_ITEMS.every(item => next.includes(item))
      if (hasAllSub && !next.includes('all_access')) {
        next.push('all_access')
      }

      return { ...f, permissions: next }
    })
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
      const cleanPermissions = userForm.permissions.length > 0 ? userForm.permissions : ['dashboard']
      if (editingUser) {
        await adminUserApi.update(editingUser.id, {
          name: userForm.name,
          username: userForm.username,
          password: userForm.password || undefined,
          is_active: userForm.is_active,
          permissions: cleanPermissions,
        })
        showToast('ok', 'Akun admin berhasil diperbarui!')
      } else {
        await adminUserApi.create({
          name: userForm.name,
          username: userForm.username,
          password: userForm.password,
          permissions: cleanPermissions,
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

  // Misi CRUD Handlers
  const openAddMisi = () => {
    setEditingMisi(null)
    setMisiForm({ title: '', desc: '' })
    setShowMisiForm(true)
  }

  const openEditMisi = (item: MisiItem) => {
    setEditingMisi(item)
    setMisiForm({ title: item.title, desc: item.desc })
    setShowMisiForm(true)
  }

  const reloadMisi = async () => {
    const data = await visiMisiApi.getMisi()
    setMisi(data)
  }

  const saveMisiItem = async () => {
    if (!misiForm.title.trim()) return showToast('err', 'Judul misi wajib diisi.')
    if (!misiForm.desc.trim()) return showToast('err', 'Deskripsi misi wajib diisi.')

    setSavingMisi(true)
    try {
      if (editingMisi) {
        await visiMisiApi.updateMisi(editingMisi.id, {
          title: misiForm.title,
          desc: misiForm.desc,
        })
        showToast('ok', 'Item misi berhasil diperbarui!')
      } else {
        await visiMisiApi.createMisi({
          title: misiForm.title,
          desc: misiForm.desc,
        })
        showToast('ok', 'Item misi berhasil ditambahkan!')
      }
      setShowMisiForm(false)
      await reloadMisi()
    } catch (e: unknown) {
      showToast('err', e instanceof Error ? e.message : 'Gagal menyimpan misi')
    } finally {
      setSavingMisi(false)
    }
  }

  const removeMisiItem = async () => {
    if (!deleteMisi) return
    try {
      await visiMisiApi.deleteMisi(deleteMisi.id)
      setDeleteMisi(null)
      showToast('ok', 'Item misi berhasil dihapus!')
      await reloadMisi()
    } catch (e: unknown) {
      showToast('err', e instanceof Error ? e.message : 'Gagal menghapus misi')
    }
  }

  // Keunggulan CRUD Handlers
  const openAddKeunggulan = () => {
    setEditingKeunggulan(null)
    setKeunggulanForm({ title: '', desc: '', icon: 'Sparkles' })
    setShowKeunggulanForm(true)
  }

  const openEditKeunggulan = (item: KeunggulanItem) => {
    setEditingKeunggulan(item)
    setKeunggulanForm({ title: item.title, desc: item.desc, icon: item.icon })
    setShowKeunggulanForm(true)
  }

  const reloadKeunggulan = async () => {
    const data = await keunggulanApi.getAll()
    setKeunggulan(data)
  }

  const saveKeunggulanItem = async () => {
    if (!keunggulanForm.title.trim()) return showToast('err', 'Judul keunggulan wajib diisi.')
    if (!keunggulanForm.desc.trim()) return showToast('err', 'Deskripsi keunggulan wajib diisi.')

    setSavingKeunggulan(true)
    try {
      if (editingKeunggulan) {
        await keunggulanApi.update(editingKeunggulan.id, {
          title: keunggulanForm.title,
          desc: keunggulanForm.desc,
          icon: keunggulanForm.icon,
        })
        showToast('ok', 'Keunggulan berhasil diperbarui!')
      } else {
        await keunggulanApi.create({
          title: keunggulanForm.title,
          desc: keunggulanForm.desc,
          icon: keunggulanForm.icon,
        })
        showToast('ok', 'Keunggulan berhasil ditambahkan!')
      }
      setShowKeunggulanForm(false)
      await reloadKeunggulan()
    } catch (e: unknown) {
      showToast('err', e instanceof Error ? e.message : 'Gagal menyimpan keunggulan')
    } finally {
      setSavingKeunggulan(false)
    }
  }

  const removeKeunggulanItem = async () => {
    if (!deleteKeunggulan) return
    try {
      await keunggulanApi.remove(deleteKeunggulan.id)
      setDeleteKeunggulan(null)
      showToast('ok', 'Keunggulan berhasil dihapus!')
      await reloadKeunggulan()
    } catch (e: unknown) {
      showToast('err', e instanceof Error ? e.message : 'Gagal menghapus keunggulan')
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

      {/* Visi & Misi */}
      <Section title="Visi & Misi Halaman Profil" icon={<Eye className="w-4 h-4" />}>
        <div>
          <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Teks Visi</label>
          <textarea value={settings.visi || ''} onChange={e => set('visi', e.target.value)} rows={3}
            placeholder="Menjadi lembaga pelatihan terdepan..."
            className="w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 resize-none text-sm" />
        </div>

        <div className="border-t border-[#0A1F44]/5 pt-5 mt-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-[#0A1F44] text-sm" style={{ fontWeight: 800 }}>Daftar Misi</p>
              <p className="text-[#0A1F44]/45 text-xs mt-1">Daftar misi yang ditampilkan di halaman profil.</p>
            </div>
            <button onClick={openAddMisi}
              className="inline-flex items-center gap-2 bg-[#E63946] text-white px-4 py-2.5 rounded-xl text-sm"
              style={{ fontWeight: 800 }}>
              <Plus className="w-4 h-4" /> Tambah Misi
            </button>
          </div>

          <div className="space-y-3">
            {misi.map(item => (
              <div key={item.id} className="border border-[#0A1F44]/8 rounded-2xl p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs uppercase tracking-widest bg-[#E63946]/10 text-[#E63946] px-2 py-0.5 rounded-full" style={{ fontWeight: 800 }}>
                      Misi {item.num}
                    </span>
                    <p className="text-[#0A1F44] text-sm" style={{ fontWeight: 900 }}>{item.title}</p>
                  </div>
                  <p className="text-[#0A1F44]/65 text-xs mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEditMisi(item)} className="w-9 h-9 rounded-xl bg-[#F7F7F9] text-[#0A1F44] flex items-center justify-center">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteMisi(item)}
                    className="w-9 h-9 rounded-xl bg-red-50 text-[#E63946] flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {misi.length === 0 && (
              <p className="text-[#0A1F44]/40 text-xs text-center py-4">Belum ada item misi.</p>
            )}
          </div>
        </div>
      </Section>

      {/* Keunggulan Aora */}
      <Section title="Keunggulan Aora Halaman Profil" icon={<Sparkles className="w-4 h-4" />}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-[#0A1F44] text-sm" style={{ fontWeight: 800 }}>Daftar Keunggulan</p>
            <p className="text-[#0A1F44]/45 text-xs mt-1">Daftar keunggulan lembaga yang ditampilkan di halaman profil.</p>
          </div>
          <button onClick={openAddKeunggulan}
            className="inline-flex items-center gap-2 bg-[#E63946] text-white px-4 py-2.5 rounded-xl text-sm"
            style={{ fontWeight: 800 }}>
            <Plus className="w-4 h-4" /> Tambah Keunggulan
          </button>
        </div>

        <div className="space-y-3">
          {keunggulan.map(item => {
            const match = AVAILABLE_ICONS.find(i => i.name === item.icon)
            const IconComponent = match ? match.icon : Sparkles
            return (
              <div key={item.id} className="border border-[#0A1F44]/8 rounded-2xl p-4 flex items-start justify-between gap-3">
                <div className="flex gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center shrink-0">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#0A1F44] text-sm" style={{ fontWeight: 900 }}>{item.title}</p>
                    <p className="text-[#0A1F44]/65 text-xs mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEditKeunggulan(item)} className="w-9 h-9 rounded-xl bg-[#F7F7F9] text-[#0A1F44] flex items-center justify-center">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteKeunggulan(item)}
                    className="w-9 h-9 rounded-xl bg-red-50 text-[#E63946] flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
          {keunggulan.length === 0 && (
            <p className="text-[#0A1F44]/40 text-xs text-center py-4">Belum ada item keunggulan.</p>
          )}
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

      {/* Akun Admin & Hak Akses Role */}
      <Section title="Akun Admin & Hak Akses Role" icon={<UserCog className="w-4 h-4" />}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[#0A1F44] text-sm font-extrabold">Manajemen Akun Admin & Batasan Menu</p>
            <p className="text-[#0A1F44]/50 text-xs mt-0.5">Atur akun admin dan tentukan hak akses ke menu mana saja yang diizinkan.</p>
          </div>
          <button
            type="button"
            onClick={openAddUser}
            className="group relative inline-flex items-center gap-2 bg-[#E63946] hover:bg-[#c42d3a] transition-all duration-200 text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-[#E63946]/25 hover:shadow-xl hover:shadow-[#E63946]/35 hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>Tambah Akun Admin</span>
          </button>
        </div>

        <div className="space-y-3 mt-4">
          {users.map(user => {
            const isCurrent = user.id === authApi.getUser()?.id
            const perms = user.permissions || ['all_access']
            const isFullAccess = perms.includes('all_access')

            return (
              <div
                key={user.id}
                className="group border border-[#0A1F44]/8 bg-[#F7F7F9]/60 hover:bg-white hover:border-[#E63946]/30 hover:shadow-md transition-all duration-200 rounded-2xl p-4 flex items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-[#0A1F44] text-sm font-black truncate">{user.username}</p>
                    {isCurrent && (
                      <span className="text-[10px] uppercase tracking-wider bg-[#0A1F44] text-white px-2 py-0.5 rounded-full font-bold">
                        Akun Anda
                      </span>
                    )}
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                      user.is_active === false ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {user.is_active === false ? 'Nonaktif' : 'Aktif'}
                    </span>
                  </div>
                  <p className="text-[#0A1F44]/60 text-xs truncate mb-2">{user.name}</p>

                  {/* Badges for role permissions */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-[#0A1F44]/50 font-semibold mr-1 flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-[#E63946]" /> Izin Akses:
                    </span>
                    {isFullAccess ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> All Access (Semua Menu + Pengaturan)
                      </span>
                    ) : (
                      <>
                        {perms.includes('program') && (
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-blue-600" /> Program
                          </span>
                        )}
                        {perms.includes('foto_homepage') && (
                          <span className="text-[10px] font-bold bg-pink-100 text-pink-800 border border-pink-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Images className="w-3 h-3 text-pink-600" /> Foto Homepage
                          </span>
                        )}
                        {perms.includes('testimoni') && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <MessageSquareQuote className="w-3 h-3 text-amber-600" /> Testimoni
                          </span>
                        )}
                        {perms.includes('galeri') && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <ImageIcon className="w-3 h-3 text-emerald-600" /> Galeri
                          </span>
                        )}
                        {!perms.includes('program') && !perms.includes('foto_homepage') && !perms.includes('testimoni') && !perms.includes('galeri') && (
                          <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-lg">
                            Hanya Dashboard
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditUser(user)}
                    title="Edit Akun & Hak Akses"
                    className="w-9 h-9 rounded-xl bg-white hover:bg-gray-100 text-[#0A1F44] border border-[#0A1F44]/10 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteUser(user)}
                    disabled={isCurrent}
                    title={isCurrent ? "Tidak bisa menghapus akun sendiri" : "Hapus Akun"}
                    className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-[#E63946] disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Modal for User Account with Interactive Hover Permissions */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#0A1F44]/5 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h2 className="text-[#0A1F44] font-black text-xl flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-[#E63946]" />
                  {editingUser ? 'Edit Akun Admin & Hak Akses' : 'Tambah Akun Admin Baru'}
                </h2>
                <p className="text-[#0A1F44]/55 text-xs mt-0.5">Tentukan username, password, dan pilih opsi menu yang boleh diakses.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowUserForm(false)}
                className="w-9 h-9 rounded-xl bg-white hover:bg-gray-200 text-[#0A1F44] border border-[#0A1F44]/10 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <Field label="Nama Lengkap" value={userForm.name} onChange={v => setUserForm(f => ({ ...f, name: v }))} placeholder="Nama Admin Baru" />
              <Field label="Username Login" value={userForm.username} onChange={v => setUserForm(f => ({ ...f, username: normalizeUsername(v) }))} placeholder="Contoh: adminprogram" />
              <Field label={editingUser ? 'Password Baru (kosongkan jika tidak ingin diubah)' : 'Password Login'} value={userForm.password} onChange={v => setUserForm(f => ({ ...f, password: v }))} placeholder="Minimal 6 karakter" />

              {/* Interactive Role Permissions Selection */}
              <div className="border border-[#0A1F44]/10 bg-[#F7F7F9] rounded-2xl p-5">
                <div className="mb-3">
                  <label className="text-[#0A1F44] text-xs uppercase tracking-widest block font-black">
                    Pilihan Hak Akses Menu
                  </label>
                  <p className="text-[#0A1F44]/55 text-xs mt-0.5">Hover dan klik untuk memilih menu mana saja yang bisa dibuka oleh admin ini.</p>
                </div>

                <div className="space-y-2.5">
                  {/* All Access Option Card with Rich Hover */}
                  <label
                    onClick={() => togglePermission('all_access')}
                    className={`group/all flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      userForm.permissions.includes('all_access')
                        ? 'bg-purple-50/90 border-purple-400 text-purple-950 shadow-md ring-2 ring-purple-400/20'
                        : 'bg-white border-[#0A1F44]/10 text-[#0A1F44] hover:border-purple-300 hover:bg-purple-50/30 hover:shadow-sm'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={userForm.permissions.includes('all_access')}
                      onChange={() => {}}
                      className="mt-1 w-5 h-5 text-purple-600 rounded-lg accent-purple-600 cursor-pointer transition-transform group-hover/all:scale-110"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-black flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-purple-600" /> All Access (Semua Menu + Pengaturan)
                        </p>
                        {userForm.permissions.includes('all_access') && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-purple-200/80 text-purple-800 px-2 py-0.5 rounded-full">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-purple-800/70 mt-0.5 leading-relaxed">
                        Memberikan izin penuh ke seluruh menu sistem (Program, Foto Homepage, Testimoni, Galeri) termasuk halaman <strong>Pengaturan Website & Akun Admin</strong>.
                      </p>
                    </div>
                  </label>

                  {/* Individual Menu Permissions Grid */}
                  <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
                    {/* Program Option Card */}
                    <label
                      onClick={() => togglePermission('program')}
                      className={`group/item flex items-start gap-3 p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        userForm.permissions.includes('program')
                          ? 'bg-blue-50 border-blue-400 text-blue-950 shadow-sm ring-1 ring-blue-400/30'
                          : 'bg-white border-[#0A1F44]/10 text-[#0A1F44] hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={userForm.permissions.includes('program')}
                        onChange={() => {}}
                        className="mt-0.5 w-4 h-4 text-blue-600 rounded accent-blue-600 cursor-pointer transition-transform group-hover/item:scale-110"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Program
                        </p>
                        <p className="text-[11px] text-[#0A1F44]/65 mt-0.5 leading-snug">
                          Kelola program pelatihan, kategori & jadwal
                        </p>
                      </div>
                    </label>

                    {/* Foto Homepage Option Card */}
                    <label
                      onClick={() => togglePermission('foto_homepage')}
                      className={`group/item flex items-start gap-3 p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        userForm.permissions.includes('foto_homepage')
                          ? 'bg-pink-50 border-pink-400 text-pink-950 shadow-sm ring-1 ring-pink-400/30'
                          : 'bg-white border-[#0A1F44]/10 text-[#0A1F44] hover:border-pink-300 hover:bg-pink-50/30 hover:shadow-sm'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={userForm.permissions.includes('foto_homepage')}
                        onChange={() => {}}
                        className="mt-0.5 w-4 h-4 text-pink-600 rounded accent-pink-600 cursor-pointer transition-transform group-hover/item:scale-110"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black flex items-center gap-1.5">
                          <Images className="w-3.5 h-3.5 text-pink-600" /> Foto Homepage
                        </p>
                        <p className="text-[11px] text-[#0A1F44]/65 mt-0.5 leading-snug">
                          Kelola foto animasi slideshow di homepage
                        </p>
                      </div>
                    </label>

                    {/* Testimoni Option Card */}
                    <label
                      onClick={() => togglePermission('testimoni')}
                      className={`group/item flex items-start gap-3 p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        userForm.permissions.includes('testimoni')
                          ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-sm ring-1 ring-amber-400/30'
                          : 'bg-white border-[#0A1F44]/10 text-[#0A1F44] hover:border-amber-300 hover:bg-amber-50/30 hover:shadow-sm'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={userForm.permissions.includes('testimoni')}
                        onChange={() => {}}
                        className="mt-0.5 w-4 h-4 text-amber-600 rounded accent-amber-600 cursor-pointer transition-transform group-hover/item:scale-110"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black flex items-center gap-1.5">
                          <MessageSquareQuote className="w-3.5 h-3.5 text-amber-600" /> Testimoni
                        </p>
                        <p className="text-[11px] text-[#0A1F44]/65 mt-0.5 leading-snug">
                          Kelola ulasan alumni di homepage
                        </p>
                      </div>
                    </label>

                    {/* Galeri Option Card */}
                    <label
                      onClick={() => togglePermission('galeri')}
                      className={`group/item flex items-start gap-3 p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        userForm.permissions.includes('galeri')
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-sm ring-1 ring-emerald-400/30'
                          : 'bg-white border-[#0A1F44]/10 text-[#0A1F44] hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-sm'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={userForm.permissions.includes('galeri')}
                        onChange={() => {}}
                        className="mt-0.5 w-4 h-4 text-emerald-600 rounded accent-emerald-600 cursor-pointer transition-transform group-hover/item:scale-110"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" /> Galeri
                        </p>
                        <p className="text-[11px] text-[#0A1F44]/65 mt-0.5 leading-snug">
                          Upload dan kelola foto kegiatan galeri
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {editingUser && (
                <label className="flex items-center gap-3 text-sm text-[#0A1F44] font-bold p-3.5 bg-[#F7F7F9] rounded-xl border border-[#0A1F44]/10 cursor-pointer hover:bg-white transition-colors">
                  <input
                    type="checkbox"
                    checked={userForm.is_active}
                    onChange={e => setUserForm(f => ({ ...f, is_active: e.target.checked }))}
                    className="w-4 h-4 text-[#E63946] rounded accent-[#E63946] cursor-pointer"
                  />
                  <span>Status Akun Aktif (Bisa Login)</span>
                </label>
              )}
            </div>

            <div className="p-6 border-t border-[#0A1F44]/5 flex justify-end gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setShowUserForm(false)}
                className="px-5 py-3 rounded-xl text-[#0A1F44]/60 hover:bg-[#F7F7F9] text-sm font-bold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={saveUser}
                disabled={savingUser}
                className="bg-[#E63946] hover:bg-[#c42d3a] disabled:opacity-60 text-white px-7 py-3 rounded-xl text-sm font-black shadow-lg shadow-[#E63946]/20 hover:shadow-xl hover:shadow-[#E63946]/30 transition-all cursor-pointer"
              >
                {savingUser ? 'Menyimpan...' : 'Simpan Akun Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-[#E63946]" />
            </div>
            <h3 className="text-[#0A1F44] mb-2 font-black text-xl">Hapus Akun?</h3>
            <p className="text-[#0A1F44]/60 text-sm mb-6">Akun "{deleteUser.username}" tidak akan bisa login lagi.</p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setDeleteUser(null)}
                className="px-6 py-3 rounded-xl border border-[#0A1F44]/10 text-[#0A1F44] text-sm font-bold cursor-pointer hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={removeUser}
                className="bg-[#E63946] hover:bg-[#c42d3a] text-white px-6 py-3 rounded-xl text-sm font-bold cursor-pointer shadow-lg shadow-[#E63946]/20"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Misi Form */}
      {showMisiForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-[#0A1F44]/5 flex items-center justify-between">
              <h2 className="text-[#0A1F44] font-black text-xl">{editingMisi ? 'Edit Item Misi' : 'Tambah Item Misi'}</h2>
              <button onClick={() => setShowMisiForm(false)} className="w-9 h-9 rounded-xl bg-[#F7F7F9] flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Judul Misi" value={misiForm.title} onChange={v => setMisiForm(f => ({ ...f, title: v }))} placeholder="Pelatihan Berkualitas" />
              <div>
                <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Deskripsi Misi</label>
                <textarea value={misiForm.desc} onChange={e => setMisiForm(f => ({ ...f, desc: e.target.value }))} rows={4}
                  placeholder="Deskripsi misi lengkap..."
                  className="w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 resize-none text-sm" />
              </div>
            </div>
            <div className="p-6 border-t border-[#0A1F44]/5 flex justify-end gap-3">
              <button onClick={() => setShowMisiForm(false)} className="px-5 py-3 rounded-xl text-[#0A1F44]/60 hover:bg-[#F7F7F9] text-sm font-bold">Batal</button>
              <button onClick={saveMisiItem} disabled={savingMisi}
                className="bg-[#E63946] hover:bg-[#c42d3a] disabled:opacity-60 text-white px-7 py-3 rounded-xl text-sm font-black"
                style={{ fontWeight: 800 }}>
                {savingMisi ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteMisi && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-[#E63946]" />
            </div>
            <h3 className="text-[#0A1F44] mb-2 font-black text-xl">Hapus Misi?</h3>
            <p className="text-[#0A1F44]/60 text-sm mb-6">Misi "{deleteMisi.title}" akan dihapus dari halaman profil.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteMisi(null)} className="px-6 py-3 rounded-xl border border-[#0A1F44]/10 text-[#0A1F44] text-sm font-bold">Batal</button>
              <button onClick={removeMisiItem} className="bg-[#E63946] text-white px-6 py-3 rounded-xl text-sm font-bold">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Keunggulan Form */}
      {showKeunggulanForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-[#0A1F44]/5 flex items-center justify-between">
              <h2 className="text-[#0A1F44] font-black text-xl">{editingKeunggulan ? 'Edit Keunggulan' : 'Tambah Keunggulan'}</h2>
              <button onClick={() => setShowKeunggulanForm(false)} className="w-9 h-9 rounded-xl bg-[#F7F7F9] flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Judul Keunggulan" value={keunggulanForm.title} onChange={v => setKeunggulanForm(f => ({ ...f, title: v }))} placeholder="Beragam Program" />
              <div>
                <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Deskripsi Keunggulan</label>
                <textarea value={keunggulanForm.desc} onChange={e => setKeunggulanForm(f => ({ ...f, desc: e.target.value }))} rows={3}
                  placeholder="Deskripsi keunggulan..."
                  className="w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 resize-none text-sm" />
              </div>
              <div>
                <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Pilih Ikon</label>
                <div className="grid grid-cols-6 gap-2 bg-[#F7F7F9] p-3 rounded-xl">
                  {AVAILABLE_ICONS.map(item => {
                    const Icon = item.icon
                    const active = keunggulanForm.icon === item.name
                    return (
                      <button
                        type="button"
                        key={item.name}
                        onClick={() => setKeunggulanForm(f => ({ ...f, icon: item.name }))}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${active ? 'bg-[#E63946] border-[#E63946] text-white shadow-md' : 'bg-white border-transparent text-[#0A1F44]/60 hover:bg-white/80'}`}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#0A1F44]/5 flex justify-end gap-3">
              <button onClick={() => setShowKeunggulanForm(false)} className="px-5 py-3 rounded-xl text-[#0A1F44]/60 hover:bg-[#F7F7F9] text-sm font-bold">Batal</button>
              <button onClick={saveKeunggulanItem} disabled={savingKeunggulan}
                className="bg-[#E63946] hover:bg-[#c42d3a] disabled:opacity-60 text-white px-7 py-3 rounded-xl text-sm font-bold"
                style={{ fontWeight: 800 }}>
                {savingKeunggulan ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteKeunggulan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-[#E63946]" />
            </div>
            <h3 className="text-[#0A1F44] mb-2 font-black text-xl">Hapus Keunggulan?</h3>
            <p className="text-[#0A1F44]/60 text-sm mb-6">Keunggulan "{deleteKeunggulan.title}" akan dihapus dari halaman profil.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteKeunggulan(null)} className="px-6 py-3 rounded-xl border border-[#0A1F44]/10 text-[#0A1F44] text-sm font-bold">Batal</button>
              <button onClick={removeKeunggulanItem} className="bg-[#E63946] text-white px-6 py-3 rounded-xl text-sm font-bold">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-2 mb-8">
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 bg-[#E63946] hover:bg-[#c42d3a] disabled:opacity-60 text-white px-8 py-4 rounded-xl shadow-lg shadow-[#E63946]/20 transition-all cursor-pointer font-black">
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
        <h3 className="text-[#0A1F44] font-extrabold text-sm">{title}</h3>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, icon }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2 font-extrabold">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0A1F44]/40">{icon}</span>}
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={`w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 text-sm ${icon ? 'pl-10' : ''}`} />
      </div>
    </div>
  )
}
