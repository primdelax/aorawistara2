// src/app/context/SettingsContext.tsx
// Global provider — fetch settings ONCE, share across all pages

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { settingsApi, type SiteSettings } from '../lib/api'

// ─── Defaults (shown while loading or if API fails) ─────────────────────────
export const DEFAULT_SETTINGS: SiteSettings = {
  site_name:  'Aora',
  tagline:    'Kami Beda Tapi Luar Biasa',
  address:    'Jl Tambak Medokan Ayu 6-C/56B',
  phone:      '0822 2591 6619 (pak hari)',
  email:      'info@aora.id',
  instagram:  'https://instagram.com/aora',
  facebook:   'https://facebook.com/aora',
  youtube:    'https://youtube.com/@aora',
  tiktok:     'https://tiktok.com/@aora',
  maps_url:   'https://share.google/SVdjuvR7RWXbMcyMe',
  operational_hours: 'Senin-Jumat 10.00-17.00',
  logo_url:   null,
  about_text: 'Aora adalah Lembaga Kursus yang membentuk individu berdaya saing melalui kombinasi lifeskill praktis dan ekspresi seni.',
}

// ─── Helper: build WhatsApp link from phone setting ─────────────────────────
export function buildWhatsAppUrl(phone: string): string {
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`
  return `https://wa.me/${digits}`
}

// ─── Context type ────────────────────────────────────────────────────────────
interface SettingsContextValue {
  settings: SiteSettings
  loading: boolean
  error: string | null
  refresh: () => void
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  loading:  false,
  error:    null,
  refresh:  () => {},
})

// ─── Provider ────────────────────────────────────────────────────────────────
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  const fetchSettings = async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const data = await settingsApi.get()
      if (!signal?.aborted) setSettings({ ...DEFAULT_SETTINGS, ...data })
    } catch (e) {
      if (!signal?.aborted) {
        setError(e instanceof Error ? e.message : 'Gagal memuat pengaturan')
        // keep defaults — UI stays usable
      }
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchSettings(controller.signal)
    return () => controller.abort()
  }, [])

  return (
    <SettingsContext.Provider
      value={{ settings, loading, error, refresh: () => fetchSettings() }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────
export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext)
}
