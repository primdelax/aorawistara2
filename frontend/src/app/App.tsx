// src/app/App.tsx
// ✅ SettingsProvider wraps seluruh app agar settings hanya di-fetch sekali

import { useState, useEffect } from 'react'
import { SettingsProvider } from './context/SettingsContext'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { HomePage } from './components/HomePage'
import { ProfilPage } from './components/ProfilPage'
import { ProgramPage } from './components/ProgramPage'
import { GaleriPage } from './components/GaleriPage'
import { KontakPage } from './components/KontakPage'
import { AdminPage } from './components/AdminPage'
import { Settings } from 'lucide-react'

type Page = 'home' | 'profil' | 'program' | 'galeri' | 'kontak' | 'admin'

export default function App() {
  const getInitialPage = (): Page => {
    if (typeof window === 'undefined') return 'home'
    const hash = window.location.hash.replace('#', '').replace(/^\//, '')
    if (['home', 'profil', 'program', 'galeri', 'kontak', 'admin'].includes(hash)) {
      return hash as Page
    }
    return 'home'
  }

  const [page, setPage] = useState<Page>(getInitialPage)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (window.location.hash.replace('#', '').replace(/^\//, '') !== page) {
      window.location.hash = page === 'home' ? '' : page
    }
  }, [page])

  useEffect(() => {
    const onHashChange = () => {
      const p = getInitialPage()
      setPage(p)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (page === 'admin') {
    return (
      // Admin tetap dapat akses settings jika diperlukan
      <SettingsProvider>
        <AdminPage onExit={() => setPage('home')} />
      </SettingsProvider>
    )
  }

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-white text-[#0A1F44]">
        <style>{`
          @keyframes marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <Navbar current={page} onNavigate={(p) => setPage(p)} />
        {page === 'home'    && <HomePage   onNavigate={(p) => setPage(p as Page)} />}
        {page === 'profil'  && <ProfilPage />}
        {page === 'program' && <ProgramPage />}
        {page === 'galeri'  && <GaleriPage />}
        {page === 'kontak'  && <KontakPage />}
        <Footer />
        <button
          onClick={() => setPage('admin')}
          title="Admin Panel"
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[#0A1F44] hover:bg-[#E63946] text-white shadow-xl flex items-center justify-center transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </SettingsProvider>
  )
}
