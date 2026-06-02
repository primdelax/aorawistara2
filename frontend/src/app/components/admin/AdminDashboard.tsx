// src/app/components/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react'
import { programApi, galleryApi } from '../../lib/api'
import { BookOpen, Image as ImageIcon, TrendingUp, RefreshCw, BookMarked, Settings, MessageSquareQuote } from 'lucide-react'

export function AdminDashboard() {
  const [totalPrograms, setTotalPrograms] = useState(0)
  const [activePrograms, setActivePrograms] = useState(0)
  const [totalGallery, setTotalGallery] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [progs, gallery] = await Promise.all([programApi.getAll(), galleryApi.getAll()])
        setTotalPrograms(progs.length)
        setActivePrograms(progs.filter(p => p.status === 'aktif').length)
        setTotalGallery(gallery.length)
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return (
    <div className="py-20 text-center text-[#0A1F44]/40">
      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
      <p className="text-sm">Memuat data dashboard...</p>
    </div>
  )

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-[#0A1F44] text-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/60 text-xs uppercase tracking-widest" style={{ fontWeight: 800 }}>Total Program</p>
            <div className="w-10 h-10 bg-[#E63946] rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p style={{ fontWeight: 900, fontSize: 48, letterSpacing: '-0.04em', lineHeight: 1 }}>{totalPrograms}</p>
        </div>
        <div className="bg-white border border-[#0A1F44]/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[#0A1F44]/50 text-xs uppercase tracking-widest" style={{ fontWeight: 800 }}>Program Aktif</p>
            <div className="w-10 h-10 bg-[#0A1F44] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-[#0A1F44]" style={{ fontWeight: 900, fontSize: 48, letterSpacing: '-0.04em', lineHeight: 1 }}>{activePrograms}</p>
        </div>
        <div className="bg-white border border-[#0A1F44]/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[#0A1F44]/50 text-xs uppercase tracking-widest" style={{ fontWeight: 800 }}>Foto Galeri</p>
            <div className="w-10 h-10 bg-[#0A1F44] rounded-xl flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-[#0A1F44]" style={{ fontWeight: 900, fontSize: 48, letterSpacing: '-0.04em', lineHeight: 1 }}>{totalGallery}</p>
        </div>
      </div>

      {/* Panduan Menu */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-[#0A1F44]/5">
          <h3 className="text-[#0A1F44] mb-4" style={{ fontWeight: 900, fontSize: 18 }}>Panduan Menu Admin</h3>
          <div className="space-y-3">
            {[
              { icon: <BookMarked className="w-4 h-4" />, title: 'Program', desc: 'Tambah, edit, dan hapus program pelatihan yang tampil di website' },
              { icon: <ImageIcon className="w-4 h-4" />, title: 'Foto Homepage', desc: 'Kelola foto animasi yang tampil di halaman Home' },
              { icon: <TrendingUp className="w-4 h-4" />, title: 'Program Unggulan', desc: 'Kelola kartu program unggulan yang tampil di Home' },
              { icon: <MessageSquareQuote className="w-4 h-4" />, title: 'Testimoni', desc: 'Kelola foto dan komentar alumni yang tampil di Home' },
              { icon: <ImageIcon className="w-4 h-4" />, title: 'Galeri', desc: 'Upload, edit, dan hapus foto untuk halaman galeri publik' },
              { icon: <Settings className="w-4 h-4" />, title: 'Pengaturan', desc: 'Ubah nama website, kontak, alamat, dan link media sosial' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[#F7F7F9]">
                <div className="w-9 h-9 bg-[#0A1F44] rounded-xl flex items-center justify-center text-white shrink-0">{item.icon}</div>
                <div>
                  <p className="text-[#0A1F44] text-sm" style={{ fontWeight: 800 }}>{item.title}</p>
                  <p className="text-[#0A1F44]/50 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#E63946] rounded-2xl p-6 text-white">
          <h3 className="mb-4" style={{ fontWeight: 900, fontSize: 18 }}>Info Koneksi Sistem</h3>
          <div className="space-y-3">
            {[
              { label: 'Backend API', value: 'localhost:5000' },
              { label: 'Database', value: 'MySQL / aora_db' },
              { label: 'Auth', value: 'JWT Bearer Token' },
              { label: 'Upload Foto', value: 'Lokal /uploads/' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/10">
                <span className="text-white/70 text-sm">{row.label}</span>
                <span className="text-sm flex items-center gap-2" style={{ fontWeight: 700 }}>
                  <span className="w-2 h-2 rounded-full bg-green-300" />
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
