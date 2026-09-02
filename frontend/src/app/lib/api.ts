// src/app/lib/api.ts
// ✅ Semua request ke backend lewat file ini (dengan token auth otomatis)

const BASE = '/api'

export function getToken(): string | null {
  return localStorage.getItem('aora_token')
}
export function setToken(t: string) { localStorage.setItem('aora_token', t) }
export function removeToken() {
  localStorage.removeItem('aora_token')
  localStorage.removeItem('aora_user')
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
  } catch (err) {
    throw new Error('Koneksi ke backend gagal. Pastikan backend server sudah berjalan.')
  }

  const contentType = res.headers.get('content-type')
  let json: any = null

  if (contentType && contentType.includes('application/json')) {
    try {
      json = await res.json()
    } catch (e) {
      throw new Error('Respons dari server tidak valid (gagal memproses format JSON).')
    }
  } else {
    const text = await res.text().catch(() => '')
    if (!res.ok) {
      throw new Error(`Server error (${res.status}): ${text || res.statusText || 'Gagal memproses request'}`)
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
    const data = await request<{ data: { token: string; user: AdminUser } }>('POST', '/auth/login', { username, password })
    setToken(data.data.token)
    setStoredUser(data.data.user)
    return data.data
  },
  async logout() {
    try { await request('POST', '/auth/logout') } catch { /* ignore */ }
    removeToken()
  },
  getUser: getStoredUser,
  isLoggedIn: () => !!getToken(),
}

// ─── Programs ───────────────────────────────────────────────
export interface Program {
  id: number; title: string; slug: string; description: string
  duration: string | null; price: number; image_url: string | null
  program_type: 'intensif' | 'short_course' | 'reguler'
  status: 'aktif' | 'tidak_aktif'; category_id: number | null
  category_name: string | null; created_at: string
  is_featured: boolean
  schedules: ProgramSchedule[]
}

export const adminUserApi = {
  async getAll() {
    const res = await request<{ data: AdminUser[] }>('GET', '/dashboard/users')
    return res.data
  },
  async create(data: { name: string; username: string; password: string; permissions?: string[] }) {
    return request<{ data: AdminUser }>('POST', '/dashboard/users', data)
  },
  async update(id: number, data: { name?: string; username?: string; password?: string; is_active?: boolean; permissions?: string[] }) {
    return request<{ data: AdminUser }>('PUT', `/dashboard/users/${id}`, data)
  },
  async remove(id: number) {
    return request('DELETE', `/dashboard/users/${id}`)
  },
}

export interface ProgramSchedule {
  id?: number
  day: string
  time: string
  note: string | null
  sort_order?: number
}

export const programApi = {
  async getAll(p?: { search?: string; status?: string; program_type?: string }) {
    const q = new URLSearchParams()
    if (p?.search) q.set('search', p.search)
    if (p?.status) q.set('status', p.status)
    if (p?.program_type) q.set('program_type', p.program_type)
    q.set('limit', '100')
    const res = await request<{ data: Program[] }>('GET', `/programs?${q}`)
    return res.data
  },
  async create(fd: FormData) { return request<{ data: Program }>('POST', '/programs', fd, true) },
  async update(id: number, fd: FormData) { return request<{ data: Program }>('PUT', `/programs/${id}`, fd, true) },
  async remove(id: number) { return request('DELETE', `/programs/${id}`) },
  async toggleFeatured(id: number, isFeatured: boolean) { return request<{ data: Program }>('PATCH', `/programs/${id}/featured`, { is_featured: isFeatured }) },
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
    const q = new URLSearchParams()
    if (p?.search) q.set('search', p.search)
    if (p?.program_id) q.set('program_id', String(p.program_id))
    q.set('limit', '100')
    const res = await request<{ data: GalleryItem[] }>('GET', `/galleries?${q}`)
    return res.data
  },
  async create(fd: FormData) { return request<{ data: GalleryItem }>('POST', '/galleries', fd, true) },
  async update(id: number, fd: FormData) { return request<{ data: GalleryItem }>('PUT', `/galleries/${id}`, fd, true) },
  async remove(id: number) { return request('DELETE', `/galleries/${id}`) },
}

// ─── Settings ───────────────────────────────────────────────
// Homepage photos
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
    const q = new URLSearchParams()
    if (p?.search) q.set('search', p.search)
    if (p?.status) q.set('status', p.status)
    const res = await request<{ data: HomepagePhoto[] }>('GET', `/homepage-photos?${q}`)
    return res.data
  },
  async create(fd: FormData) { return request<{ data: HomepagePhoto }>('POST', '/homepage-photos', fd, true) },
  async update(id: number, fd: FormData) { return request<{ data: HomepagePhoto }>('PUT', `/homepage-photos/${id}`, fd, true) },
  async remove(id: number) { return request('DELETE', `/homepage-photos/${id}`) },
}

// Featured programs
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
    const q = new URLSearchParams()
    if (p?.search) q.set('search', p.search)
    if (p?.status) q.set('status', p.status)
    const res = await request<{ data: FeaturedProgram[] }>('GET', `/featured-programs?${q}`)
    return res.data
  },
  async create(fd: FormData) { return request<{ data: FeaturedProgram }>('POST', '/featured-programs', fd, true) },
  async update(id: number, fd: FormData) { return request<{ data: FeaturedProgram }>('PUT', `/featured-programs/${id}`, fd, true) },
  async remove(id: number) { return request('DELETE', `/featured-programs/${id}`) },
}

// Testimonials
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
    const q = new URLSearchParams()
    if (p?.search) q.set('search', p.search)
    if (p?.status) q.set('status', p.status)
    const res = await request<{ data: Testimonial[] }>('GET', `/testimonials?${q}`)
    return res.data
  },
  async create(fd: FormData) { return request<{ data: Testimonial }>('POST', '/testimonials', fd, true) },
  async update(id: number, fd: FormData) { return request<{ data: Testimonial }>('PUT', `/testimonials/${id}`, fd, true) },
  async remove(id: number) { return request('DELETE', `/testimonials/${id}`) },
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

export const settingsApi = {
  async get(): Promise<SiteSettings> {
    const res = await request<{ data: SiteSettings }>('GET', '/settings')
    return res.data
  },
  async update(data: Partial<SiteSettings>) {
    return request<{ data: SiteSettings }>('PUT', '/settings', data)
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
    const res = await request<{ data: { visi: string } }>('GET', '/settings/visi')
    return res.data
  },
  async updateVisi(visi: string) {
    return request<{ data: { visi: string } }>('PUT', '/settings/visi', { visi })
  },
  async getMisi(): Promise<MisiItem[]> {
    const res = await request<{ data: MisiItem[] }>('GET', '/settings/misi')
    return res.data
  },
  async createMisi(data: { title: string; desc: string }) {
    return request<{ data: MisiItem }>('POST', '/settings/misi', data)
  },
  async updateMisi(id: number, data: { title?: string; desc?: string }) {
    return request<{ data: MisiItem }>('PUT', `/settings/misi/${id}`, data)
  },
  async deleteMisi(id: number) {
    return request('DELETE', `/settings/misi/${id}`)
  },
}

export const keunggulanApi = {
  async getAll(): Promise<KeunggulanItem[]> {
    const res = await request<{ data: KeunggulanItem[] }>('GET', '/settings/keunggulan')
    return res.data
  },
  async create(data: { icon: string; title: string; desc: string }) {
    return request<{ data: KeunggulanItem }>('POST', '/settings/keunggulan', data)
  },
  async update(id: number, data: { icon?: string; title?: string; desc?: string }) {
    return request<{ data: KeunggulanItem }>('PUT', `/settings/keunggulan/${id}`, data)
  },
  async remove(id: number) {
    return request('DELETE', `/settings/keunggulan/${id}`)
  },
}

// ─── Categories ─────────────────────────────────────────────
export interface Category { id: number; name: string; slug: string }

export const categoryApi = {
  async getAll() {
    const res = await request<{ data: Category[] }>('GET', '/categories')
    return res.data
  },
}
