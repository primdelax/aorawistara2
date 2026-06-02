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
import { LayoutDashboard, BookOpen, Image as ImageIcon, Settings, LogOut, Bell, ArrowLeft, Images, MessageSquareQuote } from 'lucide-react'

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

  useEffect(() => {
    if (authApi.isLoggedIn()) { setLoggedIn(true); setUser(authApi.getUser()) }
  }, [])

  const handleLogin = () => { setLoggedIn(true); setUser(authApi.getUser()) }

  const handleLogout = async () => {
    await authApi.logout()
    setLoggedIn(false)
    onExit()
  }

  if (!loggedIn) return <AdminLogin onLogin={handleLogin} onBack={onExit} />

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
            return (
              <button key={m.key} onClick={() => setActive(m.key)}
                className={"w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 text-left " + (on ? "bg-[#E63946] text-white shadow-lg shadow-[#E63946]/30" : "text-white/70 hover:bg-white/5 hover:text-white")}
                style={{ fontWeight: 700 }}>
                <Icon className="w-5 h-5 shrink-0" />
                <div>
                  <div className="text-sm">{m.label}</div>
                  {on && <div className="text-white/60 text-xs mt-0.5" style={{ fontWeight: 400 }}>{m.sub}</div>}
                </div>
              </button>
            )
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="px-4 py-3 mb-1">
            <p className="text-white text-sm truncate" style={{ fontWeight: 700 }}>{user?.username ?? 'adminaora'}</p>
            <p className="text-white/40 text-xs truncate">{user?.name ?? 'Administrator'}</p>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            style={{ fontWeight: 700 }}>
            <LogOut className="w-5 h-5" /><span className="text-sm">Keluar</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-20 bg-white border-b border-[#0A1F44]/10 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={onExit}
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
        <div className="flex-1 p-8">
          {active === 'dashboard'     && <AdminDashboard />}
          {active === 'program'       && <AdminProgram />}
          {active === 'foto_homepage' && <AdminHomepagePhotos />}
          {active === 'testimoni'     && <AdminTestimonials />}
          {active === 'galeri'        && <AdminGaleri />}
          {active === 'pengaturan'    && <AdminPengaturan />}
        </div>
      </main>
    </div>
  )
}
