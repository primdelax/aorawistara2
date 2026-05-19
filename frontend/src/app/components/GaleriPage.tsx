// src/app/components/GaleriPage.tsx
// ✅ Data galeri diambil langsung dari backend API (tidak ada data hardcoded)

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { galleryApi, type GalleryItem } from '../lib/api'
import { ImageWithFallback } from './figma/ImageWithFallback'

export function GaleriPage() {
  const [items,    setItems]    = useState<GalleryItem[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('Semua')

  const fetchGallery = async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const data = await galleryApi.getAll()
      if (!signal?.aborted) {
        setItems(data)
      }
    } catch (e) {
      if (!signal?.aborted)
        setError(e instanceof Error ? e.message : 'Gagal memuat galeri')
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchGallery(controller.signal)
    return () => controller.abort()
  }, [])

  // ─── Derive categories from real database data ───────────────────────────
  const categories: string[] = [
    'Semua',
    ...Array.from(
      new Set(
        items
          .map((i) => i.category)
          .filter((c): c is string => Boolean(c))
      )
    ),
  ]

  const filtered =
    activeCategory === 'Semua'
      ? items
      : items.filter((i) => i.category === activeCategory)

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-[#0A1F44] text-white py-20 relative overflow-hidden">
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#E63946]/20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6">
          <span
            className="inline-block px-3 py-1 bg-[#E63946] text-white rounded-full uppercase text-xs"
            style={{ fontWeight: 800, letterSpacing: '0.15em' }}
          >
            Dokumentasi
          </span>
          <h1
            className="mt-5"
            style={{
              fontWeight: 900,
              fontSize: 'clamp(44px, 7vw, 80px)',
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
            }}
          >
            Galeri <span className="text-[#E63946]">Kegiatan</span>
          </h1>
          <p className="mt-5 text-white/70 max-w-2xl">
            Energi, semangat, dan momen luar biasa dari komunitas AORA Wistara.
          </p>
        </div>
      </section>

      {/* ── FILTER KATEGORI (dari database) ─────────────────────────── */}
      <section className="py-12 bg-white sticky top-20 z-30 border-b border-[#0A1F44]/10">
        <div className="max-w-7xl mx-auto px-6 flex gap-2 flex-wrap">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="px-5 py-2.5 rounded-full bg-[#F7F7F9] animate-pulse w-24 h-10"
                />
              ))
            : categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`px-5 py-2.5 rounded-full transition-all ${
                    activeCategory === c
                      ? 'bg-[#E63946] text-white shadow-lg shadow-[#E63946]/30'
                      : 'bg-[#F7F7F9] text-[#0A1F44] hover:bg-[#0A1F44] hover:text-white'
                  }`}
                  style={{ fontWeight: 700 }}
                >
                  {c}
                </button>
              ))}
        </div>
      </section>

      {/* ── GRID FOTO ────────────────────────────────────────────────── */}
      <section className="py-16 bg-[#F7F7F9]">
        {loading && (
          <div className="py-20 text-center text-[#0A1F44]/40">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
            <p style={{ fontWeight: 600 }}>Memuat galeri…</p>
          </div>
        )}

        {!loading && error && (
          <div className="py-20 text-center">
            <p className="text-[#E63946]" style={{ fontWeight: 700 }}>
              {error}
            </p>
            <button
              onClick={() => fetchGallery()}
              className="mt-4 px-6 py-2.5 bg-[#E63946] text-white rounded-full hover:bg-[#c42d3a] transition-colors"
              style={{ fontWeight: 700 }}
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-square rounded-3xl overflow-hidden bg-[#0A1F44]"
                >
                  <ImageWithFallback
                    src={item.image_url}
                    alt={item.caption ?? item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44]/90 via-transparent to-transparent" />
                  {item.category && (
                    <div className="absolute top-4 left-4">
                      <span
                        className="bg-[#E63946] text-white px-3 py-1 rounded-full text-xs uppercase"
                        style={{ fontWeight: 800, letterSpacing: '0.1em' }}
                      >
                        {item.category}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <p style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.01em' }}>
                      {item.caption ?? item.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-[#0A1F44]/60 mt-10">
                Belum ada foto untuk kategori ini.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  )
}
