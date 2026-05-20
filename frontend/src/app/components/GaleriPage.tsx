// src/app/components/GaleriPage.tsx
// ✅ 5 Kategori statis (Batik, Melukis, Personality, Sablon, Tari)
//    dengan gambar lokal dari backend/uploads/gallery/

import { useState } from 'react'
import { ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react'

// ─── Base URL untuk gambar (dari folder public/gallery Vite) ────────────────
const BASE = '/gallery'

// ─── Data Kategori ──────────────────────────────────────────────────────────
interface Category {
  id: string
  name: string
  description: string
  cover: string          // gambar thumbnail untuk grid kategori
  color: string          // warna aksen
  images: { src: string; caption: string }[]
}

const CATEGORIES: Category[] = [
  {
    id: 'batik',
    name: 'Batik',
    description: 'Seni membatik tradisional — dari lilin malam hingga karya kain yang memukau.',
    cover: `${BASE}/batik1.jpg`,
    color: '#C0392B',
    images: [
      { src: `${BASE}/batik1.jpg`, caption: 'Proses membatik dengan canting' },
      { src: `${BASE}/batik2.jpg`, caption: 'Karya batik yang sudah jadi' },
    ],
  },
  {
    id: 'melukis',
    name: 'Melukis',
    description: 'Ekspresi jiwa lewat kuas dan cat — setiap goresan adalah cerita.',
    cover: `${BASE}/melukis1.jpg`,
    color: '#2471A3',
    images: [
      { src: `${BASE}/melukis1.jpg`, caption: 'Sesi melukis bersama' },
      { src: `${BASE}/melukis2.png`, caption: 'Karya lukis anggota' },
      { src: `${BASE}/melukis3.jpg`, caption: 'Workshop melukis outdoor' },
      { src: `${BASE}/melukis4.jpg`, caption: 'Detail teknik kuas' },
      { src: `${BASE}/melukis5.jpg`, caption: 'Pameran karya lukis' },
      { src: `${BASE}/melukis6.jpg`, caption: 'Eksplorasi warna akrilik' },
    ],
  },
  {
    id: 'personality',
    name: 'Personality',
    description: 'Momen kebersamaan, potret diri, dan karakter unik setiap anggota AORA.',
    cover: `${BASE}/personality1.jpg`,
    color: '#1E8449',
    images: [
      { src: `${BASE}/personality1.jpg`, caption: 'Potret anggota AORA Wistara' },
    ],
  },
  {
    id: 'sablon',
    name: 'Sablon',
    description: 'Dari desain digital ke media cetak — seni sablon yang penuh kreativitas.',
    cover: `${BASE}/sablon1.jpg`,
    color: '#6C3483',
    images: [
      { src: `${BASE}/sablon1.jpg`, caption: 'Proses cetak sablon kaus' },
    ],
  },
  {
    id: 'tari',
    name: 'Tari',
    description: 'Gerak yang bercerita — pentas tari tradisional dan kontemporer.',
    cover: `${BASE}/tari1.jpg`,
    color: '#D4AC0D',
    images: [
      { src: `${BASE}/tari1.jpg`, caption: 'Pentas tari tradisional' },
      { src: `${BASE}/tari2.png`, caption: 'Latihan tari bersama' },
    ],
  },
]

// ─── Lightbox ───────────────────────────────────────────────────────────────
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
    <div
      className="galeri-lightbox-overlay"
      onClick={onClose}
    >
      <div className="galeri-lightbox-box" onClick={(e) => e.stopPropagation()}>
        {/* close */}
        <button className="galeri-lightbox-close" onClick={onClose}>
          <X size={22} />
        </button>

        {/* image */}
        <div className="galeri-lightbox-img-wrap">
          <img src={img.src} alt={img.caption} className="galeri-lightbox-img" />
        </div>

        {/* nav */}
        <div className="galeri-lightbox-nav">
          <button
            className="galeri-lightbox-arrow"
            onClick={onPrev}
            disabled={index === 0}
          >
            <ChevronLeft size={28} />
          </button>
          <div className="galeri-lightbox-caption">
            <p>{img.caption}</p>
            <span>{index + 1} / {images.length}</span>
          </div>
          <button
            className="galeri-lightbox-arrow"
            onClick={onNext}
            disabled={index === images.length - 1}
          >
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Detail View (setelah klik kategori) ────────────────────────────────────
function CategoryDetail({
  category,
  onBack,
}: {
  category: Category
  onBack: () => void
}) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  return (
    <div>
      {/* ── HERO DETAIL ─────────────────────────────────────────────────── */}
      <section
        className="galeri-detail-hero"
        style={{ '--accent': category.color } as React.CSSProperties}
      >
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

      {/* ── GRID FOTO ───────────────────────────────────────────────────── */}
      <section className="galeri-detail-grid-section">
        <div className="galeri-detail-grid">
          {category.images.map((img, i) => (
            <div
              key={i}
              className="galeri-detail-card"
              onClick={() => setLightboxIdx(i)}
            >
              <img src={img.src} alt={img.caption} className="galeri-detail-card-img" />
              <div className="galeri-detail-card-overlay">
                <p className="galeri-detail-card-caption">{img.caption}</p>
                <span className="galeri-detail-card-num">#{i + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIGHTBOX ────────────────────────────────────────────────────── */}
      {lightboxIdx !== null && (
        <Lightbox
          images={category.images}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx((p) => Math.max(0, (p ?? 0) - 1))}
          onNext={() =>
            setLightboxIdx((p) => Math.min(category.images.length - 1, (p ?? 0) + 1))
          }
        />
      )}
    </div>
  )
}

// ─── Main GaleriPage ────────────────────────────────────────────────────────
export function GaleriPage() {
  const [selected, setSelected] = useState<Category | null>(null)

  if (selected) {
    return (
      <CategoryDetail
        category={selected}
        onBack={() => setSelected(null)}
      />
    )
  }

  return (
    <div>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="galeri-hero">
        <div className="galeri-hero-blob galeri-hero-blob-1" />
        <div className="galeri-hero-blob galeri-hero-blob-2" />
        <div className="galeri-hero-inner">
          <span className="galeri-hero-badge">Dokumentasi</span>
          <h1 className="galeri-hero-title">
            Galeri <span className="galeri-hero-accent">Kegiatan</span>
          </h1>
          <p className="galeri-hero-subtitle">
            Pilih kategori di bawah untuk menjelajahi momen-momen luar biasa
            dari komunitas <strong>AORA Wistara</strong>.
          </p>
        </div>
      </section>

      {/* ── KATEGORI GRID ─────────────────────────────────────────────── */}
      <section className="galeri-cat-section">
        <div className="galeri-cat-header">
          <h2 className="galeri-cat-heading">Pilih Kategori</h2>
          <p className="galeri-cat-sub">{CATEGORIES.length} kategori tersedia</p>
        </div>

        <div className="galeri-cat-grid">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className="galeri-cat-card"
              onClick={() => setSelected(cat)}
              aria-label={`Lihat kategori ${cat.name}`}
            >
              {/* Background image */}
              <img src={cat.cover} alt={cat.name} className="galeri-cat-card-img" />

              {/* Gradient overlay */}
              <div
                className="galeri-cat-card-overlay"
                style={{ '--cat-color': cat.color } as React.CSSProperties}
              />

              {/* Count badge */}
              <span className="galeri-cat-count" style={{ background: cat.color }}>
                {cat.images.length} Foto
              </span>

              {/* Bottom content */}
              <div className="galeri-cat-card-body">
                <h3 className="galeri-cat-card-name">{cat.name}</h3>
                <p className="galeri-cat-card-desc">{cat.description}</p>
                <span className="galeri-cat-card-cta" style={{ color: cat.color }}>
                  Lihat Foto →
                </span>
              </div>

              {/* Hover shine effect */}
              <div className="galeri-cat-card-shine" />
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
