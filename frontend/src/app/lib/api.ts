// src/app/lib/api.ts
// ✅ Semua request ke backend atau Supabase lewat file ini (dengan auth otomatis)

import {
  supabaseAuth,
  supabasePrograms,
  supabaseGalleries,
  supabaseHomepagePhotos,
  supabaseFeaturedPrograms,
  supabaseTestimonials,
  supabaseSettings,
  supabaseDb,
} from './supabaseClient'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''
const BASE = API_BASE_URL ? `${API_BASE_URL.replace(/\/$/, '')}/api` : '/api'

export function isStaticDeployment(): boolean {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  return (
    host.endsWith('github.io') ||
    host.includes('github.io') ||
    import.meta.env.VITE_USE_SUPABASE_DIRECT === 'true'
  )
}

export function getToken(): string | null {
  return localStorage.getItem('aora_token')
}
export function setToken(t: string) { localStorage.setItem('aora_token', t) }
export function removeToken() {
  localStorage.removeItem('aora_token')
  localStorage.removeItem('aora_user')
}

/**
 * Cek apakah JWT token di localStorage sudah kadaluarsa
 * tanpa perlu request ke server.
 */
export function isTokenExpired(): boolean {
  const token = getToken()
  if (!token) return true
  try {
    const payloadBase64 = token.split('.')[1]
    if (!payloadBase64) return true
    const payload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')))
    if (!payload.exp) return false
    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}

function dispatchSessionExpired() {
  removeToken()
  window.dispatchEvent(new CustomEvent('aora:session-expired'))
}

export function getStoredUser(): AdminUser | null {
  const s = localStorage.getItem('aora_user')
  return s ? JSON.parse(s) : null
}
function setStoredUser(u: object) { localStorage.setItem('aora_user', JSON.stringify(u)) }

export interface AdminUser {
  id: number
  name: string
  username: string
  email?: string
  role: string
  permissions?: string[]
  is_active?: boolean
  created_at?: string
}

async function request<T>(
  method: string, path: string,
  body?: object | FormData, isFormData = false
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!isFormData) headers['Content-Type'] = 'application/json'

  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: isFormData ? (body as FormData)
        : body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Koneksi ke backend gagal.')
  }

  if (res.status === 401) {
    dispatchSessionExpired()
    throw new Error('Sesi login telah berakhir. Silakan login ulang.')
  }

  const contentType = res.headers.get('content-type')
  let json: any = null

  if (contentType && contentType.includes('application/json')) {
    try {
      json = await res.json()
    } catch {
      throw new Error('Respons dari server tidak valid.')
    }
  } else {
    const text = await res.text().catch(() => '')
    if (!res.ok) {
      throw new Error(`Server error (${res.status}): ${text || res.statusText || 'Gagal'}`)
    }
    try {
      json = text ? JSON.parse(text) : {}
    } catch {
      json = {}
    }
  }

  if (!res.ok) {
    throw new Error(json?.message || 'Request gagal')
  }
  return json
}

// ─── Auth ────────────────────────────────────────────────────
export const authApi = {
  async login(username: string, password: string) {
    if (isStaticDeployment()) {
      const data = await supabaseAuth.login(username, password)
      setToken(data.token)
      setStoredUser(data.user)
      return data
    }
    try {
      const data = await request<{ data: { token: string; user: AdminUser } }>('POST', '/auth/login', { username, password })
      setToken(data.data.token)
      setStoredUser(data.data.user)
      return data.data
    } catch (err: any) {
      // Fallback ke Supabase langsung jika backend tidak merespon
      if (err?.message?.includes('Koneksi ke backend gagal')) {
        const data = await supabaseAuth.login(username, password)
        setToken(data.token)
        setStoredUser(data.user)
        return data
      }
      throw err
    }
  },
  async logout() {
    if (!isStaticDeployment()) {
      try { await request('POST', '/auth/logout') } catch { /* ignore */ }
    }
    removeToken()
  },
  getUser: getStoredUser,
  isLoggedIn: () => !!getToken() && !isTokenExpired(),
  async validateSession(): Promise<boolean> {
    if (!getToken() || isTokenExpired()) {
      dispatchSessionExpired()
      return false
    }
    if (isStaticDeployment()) {
      return true
    }
    try {
      await request('GET', '/auth/me')
      return true
    } catch {
      // Jika backend gagal konek tapi token lokal masih ada & valid
      if (getToken() && !isTokenExpired()) {
        return true
      }
      dispatchSessionExpired()
      return false
    }
  },
}

// ─── Admin Users ─────────────────────────────────────────────
export const adminUserApi = {
  async getAll() {
    if (isStaticDeployment()) {
      return supabaseAuth.getUsers()
    }
    try {
      const res = await request<{ data: AdminUser[] }>('GET', '/dashboard/users')
      return res.data
    } catch {
      return supabaseAuth.getUsers()
    }
  },
  async create(data: { name: string; username: string; password: string; permissions?: string[] }) {
    if (isStaticDeployment()) {
      const u = await supabaseAuth.createUser(data)
      return { data: u }
    }
    try {
      return await request<{ data: AdminUser }>('POST', '/dashboard/users', data)
    } catch {
      const u = await supabaseAuth.createUser(data)
      return { data: u }
    }
  },
  async update(id: number, data: { name?: string; username?: string; password?: string; is_active?: boolean; permissions?: string[] }) {
    if (isStaticDeployment()) {
      const u = await supabaseAuth.updateUser(id, data)
      return { data: u }
    }
    try {
      return await request<{ data: AdminUser }>('PUT', `/dashboard/users/${id}`, data)
    } catch {
      const u = await supabaseAuth.updateUser(id, data)
      return { data: u }
    }
  },
  async remove(id: number) {
    if (isStaticDeployment()) {
      return supabaseAuth.removeUser(id)
    }
    try {
      return await request('DELETE', `/dashboard/users/${id}`)
    } catch {
      return supabaseAuth.removeUser(id)
    }
  },
}

// ─── Programs ───────────────────────────────────────────────
export interface ProgramSchedule {
  id?: number
  day: string
  time: string
  note: string | null
  sort_order?: number
}

export interface Program {
  id: number; title: string; slug: string; description: string
  duration: string | null; price: number; image_url: string | null
  program_type: 'intensif' | 'short_course' | 'reguler'
  status: 'aktif' | 'tidak_aktif'; category_id: number | null
  category_name: string | null; created_at: string
  is_featured: boolean
  schedules: ProgramSchedule[]
}

export const programApi = {
  async getAll(p?: { search?: string; status?: string; program_type?: string }) {
    if (isStaticDeployment()) {
      return supabasePrograms.getAll(p)
    }
    try {
      const q = new URLSearchParams()
      if (p?.search) q.set('search', p.search)
      if (p?.status) q.set('status', p.status)
      if (p?.program_type) q.set('program_type', p.program_type)
      q.set('limit', '100')
      const res = await request<{ data: Program[] }>('GET', `/programs?${q}`)
      return res.data
    } catch {
      return supabasePrograms.getAll(p)
    }
  },
  async create(fd: FormData) {
    if (isStaticDeployment()) {
      const row = await supabasePrograms.create(fd)
      return { data: row }
    }
    try {
      return await request<{ data: Program }>('POST', '/programs', fd, true)
    } catch {
      const row = await supabasePrograms.create(fd)
      return { data: row }
    }
  },
  async update(id: number, fd: FormData) {
    if (isStaticDeployment()) {
      const row = await supabasePrograms.update(id, fd)
      return { data: row }
    }
    try {
      return await request<{ data: Program }>('PUT', `/programs/${id}`, fd, true)
    } catch {
      const row = await supabasePrograms.update(id, fd)
      return { data: row }
    }
  },
  async remove(id: number) {
    if (isStaticDeployment()) {
      return supabasePrograms.remove(id)
    }
    try {
      return await request('DELETE', `/programs/${id}`)
    } catch {
      return supabasePrograms.remove(id)
    }
  },
  async toggleFeatured(id: number, isFeatured: boolean) {
    if (isStaticDeployment()) {
      const row = await supabasePrograms.toggleFeatured(id, isFeatured)
      return { data: row }
    }
    try {
      return await request<{ data: Program }>('PATCH', `/programs/${id}/featured`, { is_featured: isFeatured })
    } catch {
      const row = await supabasePrograms.toggleFeatured(id, isFeatured)
      return { data: row }
    }
  },
}

// ─── Gallery ────────────────────────────────────────────────
export interface GalleryItem {
  id: number; title: string; image_url: string
  caption: string | null; category: string | null
  program_id: number | null
  program_title: string | null; created_at: string
}

export const galleryApi = {
  async getAll(p?: { search?: string; program_id?: number | string }) {
    if (isStaticDeployment()) {
      return supabaseGalleries.getAll(p)
    }
    try {
      const q = new URLSearchParams()
      if (p?.search) q.set('search', p.search)
      if (p?.program_id) q.set('program_id', String(p.program_id))
      q.set('limit', '100')
      const res = await request<{ data: GalleryItem[] }>('GET', `/galleries?${q}`)
      return res.data
    } catch {
      return supabaseGalleries.getAll(p)
    }
  },
  async create(fd: FormData) {
    if (isStaticDeployment()) {
      const row = await supabaseGalleries.create(fd)
      return { data: row }
    }
    try {
      return await request<{ data: GalleryItem }>('POST', '/galleries', fd, true)
    } catch {
      const row = await supabaseGalleries.create(fd)
      return { data: row }
    }
  },
  async update(id: number, fd: FormData) {
    if (isStaticDeployment()) {
      const row = await supabaseGalleries.update(id, fd)
      return { data: row }
    }
    try {
      return await request<{ data: GalleryItem }>('PUT', `/galleries/${id}`, fd, true)
    } catch {
      const row = await supabaseGalleries.update(id, fd)
      return { data: row }
    }
  },
  async remove(id: number) {
    if (isStaticDeployment()) {
      return supabaseGalleries.remove(id)
    }
    try {
      return await request('DELETE', `/galleries/${id}`)
    } catch {
      return supabaseGalleries.remove(id)
    }
  },
}

// ─── Settings ───────────────────────────────────────────────
export interface HomepagePhoto {
  id: number
  title: string
  image_path: string
  image_url: string
  status: 'aktif' | 'tidak_aktif'
  sort_order: number
  created_at: string
}

export const homepagePhotoApi = {
  async getAll(p?: { search?: string; status?: string }) {
    if (isStaticDeployment()) {
      return supabaseHomepagePhotos.getAll(p)
    }
    try {
      const q = new URLSearchParams()
      if (p?.search) q.set('search', p.search)
      if (p?.status) q.set('status', p.status)
      const res = await request<{ data: HomepagePhoto[] }>('GET', `/homepage-photos?${q}`)
      return res.data
    } catch {
      return supabaseHomepagePhotos.getAll(p)
    }
  },
  async create(fd: FormData) {
    if (isStaticDeployment()) {
      const row = await supabaseHomepagePhotos.create(fd)
      return { data: row }
    }
    try {
      return await request<{ data: HomepagePhoto }>('POST', '/homepage-photos', fd, true)
    } catch {
      const row = await supabaseHomepagePhotos.create(fd)
      return { data: row }
    }
  },
  async update(id: number, fd: FormData) {
    if (isStaticDeployment()) {
      const row = await supabaseHomepagePhotos.update(id, fd)
      return { data: row }
    }
    try {
      return await request<{ data: HomepagePhoto }>('PUT', `/homepage-photos/${id}`, fd, true)
    } catch {
      const row = await supabaseHomepagePhotos.update(id, fd)
      return { data: row }
    }
  },
  async remove(id: number) {
    if (isStaticDeployment()) {
      return supabaseHomepagePhotos.remove(id)
    }
    try {
      return await request('DELETE', `/homepage-photos/${id}`)
    } catch {
      return supabaseHomepagePhotos.remove(id)
    }
  },
}

export interface FeaturedProgram {
  id: number
  title: string
  description: string
  image_path: string
  image_url: string
  accent: boolean
  status: 'aktif' | 'tidak_aktif'
  sort_order: number
  created_at: string
}

export const featuredProgramApi = {
  async getAll(p?: { search?: string; status?: string }) {
    if (isStaticDeployment()) {
      return supabaseFeaturedPrograms.getAll(p)
    }
    try {
      const q = new URLSearchParams()
      if (p?.search) q.set('search', p.search)
      if (p?.status) q.set('status', p.status)
      const res = await request<{ data: FeaturedProgram[] }>('GET', `/featured-programs?${q}`)
      return res.data
    } catch {
      return supabaseFeaturedPrograms.getAll(p)
    }
  },
  async create(fd: FormData) {
    if (isStaticDeployment()) {
      const row = await supabaseFeaturedPrograms.create(fd)
      return { data: row }
    }
    try {
      return await request<{ data: FeaturedProgram }>('POST', '/featured-programs', fd, true)
    } catch {
      const row = await supabaseFeaturedPrograms.create(fd)
      return { data: row }
    }
  },
  async update(id: number, fd: FormData) {
    if (isStaticDeployment()) {
      const row = await supabaseFeaturedPrograms.update(id, fd)
      return { data: row }
    }
    try {
      return await request<{ data: FeaturedProgram }>('PUT', `/featured-programs/${id}`, fd, true)
    } catch {
      const row = await supabaseFeaturedPrograms.update(id, fd)
      return { data: row }
    }
  },
  async remove(id: number) {
    if (isStaticDeployment()) {
      return supabaseFeaturedPrograms.remove(id)
    }
    try {
      return await request('DELETE', `/featured-programs/${id}`)
    } catch {
      return supabaseFeaturedPrograms.remove(id)
    }
  },
}

export interface Testimonial {
  id: number
  alumni_name: string
  profile: string
  comment: string
  image_path: string
  image_url: string
  status: 'aktif' | 'tidak_aktif'
  sort_order: number
  created_at: string
}

export const testimonialApi = {
  async getAll(p?: { search?: string; status?: string }) {
    if (isStaticDeployment()) {
      return supabaseTestimonials.getAll(p)
    }
    try {
      const q = new URLSearchParams()
      if (p?.search) q.set('search', p.search)
      if (p?.status) q.set('status', p.status)
      const res = await request<{ data: Testimonial[] }>('GET', `/testimonials?${q}`)
      return res.data
    } catch {
      return supabaseTestimonials.getAll(p)
    }
  },
  async create(fd: FormData) {
    if (isStaticDeployment()) {
      const row = await supabaseTestimonials.create(fd)
      return { data: row }
    }
    try {
      return await request<{ data: Testimonial }>('POST', '/testimonials', fd, true)
    } catch {
      const row = await supabaseTestimonials.create(fd)
      return { data: row }
    }
  },
  async update(id: number, fd: FormData) {
    if (isStaticDeployment()) {
      const row = await supabaseTestimonials.update(id, fd)
      return { data: row }
    }
    try {
      return await request<{ data: Testimonial }>('PUT', `/testimonials/${id}`, fd, true)
    } catch {
      const row = await supabaseTestimonials.update(id, fd)
      return { data: row }
    }
  },
  async remove(id: number) {
    if (isStaticDeployment()) {
      return supabaseTestimonials.remove(id)
    }
    try {
      return await request('DELETE', `/testimonials/${id}`)
    } catch {
      return supabaseTestimonials.remove(id)
    }
  },
}

export interface SiteSettings {
  site_name: string; tagline: string; address: string; phone: string
  email: string; instagram: string; facebook: string; youtube: string; tiktok: string
  maps_url: string; operational_hours: string
  logo_url: string | null; about_text: string
  desc_intensif?: string
  desc_short_course?: string
  desc_reguler?: string
  visi?: string
  misi?: string
  keunggulan?: string
}

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'Aora',
  tagline: 'Lembaga Kursus',
  address: 'Jl Tambak Medokan Ayu 6-C/56B',
  phone: '0822 2591 6619 (pak hari)',
  email: 'info@aora.id',
  instagram: 'https://instagram.com/aora',
  facebook: 'https://facebook.com/aora',
  youtube: 'https://youtube.com/@aora',
  tiktok: 'https://tiktok.com/@aora',
  maps_url: 'https://share.google/SVdjuvR7RWXbMcyMe',
  operational_hours: 'Senin-Jumat 10.00-17.00',
  logo_url: null,
  about_text: 'Aora adalah Lembaga Kursus yang membentuk individu berdaya saing melalui kombinasi lifeskill praktis dan ekspresi seni.',
  desc_intensif: 'Program pembelajaran intensif dengan jadwal padat dan materi mendalam. Cocok untuk peserta yang ingin menguasai keahlian dalam waktu singkat dengan bimbingan instruktur berpengalaman.',
  desc_short_course: 'Kelas singkat yang fokus pada Program Membatik dan Fotografi, dirancang untuk praktik kreatif dan hasil karya nyata dalam waktu yang lebih ringkas.',
  desc_reguler: 'Program pembelajaran rutin dengan jadwal fleksibel dan biaya terjangkau. Ideal bagi peserta yang ingin belajar secara konsisten tanpa tekanan waktu yang ketat.',
  visi: 'Menjadi lembaga pelatihan terdepan yang melahirkan pribadi luar biasa — kreatif, kompeten, dan percaya diri.',
}

export const settingsApi = {
  async get(): Promise<SiteSettings> {
    if (isStaticDeployment()) {
      const raw = await supabaseSettings.get()
      return { ...DEFAULT_SETTINGS, ...raw } as SiteSettings
    }
    try {
      const res = await request<{ data: SiteSettings }>('GET', '/settings')
      return res.data
    } catch {
      const raw = await supabaseSettings.get()
      return { ...DEFAULT_SETTINGS, ...raw } as SiteSettings
    }
  },
  async update(data: Partial<SiteSettings>) {
    if (isStaticDeployment()) {
      const updated = await supabaseSettings.update(data)
      return { data: { ...DEFAULT_SETTINGS, ...updated } as SiteSettings }
    }
    try {
      return await request<{ data: SiteSettings }>('PUT', '/settings', data)
    } catch {
      const updated = await supabaseSettings.update(data)
      return { data: { ...DEFAULT_SETTINGS, ...updated } as SiteSettings }
    }
  },
}

// ─── Visi & Misi ────────────────────────────────────────────
export interface MisiItem {
  id: number
  num: string
  title: string
  desc: string
}

export interface KeunggulanItem {
  id: number
  icon: string
  title: string
  desc: string
}

export const visiMisiApi = {
  async getVisi(): Promise<{ visi: string }> {
    if (isStaticDeployment()) {
      return supabaseSettings.getVisi()
    }
    try {
      const res = await request<{ data: { visi: string } }>('GET', '/settings/visi')
      return res.data
    } catch {
      return supabaseSettings.getVisi()
    }
  },
  async updateVisi(visi: string) {
    if (isStaticDeployment()) {
      return supabaseSettings.updateVisi(visi)
    }
    try {
      return await request<{ data: { visi: string } }>('PUT', '/settings/visi', { visi })
    } catch {
      return supabaseSettings.updateVisi(visi)
    }
  },
  async getMisi(): Promise<MisiItem[]> {
    if (isStaticDeployment()) {
      return supabaseSettings.getMisi()
    }
    try {
      const res = await request<{ data: MisiItem[] }>('GET', '/settings/misi')
      return res.data
    } catch {
      return supabaseSettings.getMisi()
    }
  },
  async createMisi(data: { title: string; desc: string }) {
    if (isStaticDeployment()) {
      const item = await supabaseSettings.createMisi(data)
      return { data: item }
    }
    try {
      return await request<{ data: MisiItem }>('POST', '/settings/misi', data)
    } catch {
      const item = await supabaseSettings.createMisi(data)
      return { data: item }
    }
  },
  async updateMisi(id: number, data: { title?: string; desc?: string }) {
    if (isStaticDeployment()) {
      const item = await supabaseSettings.updateMisi(id, data)
      return { data: item }
    }
    try {
      return await request<{ data: MisiItem }>('PUT', `/settings/misi/${id}`, data)
    } catch {
      const item = await supabaseSettings.updateMisi(id, data)
      return { data: item }
    }
  },
  async deleteMisi(id: number) {
    if (isStaticDeployment()) {
      await supabaseSettings.deleteMisi(id)
      return { success: true }
    }
    try {
      return await request('DELETE', `/settings/misi/${id}`)
    } catch {
      await supabaseSettings.deleteMisi(id)
      return { success: true }
    }
  },
}

export const keunggulanApi = {
  async getAll(): Promise<KeunggulanItem[]> {
    if (isStaticDeployment()) {
      return supabaseSettings.getKeunggulan()
    }
    try {
      const res = await request<{ data: KeunggulanItem[] }>('GET', '/settings/keunggulan')
      return res.data
    } catch {
      return supabaseSettings.getKeunggulan()
    }
  },
  async create(data: { icon: string; title: string; desc: string }) {
    if (isStaticDeployment()) {
      const item = await supabaseSettings.createKeunggulan(data)
      return { data: item }
    }
    try {
      return await request<{ data: KeunggulanItem }>('POST', '/settings/keunggulan', data)
    } catch {
      const item = await supabaseSettings.createKeunggulan(data)
      return { data: item }
    }
  },
  async update(id: number, data: { icon?: string; title?: string; desc?: string }) {
    if (isStaticDeployment()) {
      const item = await supabaseSettings.updateKeunggulan(id, data)
      return { data: item }
    }
    try {
      return await request<{ data: KeunggulanItem }>('PUT', `/settings/keunggulan/${id}`, data)
    } catch {
      const item = await supabaseSettings.updateKeunggulan(id, data)
      return { data: item }
    }
  },
  async remove(id: number) {
    if (isStaticDeployment()) {
      await supabaseSettings.removeKeunggulan(id)
      return { success: true }
    }
    try {
      return await request('DELETE', `/settings/keunggulan/${id}`)
    } catch {
      await supabaseSettings.removeKeunggulan(id)
      return { success: true }
    }
  },
}

// ─── Categories ─────────────────────────────────────────────
export interface Category { id: number; name: string; slug: string }

export const categoryApi = {
  async getAll(): Promise<Category[]> {
    if (isStaticDeployment()) {
      return supabaseDb.list<Category>('categories', { order: 'id.asc' })
    }
    try {
      const res = await request<{ data: Category[] }>('GET', '/categories')
      return res.data
    } catch {
      return supabaseDb.list<Category>('categories', { order: 'id.asc' })
    }
  },
}
