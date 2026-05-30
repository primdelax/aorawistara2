// src/app/components/admin/AdminPengaturan.tsx
import { useState, useEffect } from 'react'
import { settingsApi, type SiteSettings } from '../../lib/api'
import { Check, RefreshCw, Globe, Phone, Mail, Instagram, Youtube, MapPin, Save, X } from 'lucide-react'

const DEFAULT: SiteSettings = { site_name: 'Aora', tagline: 'Lembaga Kursus & Pelatihan', address: '', phone: '', email: '', instagram: '', facebook: '', youtube: '', logo_url: null, about_text: '' }

export function AdminPengaturan() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const showToast = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg }); setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    settingsApi.get().then(data => setSettings(data)).catch(() => { /* pakai default */ }).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await settingsApi.update(settings)
      showToast('ok', 'Pengaturan berhasil disimpan!')
    } catch (e: unknown) {
      showToast('err', e instanceof Error ? e.message : 'Gagal menyimpan')
    } finally { setSaving(false) }
  }

  const set = (key: keyof SiteSettings, val: string) => setSettings(s => ({ ...s, [key]: val }))

  if (loading) return (
    <div className="py-20 text-center text-[#0A1F44]/40">
      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /><p className="text-sm">Memuat pengaturan...</p>
    </div>
  )

  return (
    <div className="max-w-2xl">
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 text-sm ${toast.type === 'ok' ? 'bg-green-600 text-white' : 'bg-[#E63946] text-white'}`} style={{ fontWeight: 700 }}>
          {toast.type === 'ok' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      {/* Identitas */}
      <Section title="Identitas Website" icon={<Globe className="w-4 h-4" />}>
        <Field label="Nama Website" value={settings.site_name} onChange={v => set('site_name', v)} placeholder="Aora" />
        <Field label="Tagline / Slogan" value={settings.tagline} onChange={v => set('tagline', v)} placeholder="Lembaga Kursus & Pelatihan" />
        <div>
          <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Tentang Kami</label>
          <textarea value={settings.about_text} onChange={e => set('about_text', e.target.value)} rows={4}
            placeholder="Deskripsi singkat tentang lembaga..."
            className="w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 resize-none text-sm" />
        </div>
      </Section>

      {/* Kontak */}
      <Section title="Informasi Kontak" icon={<Phone className="w-4 h-4" />}>
        <Field label="Nomor Telepon / WhatsApp" value={settings.phone} onChange={v => set('phone', v)} placeholder="+62 812 3456 7890" />
        <Field label="Email" value={settings.email} onChange={v => set('email', v)} placeholder="info@aora.id" icon={<Mail className="w-4 h-4" />} />
        <div>
          <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Alamat Lengkap</label>
          <textarea value={settings.address} onChange={e => set('address', e.target.value)} rows={3}
            placeholder="Jl. Contoh No. 1, Surabaya, Jawa Timur"
            className="w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 resize-none text-sm" />
        </div>
      </Section>

      {/* Medsos */}
      <Section title="Media Sosial" icon={<Instagram className="w-4 h-4" />}>
        <Field label="Instagram" value={settings.instagram} onChange={v => set('instagram', v)} placeholder="https://instagram.com/aora" />
        <Field label="Facebook" value={settings.facebook} onChange={v => set('facebook', v)} placeholder="https://facebook.com/aora" />
        <Field label="YouTube" value={settings.youtube} onChange={v => set('youtube', v)} placeholder="https://youtube.com/@aora" icon={<Youtube className="w-4 h-4" />} />
      </Section>

      {/* Maps */}
      <Section title="Lokasi Google Maps" icon={<MapPin className="w-4 h-4" />}>
        <div>
          <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Embed URL Google Maps</label>
          <input placeholder="https://maps.google.com/maps?..." onChange={() => {}} value=""
            className="w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 text-sm" />
          <p className="text-[#0A1F44]/40 text-xs mt-1.5">Google Maps → Share → Embed a map → Copy link</p>
        </div>
      </Section>

      <div className="mt-2 mb-8">
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 bg-[#E63946] hover:bg-[#c42d3a] disabled:opacity-60 text-white px-8 py-4 rounded-xl shadow-lg shadow-[#E63946]/20 transition-all"
          style={{ fontWeight: 800 }}>
          <Save className="w-5 h-5" />
          {saving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}
        </button>
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#0A1F44]/5 overflow-hidden mb-5">
      <div className="px-6 py-4 border-b border-[#0A1F44]/5 flex items-center gap-3 bg-[#0A1F44]/[0.02]">
        <div className="w-8 h-8 bg-[#0A1F44] rounded-lg flex items-center justify-center text-white">{icon}</div>
        <h3 className="text-[#0A1F44]" style={{ fontWeight: 800, fontSize: 15 }}>{title}</h3>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, icon }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="text-[#0A1F44]/60 text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0A1F44]/40">{icon}</span>}
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={`w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 text-sm ${icon ? 'pl-10' : ''}`} />
      </div>
    </div>
  )
}
