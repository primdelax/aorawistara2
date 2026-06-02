// src/app/components/Footer.tsx

import { Logo } from './Logo'
import { Instagram, Facebook, Mail, MapPin, Youtube, Phone, MessageCircle } from 'lucide-react'
import { useSettings, buildWhatsAppUrl, DEFAULT_SETTINGS } from '../hooks/useSettings'

const socialUrl = (platform: 'instagram' | 'facebook' | 'youtube' | 'tiktok', value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http')) return trimmed

  const clean = trimmed.replace(/^@/, '')
  if (platform === 'instagram') return `https://instagram.com/${clean}`
  if (platform === 'facebook') return `https://facebook.com/${clean}`
  if (platform === 'youtube') return `https://youtube.com/${clean.startsWith('@') ? clean : `@${clean}`}`
  return `https://tiktok.com/@${clean}`
}

const socialLabel = (value: string) => {
  return value
    .replace(/^https?:\/\/(www\.)?/i, '')
    .replace(/^(instagram|facebook|youtube|tiktok)\.com\/?/i, '')
    .replace(/\/$/, '')
}

export function Footer() {
  const { settings } = useSettings()

  const year = new Date().getFullYear()
  const siteName = settings.site_name || DEFAULT_SETTINGS.site_name
  const tagline = settings.tagline || DEFAULT_SETTINGS.tagline
  const email = settings.email || DEFAULT_SETTINGS.email
  const address = settings.address || DEFAULT_SETTINGS.address
  const phone = settings.phone || DEFAULT_SETTINGS.phone
  const instagram = settings.instagram || ''
  const facebook = settings.facebook || ''
  const youtube = settings.youtube || ''
  const tiktok = settings.tiktok || ''

  const waUrl = buildWhatsAppUrl(phone)

  return (
    <footer className="bg-[#0A1F44] text-white">
      <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-10">
        <div>
          <div className="bg-white inline-block px-3 py-2 rounded-lg">
            <Logo className="h-10" />
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
          <div className="space-y-3 text-white/80">
            {phone && (
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href={waUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  {phone}
                </a>
              </p>
            )}
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
          <div className="space-y-3 text-white/80">
            <SocialLink icon={<Instagram className="w-4 h-4" />} href={socialUrl('instagram', instagram)} label={socialLabel(instagram)} />
            <SocialLink icon={<Facebook className="w-4 h-4" />} href={socialUrl('facebook', facebook)} label={socialLabel(facebook)} />
            <SocialLink icon={<Youtube className="w-4 h-4" />} href={socialUrl('youtube', youtube)} label={socialLabel(youtube)} />
            <SocialLink icon={<TikTokIcon className="w-4 h-4" />} href={socialUrl('tiktok', tiktok)} label={socialLabel(tiktok)} />
            <SocialLink icon={<MessageCircle className="w-4 h-4" />} href={waUrl} label="WhatsApp" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 text-white/50 text-sm flex justify-between flex-wrap gap-2">
          <span>Copyright {year} {siteName} - LKP</span>
          <span>{tagline}</span>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) {
  if (!href || !label) return null

  return (
    <p className="flex items-center gap-2">
      {icon}
      <a href={href} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
        {label}
      </a>
    </p>
  )
}

export function TikTokIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.6 6.7a5.6 5.6 0 0 1-3.4-1.2 5.6 5.6 0 0 1-2.2-4.5h-3.4v14.4a3 3 0 1 1-3-3v-3.4a6.4 6.4 0 1 0 6.4 6.4V9.4a8.9 8.9 0 0 0 5.6 1.9V6.7z" />
    </svg>
  )
}
