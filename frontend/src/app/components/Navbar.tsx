// src/app/components/Navbar.tsx
// ✅ site_name dari settings API (dipakai di title tag / aria)

import { Logo } from './Logo'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useSettings } from '../hooks/useSettings'

type Page = 'home' | 'profil' | 'program' | 'galeri' | 'kontak' | 'admin'

const items: { key: Page; label: string }[] = [
  { key: 'home',    label: 'Beranda' },
  { key: 'profil',  label: 'Profil' },
  { key: 'program', label: 'Program' },
  { key: 'galeri',  label: 'Galeri' },
  { key: 'kontak',  label: 'Kontak' },
]

export function Navbar({
  current,
  onNavigate,
}: {
  current: Page
  onNavigate: (p: Page) => void
}) {
  const [open] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { settings } = useSettings()
  const siteName = settings.site_name || 'Aora'

  return (
    <header
      className="sticky top-0 z-50 bg-white border-b-2 border-[#0A1F44]/5 shadow-sm"
      aria-label={siteName}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="cursor-pointer flex items-center"
          aria-label={`${siteName} — Kembali ke Beranda`}
        >
          <Logo className="h-16 md:h-[72px]" />
        </button>

        <nav className="hidden md:flex items-center gap-1" aria-label="Navigasi utama">
          {items.map((item) => {
            const active = current === item.key
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`relative px-5 py-2 transition-all ${
                  active ? 'text-[#E63946]' : 'text-[#0A1F44] hover:text-[#E63946]'
                }`}
                style={{ fontWeight: 700, letterSpacing: '0.02em' }}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-[#E63946] rounded-full" />
                )}
              </button>
            )
          })}
        </nav>

        <button
          onClick={() => onNavigate('kontak')}
          className="hidden md:inline-flex items-center px-5 py-2.5 bg-[#0A1F44] text-white rounded-full hover:bg-[#E63946] transition-colors"
          style={{ fontWeight: 700 }}
        >
          Daftar Sekarang
        </button>

        <button
          className="md:hidden p-2 text-[#0A1F44]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t bg-white">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                onNavigate(item.key)
                setMenuOpen(false)
              }}
              className="block w-full text-left px-6 py-3 text-[#0A1F44] hover:bg-[#0A1F44]/5"
              style={{ fontWeight: 700 }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  )
}
