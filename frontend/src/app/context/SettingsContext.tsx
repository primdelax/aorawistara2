// src/app/context/SettingsContext.tsx
// Global provider — fetch settings ONCE, share across all pages

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { settingsApi, type SiteSettings } from '../lib/api'

// ─── Defaults (shown while loading or if API fails) ─────────────────────────
export const DEFAULT_SETTINGS: SiteSettings = {
  site_name:  'AORA Wistara',
  tagline:    'Kami Beda Tapi Luar Biasa',
  address:    'Indonesia',
  phone:      '6281234567890',
  email:      'aorawistara@gmail.com',
  instagram:  'https://instagram.com/aora.wistara',
  facebook:   'https://facebook.com/aorawistara',
  youtube:    'https://youtube.com/@aorawistara',
  logo_url:   null,
  about_text: 'AORA Wistara adalah Lembaga Khusus dan Pelatihan (LKP) yang membentuk individu berdaya saing melalui kombinasi keterampilan praktis dan ekspresi seni.',
}

// ─── Helper: build WhatsApp link from phone setting ─────────────────────────
export function buildWhatsAppUrl(phone: string): string {
  const digits = phone.replace(/\D/g, '')
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
      if (!signal?.aborted) setSettings(data)
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
