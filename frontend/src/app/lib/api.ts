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

export interface AdminUser { id: number; name: string; email: string; role: string }

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
  async login(email: string, password: string) {
    const data = await request<{ data: { token: string; user: AdminUser } }>('POST', '/auth/login', { email, password })
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
  status: 'aktif' | 'tidak_aktif'; category_id: number | null
  category_name: string | null; created_at: string
}

export const programApi = {
  async getAll(p?: { search?: string; status?: string }) {
    const q = new URLSearchParams()
    if (p?.search) q.set('search', p.search)
    if (p?.status) q.set('status', p.status)
    q.set('limit', '100')
    const res = await request<{ data: Program[] }>('GET', `/programs?${q}`)
    return res.data
  },
  async create(fd: FormData) { return request<{ data: Program }>('POST', '/programs', fd, true) },
  async update(id: number, fd: FormData) { return request<{ data: Program }>('PUT', `/programs/${id}`, fd, true) },
  async remove(id: number) { return request('DELETE', `/programs/${id}`) },
}

// ─── Gallery ────────────────────────────────────────────────
export interface GalleryItem {
  id: number; title: string; image_url: string
  caption: string | null; category: string | null
  program_title: string | null; created_at: string
}

export const galleryApi = {
  async getAll(p?: { search?: string }) {
    const q = new URLSearchParams()
    if (p?.search) q.set('search', p.search)
    q.set('limit', '100')
    const res = await request<{ data: GalleryItem[] }>('GET', `/galleries?${q}`)
    return res.data
  },
  async create(fd: FormData) { return request<{ data: GalleryItem }>('POST', '/galleries', fd, true) },
  async update(id: number, fd: FormData) { return request<{ data: GalleryItem }>('PUT', `/galleries/${id}`, fd, true) },
  async remove(id: number) { return request('DELETE', `/galleries/${id}`) },
}

// ─── Settings ───────────────────────────────────────────────
export interface SiteSettings {
  site_name: string; tagline: string; address: string; phone: string
  email: string; instagram: string; facebook: string; youtube: string
  logo_url: string | null; about_text: string
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

// ─── Categories ─────────────────────────────────────────────
export interface Category { id: number; name: string; slug: string }

export const categoryApi = {
  async getAll() {
    const res = await request<{ data: Category[] }>('GET', '/categories')
    return res.data
  },
}
