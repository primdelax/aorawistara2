// src/app/components/HomePage.tsx
// ✅ WA link, site_name, tagline, about_text diambil dari settings API

import { ArrowRight, Coffee, Music, Palette, Sparkles, Star } from 'lucide-react'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { useSettings, buildWhatsAppUrl } from '../hooks/useSettings'
import { useEffect, useRef, useState } from 'react'
import logoAora from '../../images/LOGO AORA POLOS.png'

// ── Gallery images (from /public/gallery) ──────────────────────────────────
const GALLERY_IMAGES = [
  '/gallery/tari1.jpg',
  '/gallery/tari2.png',
  '/gallery/batik1.jpg',
  '/gallery/batik2.jpg',
  '/gallery/melukis1.jpg',
  '/gallery/melukis2.png',
  '/gallery/melukis3.jpg',
  '/gallery/melukis4.jpg',
  '/gallery/melukis5.jpg',
  '/gallery/melukis6.jpg',
  '/gallery/personality1.jpg',
  '/gallery/sablon1.jpg',
]

// ── Slideshow Component ────────────────────────────────────────────────────
function HeroSlideshow() {
  const [current, setCurrent] = useState(0)
  const [animClass, setAnimClass] = useState('')
  const throwDirRef = useRef<'right' | 'left'>('right')

  const nextIndex = (current + 1) % GALLERY_IMAGES.length

  useEffect(() => {
    const timer = setTimeout(() => {
      // Alternate direction
      const nextDir = throwDirRef.current === 'right' ? 'left' : 'right'
      throwDirRef.current = nextDir
      setAnimClass(nextDir === 'right' ? 'slide-throw-right' : 'slide-throw-left')

      // Switch current image to the next one after the throw animation finishes (500ms)
      const changeTimer = setTimeout(() => {
        setCurrent(nextIndex)
        setAnimClass('')
      }, 500)

      return () => clearTimeout(changeTimer)
    }, 3000)

    return () => clearTimeout(timer)
  }, [current, nextIndex])

  return (
    <div className="absolute inset-4 rounded-3xl overflow-hidden bg-[#0A1F44]">
      <style>{`
        @keyframes throwRight {
          0%   { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(120%, -80%) rotate(25deg); opacity: 0; }
        }
        @keyframes throwLeft {
          0%   { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(-120%, -80%) rotate(-25deg); opacity: 0; }
        }
        .slide-throw-right { animation: throwRight 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; z-index: 2; }
        .slide-throw-left  { animation: throwLeft  0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; z-index: 2; }
      `}</style>
      
      {/* Background (Next) Image */}
      <img
        src={GALLERY_IMAGES[nextIndex]}
        alt="Next Slide"
        className="w-full h-full object-cover"
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
      />

      {/* Foreground (Current) Image (does the throwing) */}
      <img
        key={current}
        src={GALLERY_IMAGES[current]}
        alt={`Gallery ${current + 1}`}
        className={`w-full h-full object-cover ${animClass}`}
        style={{ position: 'absolute', inset: 0, zIndex: 2 }}
      />

      {/* dot indicators */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '6px',
          zIndex: 10,
        }}
      >
        {GALLERY_IMAGES.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === current ? '20px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: i === current ? '#E63946' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function HomePage({ onNavigate }: { onNavigate: (p: any) => void }) {
  const { settings } = useSettings()

  const waUrl      = buildWhatsAppUrl(settings.phone)
  const siteName   = settings.site_name  || 'Aora'
  const tagline    = settings.tagline    || 'Kami Beda Tapi Luar Biasa'
  const aboutText  = settings.about_text || ''

  return (
    <div>
      {/* HERO */}
      <section className="relative bg-[#0A1F44] text-white overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#E63946]/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-[600px] h-[600px] rounded-full bg-[#E63946]/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <h1
              className="text-white"
              style={{ lineHeight: 1, letterSpacing: '-0.03em' }}
            >
              <span
                className="block text-white/80"
                style={{ fontWeight: 700, fontSize: 'clamp(16px, 2.2vw, 26px)', letterSpacing: '0.04em', textTransform: 'uppercase' }}
              >
                lembaga kursus
              </span>
              <span
                className="block text-[#E63946]"
                style={{ fontWeight: 900, fontSize: 'clamp(72px, 12vw, 130px)', letterSpacing: '-0.05em', lineHeight: 0.88 }}
              >
                {siteName}
              </span>
            </h1>
            <p className="mt-5 text-white/70 max-w-xl">
              {aboutText ||
                'Tempat di mana bakat tumbuh, keahlian terasah, dan masa depan dipersiapkan dengan percaya diri. Pelatihan profesional dari barista hingga seni budaya.'}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe5a] text-white px-7 py-4 rounded-full transition-all hover:scale-[1.02] shadow-lg shadow-[#25D366]/30"
                style={{ fontWeight: 800 }}
              >
                <WhatsAppIcon /> Hubungi via WhatsApp
              </a>
              <button
                onClick={() => onNavigate('program')}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white px-7 py-4 rounded-full transition-all"
                style={{ fontWeight: 700 }}
              >
                Lihat Program <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="md:col-span-5 relative">
            <div className="relative aspect-square">
              <div className="absolute inset-0 bg-[#E63946] rounded-3xl rotate-6" />
              <div className="absolute inset-0 bg-white/10 backdrop-blur rounded-3xl -rotate-3 border border-white/20" />
              <HeroSlideshow />
              <div className="absolute -bottom-6 -left-6 bg-white text-[#0A1F44] px-5 py-4 rounded-2xl shadow-xl z-10">
                <div style={{ fontWeight: 900, fontSize: '32px', lineHeight: 1 }}>9+</div>
                <div className="text-xs uppercase tracking-wider" style={{ fontWeight: 700 }}>
                  Program Aktif
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* marquee */}
        <div className="relative border-t border-white/10 overflow-hidden bg-[#E63946]">
          <div
            className="flex whitespace-nowrap py-3"
            style={{ animation: 'marquee 30s linear infinite' }}
          >
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <span
                  key={i}
                  className="mx-8 text-white inline-flex items-center gap-3"
                  style={{ fontWeight: 800, letterSpacing: '0.1em' }}
                >
                  BARISTA <Star className="w-3 h-3" fill="white" /> MENARI{' '}
                  <Star className="w-3 h-3" fill="white" /> BATIK{' '}
                  <Star className="w-3 h-3" fill="white" /> MELUKIS{' '}
                  <Star className="w-3 h-3" fill="white" /> KOMPUTER{' '}
                  <Star className="w-3 h-3" fill="white" />
                </span>
              ))}
          </div>
        </div>
      </section>

      {/* Tentang Kami */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-5">
            <span
              className="inline-block px-3 py-1 bg-[#E63946]/10 text-[#E63946] rounded-full uppercase text-xs"
              style={{ fontWeight: 800, letterSpacing: '0.15em' }}
            >
              Tentang Kami
            </span>
            <h2
              className="mt-4 text-[#0A1F44]"
              style={{
                fontWeight: 900,
                fontSize: 'clamp(36px, 5vw, 56px)',
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}
            >
              Kami Beda
              <br />
              Tapi <span className="text-[#E63946]">Luar Biasa.</span>
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-[#0A1F44]/80 text-lg leading-relaxed">
              {aboutText ||
                'Aora adalah Lembaga Khusus dan Pelatihan (LKP) yang membentuk individu berdaya saing melalui kombinasi keterampilan praktis dan ekspresi seni. Kami percaya setiap orang punya potensi luar biasa yang perlu diberi ruang untuk berkembang.'}
            </p>
            <p className="text-[#0A1F44]/70 mt-4 leading-relaxed">
              Dengan pengajar berpengalaman dan kurikulum berbasis komunitas, AORA hadir sebagai
              rumah bagi mereka yang siap berbeda — dan menjadi luar biasa.
            </p>
            <button
              onClick={() => onNavigate('profil')}
              className="mt-7 inline-flex items-center gap-2 text-[#E63946] hover:gap-4 transition-all"
              style={{ fontWeight: 800 }}
            >
              Selengkapnya <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Program Kami */}
      <section className="py-24 bg-[#F7F7F9]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <span
                className="inline-block px-3 py-1 bg-[#0A1F44] text-white rounded-full uppercase text-xs"
                style={{ fontWeight: 800, letterSpacing: '0.15em' }}
              >
                Program Unggulan
              </span>
              <h2
                className="mt-4 text-[#0A1F44]"
                style={{
                  fontWeight: 900,
                  fontSize: 'clamp(36px, 5vw, 56px)',
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                }}
              >
                Program Kami
              </h2>
            </div>
            <button
              onClick={() => onNavigate('program')}
              className="inline-flex items-center gap-2 text-[#0A1F44] border-2 border-[#0A1F44] px-5 py-2.5 rounded-full hover:bg-[#0A1F44] hover:text-white transition-all"
              style={{ fontWeight: 700 }}
            >
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <ProgramCard
              icon={<Coffee className="w-7 h-7" />}
              title="Pelatihan Barista"
              desc="Latte art, espresso, manual brew. Standar profesional kafe modern."
              img="https://images.unsplash.com/photo-1637029567716-6c6775c341e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            />
            <ProgramCard
              icon={<Music className="w-7 h-7" />}
              title="Seni Menari"
              desc="Tradisional dan kontemporer. Bangun ekspresi dan percaya diri di panggung."
              img="https://images.unsplash.com/photo-1666902715814-691194b2f45f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              accent
            />
            <ProgramCard
              icon={<Palette className="w-7 h-7" />}
              title="Batik"
              desc="Membatik dari pola hingga pewarnaan. Lestarikan warisan budaya."
              img="https://images.unsplash.com/photo-1604973104381-870c92f10343?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0A1F44] text-white py-20 relative overflow-hidden">
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-[#E63946]/20 blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Sparkles className="w-10 h-10 text-[#E63946] mx-auto mb-4" />
          <h2
            style={{
              fontWeight: 900,
              fontSize: 'clamp(36px, 5vw, 56px)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            Siap menjadi <span className="text-[#E63946]">luar biasa?</span>
          </h2>
          <p className="mt-5 text-white/70 max-w-xl mx-auto">
            Bergabunglah dengan komunitas {siteName} hari ini. Konsultasi gratis via WhatsApp.
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe5a] text-white px-8 py-4 rounded-full transition-all hover:scale-[1.02] shadow-lg shadow-[#25D366]/30"
            style={{ fontWeight: 800 }}
          >
            <WhatsAppIcon /> Chat WhatsApp Sekarang
          </a>
        </div>
      </section>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProgramCard({
  icon,
  title,
  desc,
  img,
  accent,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  img: string
  accent?: boolean
}) {
  return (
    <div
      className={`group rounded-3xl overflow-hidden border-2 ${
        accent
          ? 'bg-[#0A1F44] text-white border-[#0A1F44]'
          : 'bg-white border-transparent'
      } hover:border-[#E63946] transition-all hover:-translate-y-1`}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <ImageWithFallback
          src={img}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-6">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
            accent ? 'bg-[#E63946] text-white' : 'bg-[#0A1F44] text-white'
          }`}
        >
          {icon}
        </div>
        <h3 style={{ fontWeight: 900, fontSize: '22px', letterSpacing: '-0.02em' }}>
          {title}
        </h3>
        <p className={`mt-2 ${accent ? 'text-white/70' : 'text-[#0A1F44]/70'}`}>{desc}</p>
      </div>
    </div>
  )
}

export function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l.241.383-1.02 3.722 3.758-.964zM17.5 14.382c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.298-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01a1.1 1.1 0 0 0-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  )
}
