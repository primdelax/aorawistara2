import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, X, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { galleryApi, type GalleryItem } from '../lib/api'

interface GalleryCategory {
  id: string
  name: string
  description: string
  cover: string
  color: string
  images: { src: string; caption: string }[]
}

const COLORS = ['#C0392B', '#2471A3', '#1E8449', '#6C3483', '#D4AC0D', '#E63946', '#0A1F44']

function groupByProgram(items: GalleryItem[]): GalleryCategory[] {
  const groups = new Map<string, GalleryItem[]>()

  items.forEach(item => {
    const key = item.program_id ? `program-${item.program_id}` : `misc-${item.category || 'umum'}`
    groups.set(key, [...(groups.get(key) || []), item])
  })

  return Array.from(groups.entries()).map(([id, group], index) => {
    const first = group[0]
    const name = first.program_title || first.category || 'Galeri Umum'
    return {
      id,
      name,
      description: `Dokumentasi kegiatan dan karya dari program ${name}.`,
      cover: first.image_url,
      color: COLORS[index % COLORS.length],
      images: group.map(item => ({
        src: item.image_url,
        caption: item.caption || item.title,
      })),
    }
  })
}

function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: { src: string; caption: string }[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const img = images[index]
  return (
    <div className="galeri-lightbox-overlay" onClick={onClose}>
      <div className="galeri-lightbox-box" onClick={(e) => e.stopPropagation()}>
        <button className="galeri-lightbox-close" onClick={onClose}>
          <X size={22} />
        </button>

        <div className="galeri-lightbox-img-wrap">
          <img src={img.src} alt={img.caption} className="galeri-lightbox-img" />
        </div>

        <div className="galeri-lightbox-nav">
          <button className="galeri-lightbox-arrow" onClick={onPrev} disabled={index === 0}>
            <ChevronLeft size={28} />
          </button>
          <div className="galeri-lightbox-caption">
            <p>{img.caption}</p>
            <span>{index + 1} / {images.length}</span>
          </div>
          <button className="galeri-lightbox-arrow" onClick={onNext} disabled={index === images.length - 1}>
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </div>
  )
}

function CategoryDetail({ category, onBack }: { category: GalleryCategory; onBack: () => void }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  return (
    <div>
      <section className="galeri-detail-hero" style={{ '--accent': category.color } as React.CSSProperties}>
        <div className="galeri-detail-hero-bg">
          <img src={category.cover} alt={category.name} className="galeri-detail-hero-cover" />
          <div className="galeri-detail-hero-overlay" />
        </div>
        <div className="galeri-detail-hero-content">
          <button className="galeri-back-btn" onClick={onBack}>
            <ArrowLeft size={18} />
            <span>Kembali ke Galeri</span>
          </button>
          <span className="galeri-detail-badge" style={{ background: category.color }}>
            {category.name}
          </span>
          <h1 className="galeri-detail-title">{category.name}</h1>
          <p className="galeri-detail-desc">{category.description}</p>
          <p className="galeri-detail-count">{category.images.length} Foto</p>
        </div>
      </section>

      <section className="galeri-detail-grid-section">
        <div className="galeri-detail-grid">
          {category.images.map((img, i) => (
            <div key={`${img.src}-${i}`} className="galeri-detail-card" onClick={() => setLightboxIdx(i)}>
              <img src={img.src} alt={img.caption} className="galeri-detail-card-img" />
              <div className="galeri-detail-card-overlay">
                <p className="galeri-detail-card-caption">{img.caption}</p>
                <span className="galeri-detail-card-num">#{i + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {lightboxIdx !== null && (
        <Lightbox
          images={category.images}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx((p) => Math.max(0, (p ?? 0) - 1))}
          onNext={() => setLightboxIdx((p) => Math.min(category.images.length - 1, (p ?? 0) + 1))}
        />
      )}
    </div>
  )
}

export function GaleriPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<GalleryCategory | null>(null)

  useEffect(() => {
    setLoading(true)
    galleryApi.getAll()
      .then(setItems)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Gagal memuat galeri'))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => groupByProgram(items), [items])

  if (selected) {
    return <CategoryDetail category={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div>
      <section className="galeri-hero">
        <div className="galeri-hero-blob galeri-hero-blob-1" />
        <div className="galeri-hero-blob galeri-hero-blob-2" />
        <div className="galeri-hero-inner">
          <span className="galeri-hero-badge">Dokumentasi</span>
          <h1 className="galeri-hero-title">
            Galeri <span className="galeri-hero-accent">Program</span>
          </h1>
          <p className="galeri-hero-subtitle">
            Pilih program di bawah untuk menjelajahi dokumentasi kegiatan dan karya dari komunitas <strong>Aora</strong>.
          </p>
        </div>
      </section>

      <section className="galeri-cat-section">
        <div className="galeri-cat-header">
          <h2 className="galeri-cat-heading">Pilih Program</h2>
          <p className="galeri-cat-sub">{categories.length} program tersedia</p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[#0A1F44]/40">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3" />
            <p className="text-sm">Memuat galeri...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl py-16 text-center text-[#E63946] border border-[#0A1F44]/5">
            <p className="text-sm" style={{ fontWeight: 800 }}>{error}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-2xl py-16 text-center text-[#0A1F44]/45 border border-[#0A1F44]/5">
            <p className="text-sm">Belum ada foto galeri yang tersedia.</p>
          </div>
        ) : (
          <div className="galeri-cat-grid">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className="galeri-cat-card"
                onClick={() => setSelected(cat)}
                aria-label={`Lihat galeri ${cat.name}`}
              >
                <img src={cat.cover} alt={cat.name} className="galeri-cat-card-img" />
                <div className="galeri-cat-card-overlay" style={{ '--cat-color': cat.color } as React.CSSProperties} />
                <span className="galeri-cat-count" style={{ background: cat.color }}>
                  {cat.images.length} Foto
                </span>
                <div className="galeri-cat-card-body">
                  <h3 className="galeri-cat-card-name">{cat.name}</h3>
                  <p className="galeri-cat-card-desc">{cat.description}</p>
                  <span className="galeri-cat-card-cta" style={{ color: cat.color }}>
                    Lihat Foto →
                  </span>
                </div>
                <div className="galeri-cat-card-shine" />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
