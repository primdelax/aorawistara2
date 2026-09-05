// src/app/components/AdminPage.tsx
import { useState, useEffect } from 'react'
import { authApi } from '../lib/api'
import { AdminLogin } from './admin/AdminLogin'
import { AdminDashboard } from './admin/AdminDashboard'
import { AdminProgram } from './admin/AdminProgram'
import { AdminGaleri } from './admin/AdminGaleri'
import { AdminHomepagePhotos } from './admin/AdminHomepagePhotos'
import { AdminTestimonials } from './admin/AdminTestimonials'
import { AdminPengaturan } from './admin/AdminPengaturan'
import { Logo } from './Logo'
import {
  LayoutDashboard,
  BookOpen,
  Image as ImageIcon,
  Settings,
  LogOut,
  Bell,
  ArrowLeft,
  Images,
  MessageSquareQuote,
  Lock,
  ShieldAlert,
} from 'lucide-react'

type MenuKey = 'dashboard' | 'program' | 'foto_homepage' | 'testimoni' | 'galeri' | 'pengaturan'

const MENU: { key: MenuKey; label: string; icon: typeof LayoutDashboard; sub: string }[] = [
  { key: 'dashboard',     label: 'Dashboard',      icon: LayoutDashboard,    sub: 'Ringkasan data' },
  { key: 'program',       label: 'Program',         icon: BookOpen,           sub: 'Kelola program pelatihan' },
  { key: 'foto_homepage', label: 'Foto Homepage',   icon: Images,             sub: 'Kelola animasi foto Home' },
  { key: 'testimoni',     label: 'Testimoni',       icon: MessageSquareQuote, sub: 'Kelola testimoni alumni' },
  { key: 'galeri',        label: 'Galeri',          icon: ImageIcon,          sub: 'Upload & kelola foto' },
  { key: 'pengaturan',    label: 'Pengaturan',      icon: Settings,           sub: 'Setting website' },
]

const TITLES: Record<MenuKey, string> = {
  dashboard:     'Dashboard',
  program:       'Manajemen Program',
  foto_homepage: 'Foto Homepage',
  testimoni:     'Testimoni Alumni',
  galeri:        'Manajemen Galeri',
  pengaturan:    'Pengaturan Website',
}

const SUBS: Record<MenuKey, string> = {
  dashboard:     'Statistik dan ringkasan data website',
  program:       'Tambah, edit, dan hapus program pelatihan',
  foto_homepage: 'Tambah, edit, dan hapus foto animasi homepage',
  testimoni:     'Tambah, edit, dan hapus testimoni alumni homepage',
  galeri:        'Upload, edit, dan hapus foto galeri',
  pengaturan:    'Konfigurasi nama website, kontak, dan media sosial',
}

export function AdminPage({ onExit }: { onExit: () => void }) {
  const [loggedIn, setLoggedIn] = useState(false)
  const [active, setActive] = useState<MenuKey>('dashboard')
  const [user, setUser] = useState(authApi.getUser())
  const [validating, setValidating] = useState(true) // ✅ loading saat cek session

  // ✅ Validasi session ke server saat AdminPage pertama dibuka
  useEffect(() => {
    const checkSession = async () => {
      if (authApi.isLoggedIn()) {
        const valid = await authApi.validateSession()
        if (valid) {
          setLoggedIn(true)
          setUser(authApi.getUser())
        } else {
          setLoggedIn(false)
        }
      }
      setValidating(false)
    }
    checkSession()
  }, [])

  // ✅ Listen event sesi habis dari mana saja (misal saat CRUD gagal dengan 401)
  useEffect(() => {
    const handler = () => {
      setLoggedIn(false)
      setUser(null)
    }
    window.addEventListener('aora:session-expired', handler)
    return () => window.removeEventListener('aora:session-expired', handler)
  }, [])

  const handleLogin = () => {
    setLoggedIn(true)
    setUser(authApi.getUser())
  }

  const handleLogout = async () => {
    await authApi.logout()
    setLoggedIn(false)
    setUser(null)
    onExit()
  }

  const hasAccess = (menuKey: MenuKey): boolean => {
    if (!user) return false
    const perms = user.permissions || ['all_access']
    if (perms.includes('all_access')) return true
    if (menuKey === 'dashboard') return true
    if (menuKey === 'program') return perms.includes('program')
    if (menuKey === 'foto_homepage') return perms.includes('foto_homepage')
    if (menuKey === 'testimoni') return perms.includes('testimoni')
    if (menuKey === 'galeri') return perms.includes('galeri')
    if (menuKey === 'pengaturan') return perms.includes('all_access')
    return false
  }

  // ✅ Tampilkan spinner saat validasi session berlangsung
  if (validating) {
    return (
      <div className="min-h-screen bg-[#0A1F44] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-[#E63946] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Memeriksa sesi login...</p>
        </div>
      </div>
    )
  }

  if (!loggedIn) return <AdminLogin onLogin={handleLogin} onBack={onExit} />

  const canAccessActive = hasAccess(active)

  return (
    <div className="min-h-screen bg-[#F7F7F9] flex">
      <aside className="w-64 bg-[#0A1F44] text-white flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-white/10">
          <div className="bg-white inline-block px-3 py-2 rounded-xl"><Logo className="h-10" /></div>
          <p className="mt-3 text-white/40 text-xs uppercase tracking-widest" style={{ fontWeight: 800 }}>Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 overflow-y-auto">
          {MENU.map(m => {
            const Icon = m.icon
            const on = active === m.key
            const allowed = hasAccess(m.key)

            return (
              <button
                key={m.key}
                onClick={() => setActive(m.key)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all mb-1 text-left ${
                  on
                    ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/30'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
                style={{ fontWeight: 700 }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-5 h-5 shrink-0" />
                  <div className="truncate">
                    <div className="text-sm">{m.label}</div>
                    {on && <div className="text-white/60 text-xs mt-0.5" style={{ fontWeight: 400 }}>{m.sub}</div>}
                  </div>
                </div>

                {!allowed && (
                  <div title="Terkunci - Butuh Hak Akses" className="ml-2 w-6 h-6 rounded-lg bg-black/20 text-white/50 flex items-center justify-center shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            )
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="px-4 py-3 mb-1">
            <p className="text-white text-sm truncate" style={{ fontWeight: 700 }}>{user?.username ?? 'adminaora'}</p>
            <p className="text-white/40 text-xs truncate">{user?.name ?? 'Administrator'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            style={{ fontWeight: 700 }}
          >
            <LogOut className="w-5 h-5" /><span className="text-sm">Keluar</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-20 bg-white border-b border-[#0A1F44]/10 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 text-[#0A1F44]/65 hover:text-[#E63946] transition-colors cursor-pointer"
              style={{ fontWeight: 700, fontSize: 14 }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
            <div className="h-8 w-px bg-[#0A1F44]/10"></div>
            <div>
              <p className="text-[#0A1F44]/40 text-xs uppercase tracking-widest" style={{ fontWeight: 800 }}>{SUBS[active]}</p>
              <h1 className="text-[#0A1F44]" style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.02em' }}>{TITLES[active]}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-[#F7F7F9] flex items-center justify-center text-[#0A1F44]"><Bell className="w-5 h-5" /></button>
            <div className="flex items-center gap-3 pl-3 border-l border-[#0A1F44]/10">
              <div className="w-10 h-10 rounded-full bg-[#E63946] text-white flex items-center justify-center" style={{ fontWeight: 900, fontSize: 16 }}>
                {(user?.username?.[0] ?? 'A').toUpperCase()}
              </div>
              <div>
                <p className="text-[#0A1F44] text-sm" style={{ fontWeight: 800 }}>{user?.username ?? 'adminaora'}</p>
                <p className="text-[#0A1F44]/50 text-xs capitalize">{user?.role ?? 'admin'}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 relative">
          {/* If the current admin doesn't have permission for this menu, show frosted glass lens blur overlay */}
          {!canAccessActive ? (
            <div className="relative min-h-[500px] w-full rounded-3xl overflow-hidden flex items-center justify-center p-8">
              {/* Background ambient decorative shapes for lens blur */}
              <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#E63946]/15 blur-3xl" />
              <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[#0A1F44]/10 blur-3xl" />

              {/* Frosted Glass Lens Blur Container */}
              <div className="relative z-10 max-w-lg w-full rounded-3xl p-10 bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(10,31,68,0.12)] text-center">
                {/* Locked Padlock Icon with soft pulsing ring */}
                <div className="relative mx-auto w-24 h-24 rounded-full bg-gradient-to-b from-red-50 to-red-100/80 border border-red-200/60 shadow-lg shadow-red-500/10 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 rounded-full bg-[#E63946]/10 animate-ping opacity-30" />
                  <Lock className="w-10 h-10 text-[#E63946] relative z-10" />
                </div>

                {/* Primary Notice */}
                <h2 className="text-[#0A1F44] mb-3" style={{ fontWeight: 900, fontSize: 24, letterSpacing: '-0.02em' }}>
                  Anda tidak punya akses untuk menu ini
                </h2>

                {/* Description */}
                <p className="text-[#0A1F44]/65 text-sm leading-relaxed mb-8">
                  Akun Anda tidak memiliki izin untuk mengelola menu <strong>{TITLES[active]}</strong>. Silakan hubungi Super Admin untuk memberikan hak akses pada menu ini.
                </p>

                {/* Action button to return to allowed view */}
                <button
                  onClick={() => setActive('dashboard')}
                  className="inline-flex items-center gap-2 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white px-7 py-3.5 rounded-2xl shadow-lg shadow-[#0A1F44]/20 transition-all hover:scale-[1.02] text-sm"
                  style={{ fontWeight: 800 }}
                >
                  <LayoutDashboard className="w-4 h-4" /> Kembali ke Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              {active === 'dashboard'     && <AdminDashboard />}
              {active === 'program'       && <AdminProgram />}
              {active === 'foto_homepage' && <AdminHomepagePhotos />}
              {active === 'testimoni'     && <AdminTestimonials />}
              {active === 'galeri'        && <AdminGaleri />}
              {active === 'pengaturan'    && <AdminPengaturan />}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
