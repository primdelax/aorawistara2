// src/app/components/ProfilPage.tsx
// ✅ site_name, tagline, about_text dari settings API

import type React from 'react'
import { Logo } from './Logo'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { Award, Users, Sparkles, Heart, Target, Eye, Shield, Smile, CheckCircle, Lightbulb, BookOpen, ThumbsUp, Star } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'
import type { MisiItem, KeunggulanItem } from '../lib/api'

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Sparkles,
  Award,
  Users,
  Heart,
  Target,
  Eye,
  Shield,
  Smile,
  CheckCircle,
  Lightbulb,
  BookOpen,
  ThumbsUp,
  Star,
}

export function ProfilPage() {
  const { settings } = useSettings()

  const siteName  = settings.site_name  || 'Aora'
  const tagline   = settings.tagline    || 'Kami Beda Tapi Luar Biasa'
  const aboutText = settings.about_text || ''

  const visiText = settings.visi || 'Menjadi lembaga pelatihan terdepan yang melahirkan pribadi luar biasa — kreatif, kompeten, dan percaya diri.'

  // parse Misi
  let misiList: MisiItem[] = []
  try {
    if (settings.misi) {
      misiList = typeof settings.misi === 'string' ? JSON.parse(settings.misi) : settings.misi
    }
  } catch (e) {
    console.error('Gagal memproses data misi:', e)
  }
  if (!misiList || misiList.length === 0) {
    misiList = [
      { id: 1, num: '01', title: 'Pelatihan Berkualitas', desc: 'Menyelenggarakan pelatihan berbasis praktik dengan kurikulum yang terus diperbarui sesuai kebutuhan industri.' },
      { id: 2, num: '02', title: 'Pengembangan Karakter', desc: 'Membangun pribadi berdaya saing yang berani tampil beda dengan integritas dan kepercayaan diri.' },
      { id: 3, num: '03', title: 'Pelestarian Budaya', desc: 'Menjadi rumah bagi seni dan budaya lokal melalui program menari, batik, dan ekspresi kreatif lainnya.' },
      { id: 4, num: '04', title: 'Komunitas yang Kuat', desc: 'Menumbuhkan jaringan alumni dan komunitas yang saling mendukung di dunia kerja dan kehidupan.' },
    ]
  }

  // parse Keunggulan
  let keunggulanList: KeunggulanItem[] = []
  try {
    if (settings.keunggulan) {
      keunggulanList = typeof settings.keunggulan === 'string' ? JSON.parse(settings.keunggulan) : settings.keunggulan
    }
  } catch (e) {
    console.error('Gagal memproses data keunggulan:', e)
  }
  if (!keunggulanList || keunggulanList.length === 0) {
    keunggulanList = [
      { id: 1, icon: 'Sparkles', title: 'Beragam Program', desc: 'Dari barista hingga seni budaya — pilihan luas sesuai minat dan bakat.' },
      { id: 2, icon: 'Award', title: 'Pengajar Berpengalaman', desc: 'Praktisi profesional yang membimbing langsung dengan standar industri.' },
      { id: 3, icon: 'Users', title: 'Berbasis Komunitas', desc: 'Bergabung dengan komunitas alumni yang aktif dan saling mendukung.' },
      { id: 4, icon: 'Heart', title: 'Berkarakter & Kreatif', desc: 'Lebih dari sekadar skill — kami membentuk pribadi luar biasa.' },
    ]
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative bg-[#0A1F44] text-white py-24 overflow-hidden">
        <div className="absolute -top-20 right-10 w-[400px] h-[400px] rounded-full bg-[#E63946]/20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-block bg-white px-4 py-3 rounded-2xl mb-8">
            <Logo className="h-16" />
          </div>
          <h1
            style={{
              fontWeight: 900,
              fontSize: 'clamp(44px, 7vw, 80px)',
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
            }}
          >
            Tentang <span className="text-[#E63946]">{siteName}</span>
          </h1>
          <p className="mt-6 text-white/70 max-w-2xl mx-auto text-lg">
            Lembaga Kursus yang membentuk pribadi unggul melalui lifeskill dan seni.
          </p>
        </div>
      </section>

      {/* Tentang Kami */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
          <div>
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
              Kami Beda Tapi <span className="text-[#E63946]">Luar Biasa.</span>
            </h2>
            <p className="mt-6 text-[#0A1F44]/80 leading-relaxed">
              {aboutText ||
                `${siteName} hadir sebagai Lembaga Kursus yang menggabungkan lifeskill vokasi dengan ekspresi seni budaya. Kami percaya pendidikan tidak hanya tentang ijazah — tetapi tentang membangun karakter, kepercayaan diri, dan lifeskill yang siap pakai di dunia nyata.`}
            </p>
            <p className="mt-4 text-[#0A1F44]/80 leading-relaxed">
              Dengan tagline{' '}
              <span className="text-[#E63946]" style={{ fontWeight: 800 }}>
                &ldquo;{tagline}&rdquo;
              </span>
              , kami merayakan keunikan setiap peserta. Mulai dari pelatihan barista profesional,
              seni menari tradisional dan modern, batik, melukis, hingga komputer dan personality —
              setiap program dirancang untuk membentuk pribadi yang berdaya saing dan berbudaya.
            </p>
            <p className="mt-4 text-[#0A1F44]/80 leading-relaxed">
              Komunitas kami tumbuh dari kepercayaan masyarakat dan dedikasi pengajar yang
              berpengalaman.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -top-6 -right-6 w-40 h-40 bg-[#E63946] rounded-3xl rotate-12" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#0A1F44] rounded-3xl -rotate-6" />
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1615949394813-ba42de383eb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                alt="AORA"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Visi & Misi */}
      <section className="py-24 bg-[#F7F7F9]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span
              className="inline-block px-3 py-1 bg-[#0A1F44] text-white rounded-full uppercase text-xs"
              style={{ fontWeight: 800, letterSpacing: '0.15em' }}
            >
              Arah Kami
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
              Visi &amp; Misi
            </h2>
          </div>

          <div className="bg-[#0A1F44] text-white rounded-3xl p-10 md:p-14 relative overflow-hidden mb-8">
            <div className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full bg-[#E63946]/20 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-3 mb-4">
                <Eye className="w-7 h-7 text-[#E63946]" />
                <span
                  className="uppercase tracking-widest text-[#E63946]"
                  style={{ fontWeight: 800, letterSpacing: '0.2em' }}
                >
                  Visi
                </span>
              </div>
              <p
                style={{
                  fontWeight: 800,
                  fontSize: 'clamp(24px, 3vw, 36px)',
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                }}
              >
                {visiText}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {misiList.map((item) => (
              <MissionCard
                key={item.id}
                num={item.num}
                title={item.title}
                desc={item.desc}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Mengapa AORA */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span
              className="inline-block px-3 py-1 bg-[#E63946]/10 text-[#E63946] rounded-full uppercase text-xs"
              style={{ fontWeight: 800, letterSpacing: '0.15em' }}
            >
              Keunggulan
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
              Mengapa Memilih <span className="text-[#E63946]">AORA?</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keunggulanList.map((item) => {
              const IconComp = ICON_MAP[item.icon] || Sparkles
              return (
                <FeatureCard
                  key={item.id}
                  icon={<IconComp />}
                  title={item.title}
                  desc={item.desc}
                />
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

function MissionCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="bg-white border-2 border-[#0A1F44]/10 rounded-3xl p-8 hover:border-[#E63946] transition-all group">
      <div className="flex items-start gap-5">
        <span
          className="text-[#E63946]"
          style={{ fontWeight: 900, fontSize: '40px', letterSpacing: '-0.04em', lineHeight: 1 }}
        >
          {num}
        </span>
        <div>
          <h3
            className="text-[#0A1F44]"
            style={{ fontWeight: 900, fontSize: '20px', letterSpacing: '-0.02em' }}
          >
            {title}
          </h3>
          <p className="mt-2 text-[#0A1F44]/70">{desc}</p>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="bg-[#F7F7F9] hover:bg-[#0A1F44] hover:text-white rounded-3xl p-7 transition-all group">
      <div className="w-14 h-14 rounded-2xl bg-[#E63946] text-white flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3
        style={{ fontWeight: 900, fontSize: '20px', letterSpacing: '-0.02em' }}
        className="text-[#0A1F44] group-hover:text-white"
      >
        {title}
      </h3>
      <p className="mt-2 text-[#0A1F44]/70 group-hover:text-white/70">{desc}</p>
    </div>
  )
}
