// src/app/components/Footer.tsx
// ✅ email, address, instagram, facebook, youtube dari settings API

import { Logo } from './Logo'
import { Instagram, Facebook, Mail, MapPin } from 'lucide-react'
import { useSettings, buildWhatsAppUrl } from '../hooks/useSettings'

export function Footer() {
  const { settings } = useSettings()

  const year        = new Date().getFullYear()
  const siteName    = settings.site_name || 'AORA Wistara'
  const tagline     = settings.tagline   || 'Kami Beda Tapi Luar Biasa'
  const email       = settings.email     || ''
  const address     = settings.address   || 'Indonesia'
  const instagram   = settings.instagram || ''
  const facebook    = settings.facebook  || ''

  // Derive display name from URL or raw value
  const igHandle  = instagram  ? instagram.replace(/https?:\/\/(www\.)?instagram\.com\/?/, '@').replace(/\/$/, '') : ''
  const fbHandle  = facebook   ? facebook.replace(/https?:\/\/(www\.)?facebook\.com\/?/, '')  .replace(/\/$/, '') : ''

  return (
    <footer className="bg-[#0A1F44] text-white">
      <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-10">
        <div>
          <div className="bg-white inline-block px-3 py-2 rounded-lg">
            <Logo />
          </div>
          <p className="mt-4 text-white/70 max-w-sm">{tagline}</p>
        </div>

        <div>
          <h4
            style={{ fontWeight: 800, letterSpacing: '0.1em' }}
            className="uppercase mb-4 text-[#E63946]"
          >
            Hubungi
          </h4>
          <div className="space-y-2 text-white/80">
            {email && (
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                  {email}
                </a>
              </p>
            )}
            {address && (
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{address}</span>
              </p>
            )}
          </div>
        </div>

        <div>
          <h4
            style={{ fontWeight: 800, letterSpacing: '0.1em' }}
            className="uppercase mb-4 text-[#E63946]"
          >
            Sosial Media
          </h4>
          <div className="space-y-2 text-white/80">
            {instagram && (
              <p className="flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                <a
                  href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {igHandle || instagram}
                </a>
              </p>
            )}
            {facebook && (
              <p className="flex items-center gap-2">
                <Facebook className="w-4 h-4" />
                <a
                  href={facebook.startsWith('http') ? facebook : `https://facebook.com/${facebook}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {fbHandle || facebook}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 text-white/50 text-sm flex justify-between flex-wrap gap-2">
          <span>© {year} {siteName} — LKP</span>
          <span>{tagline}</span>
        </div>
      </div>
    </footer>
  )
}

export function TikTokIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.6 6.7a5.6 5.6 0 0 1-3.4-1.2 5.6 5.6 0 0 1-2.2-4.5h-3.4v14.4a3 3 0 1 1-3-3v-3.4a6.4 6.4 0 1 0 6.4 6.4V9.4a8.9 8.9 0 0 0 5.6 1.9V6.7z" />
    </svg>
  )
}
