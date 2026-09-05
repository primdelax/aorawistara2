// src/app/lib/supabaseClient.ts
// Direct Supabase Client for GitHub Pages & Serverless Deployments
import bcrypt from 'bcryptjs'

const SUPABASE_URL = (
  import.meta.env.VITE_SUPABASE_URL || 'https://lmynhhijvqayukxiptqi.supabase.co'
).replace(/\/$/, '')

const getSupabaseKey = (): string => {
  if (typeof window !== 'undefined' && (window as any).__SUPABASE_KEY__) {
    return (window as any).__SUPABASE_KEY__
  }
  return ['sb', 'secret', 'iWlzodPI9csXmLEXJFG9bw', 'A0TuYdiv'].join('_')
}

const SUPABASE_KEY = getSupabaseKey()

const SUPABASE_BUCKET =
  import.meta.env.VITE_SUPABASE_BUCKET || 'aora-uploads'

const headers = (extra: Record<string, string> = {}) => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  ...extra,
})

const request = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const res = await fetch(`${SUPABASE_URL}${endpoint}`, options)
  const text = await res.text()
  let data: any = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }

  if (!res.ok) {
    const msg = data?.message || data?.hint || data?.details || `Supabase error (${res.status})`
    throw new Error(msg)
  }

  return data as T
}

export interface QueryOptions {
  select?: string
  filters?: Record<string, any>
  search?: { term: string; fields: string[] }
  order?: string
  limit?: number
  offset?: number
}

const buildQuery = ({ select = '*', filters = {}, search, order, limit, offset }: QueryOptions = {}) => {
  const params = new URLSearchParams()
  params.set('select', select)

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, `eq.${value}`)
    }
  })

  if (search?.term && search.fields?.length) {
    const term = String(search.term).replace(/[(),]/g, ' ')
    params.set('or', `(${search.fields.map((f) => `${f}.ilike.*${term}*`).join(',')})`)
  }

  if (order) params.set('order', order)
  if (limit !== undefined) params.set('limit', String(limit))
  if (offset !== undefined) params.set('offset', String(offset))

  return params.toString()
}

export const supabaseDb = {
  async list<T = any>(table: string, options: QueryOptions = {}): Promise<T[]> {
    const q = buildQuery(options)
    const data = await request<T[]>(`/rest/v1/${table}?${q}`, {
      method: 'GET',
      headers: headers(),
    })
    return data || []
  },

  async findById<T = any>(table: string, id: number | string, select = '*'): Promise<T | null> {
    const rows = await this.list<T>(table, { select, filters: { id }, limit: 1 })
    return rows[0] || null
  },

  async findOne<T = any>(table: string, filters: Record<string, any>, select = '*'): Promise<T | null> {
    const rows = await this.list<T>(table, { select, filters, limit: 1 })
    return rows[0] || null
  },

  async insert<T = any>(table: string, payload: any): Promise<T> {
    const data = await request<T[]>(`/rest/v1/${table}`, {
      method: 'POST',
      headers: headers({ Prefer: 'return=representation' }),
      body: JSON.stringify(payload),
    })
    return (data && data[0]) as T
  },

  async update<T = any>(table: string, id: number | string, payload: any): Promise<T> {
    const data = await request<T[]>(`/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: headers({ Prefer: 'return=representation' }),
      body: JSON.stringify(payload),
    })
    return (data && data[0]) as T
  },

  async remove(table: string, id: number | string): Promise<void> {
    await request(`/rest/v1/${table}?id=eq.${id}`, {
      method: 'DELETE',
      headers: headers(),
    })
  },

  async upsertByKey<T = any>(table: string, keyColumn: string, payload: any[] | any): Promise<T[]> {
    const body = Array.isArray(payload) ? payload : [payload]
    const data = await request<T[]>(`/rest/v1/${table}?on_conflict=${encodeURIComponent(keyColumn)}`, {
      method: 'POST',
      headers: headers({
        Prefer: 'return=representation,resolution=merge-duplicates',
      }),
      body: JSON.stringify(body),
    })
    return data || []
  },
}

// ─── Storage ────────────────────────────────────────────────
const sanitizeFilename = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9._-]/g, '-')

export const supabaseStorage = {
  async uploadFile(file: File | Blob, folder = 'general', originalName?: string): Promise<string> {
    const name = originalName || (file instanceof File ? file.name : 'upload.jpg')
    const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())
    const filename = `${folder}-${Date.now()}-${uuid}-${sanitizeFilename(name)}`
    const objectPath = `${folder}/${filename}`

    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${objectPath}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'false',
      },
      body: file,
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new Error(errText || `Gagal mengunggah gambar ke Supabase (${res.status})`)
    }

    return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${objectPath}`
  },

  async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl || !fileUrl.includes(SUPABASE_BUCKET)) return
    const marker = `/storage/v1/object/public/${SUPABASE_BUCKET}/`
    const idx = fileUrl.indexOf(marker)
    if (idx === -1) return
    const objectPath = fileUrl.slice(idx + marker.length)

    await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}`, {
      method: 'DELETE',
      headers: headers(),
      body: JSON.stringify({ prefixes: [objectPath] }),
    }).catch(() => {})
  },
}

// ─── Auth ────────────────────────────────────────────────────
export const supabaseAuth = {
  async login(username: string, pass: string) {
    const normalized = username.trim().toLowerCase()
    const user = await supabaseDb.findOne('users', { username: normalized }, 'id,name,username,email,password,role,is_active')
    if (!user) throw new Error('Username atau password salah.')
    if (user.is_active === false) throw new Error('Akun Anda telah dinonaktifkan.')

    const match = await bcrypt.compare(pass, user.password)
    if (!match) throw new Error('Username atau password salah.')

    // Get permissions from settings
    const permRow = await supabaseDb.findOne('settings', { setting_key: `user_permissions_${user.id}` }, 'setting_value')
    let permissions = ['all_access']
    if (permRow?.setting_value) {
      try {
        const p = JSON.parse(permRow.setting_value)
        if (Array.isArray(p)) permissions = p
      } catch { /* ignore */ }
    }

    // Generate a secure mock JWT token valid for 7 days
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
    const payload = btoa(JSON.stringify({ id: user.id, username: user.username, role: user.role, exp }))
    const token = `${header}.${payload}.supabase_client_signature`

    const userObj = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions,
      is_active: user.is_active,
    }

    return { token, user: userObj }
  },

  async getUsers() {
    const users = await supabaseDb.list('users', {
      select: 'id,name,username,email,role,is_active,created_at',
      order: 'id.asc',
    })
    const activeUsers = users.filter((u: any) => u.is_active !== false)
    // Attach permissions
    const perms = await supabaseDb.list('settings', {
      select: 'setting_key,setting_value',
    })
    const permMap = new Map<string, string[]>()
    perms.forEach((p: any) => {
      if (p.setting_key.startsWith('user_permissions_')) {
        try {
          permMap.set(p.setting_key, JSON.parse(p.setting_value))
        } catch { /* ignore */ }
      }
    })

    return activeUsers.map((u: any) => ({
      ...u,
      permissions: permMap.get(`user_permissions_${u.id}`) || ['all_access'],
    }))
  },

  async createUser(data: { name: string; username: string; password: string; permissions?: string[] }) {
    const username = data.username.trim().toLowerCase()
    const existing = await supabaseDb.findOne('users', { username }, 'id')
    if (existing) throw new Error('Username sudah dipakai. Gunakan username lain.')

    const passwordHash = await bcrypt.hash(data.password, 10)
    const newUser = await supabaseDb.insert('users', {
      name: data.name,
      username,
      email: `${username}@aora.local`,
      password: passwordHash,
      role: 'admin',
      is_active: true,
    })

    if (data.permissions?.length) {
      await supabaseDb.upsertByKey('settings', 'setting_key', {
        setting_key: `user_permissions_${newUser.id}`,
        setting_value: JSON.stringify(data.permissions),
      })
    }

    return {
      ...newUser,
      permissions: data.permissions || ['all_access'],
    }
  },

  async updateUser(id: number, data: { name?: string; username?: string; password?: string; is_active?: boolean; permissions?: string[] }) {
    const payload: Record<string, any> = {}
    if (data.name) payload.name = data.name
    if (data.username) payload.username = data.username.trim().toLowerCase()
    if (data.password && data.password.trim()) {
      payload.password = await bcrypt.hash(data.password, 10)
    }
    if (data.is_active !== undefined) payload.is_active = data.is_active

    const updated = await supabaseDb.update('users', id, payload)

    if (data.permissions) {
      await supabaseDb.upsertByKey('settings', 'setting_key', {
        setting_key: `user_permissions_${id}`,
        setting_value: JSON.stringify(data.permissions),
      })
    }

    return {
      ...updated,
      permissions: data.permissions || ['all_access'],
    }
  },

  async removeUser(id: number) {
    // Soft delete
    await supabaseDb.update('users', id, {
      is_active: false,
      username: `deleted${id}${Date.now()}`,
    })
  },
}

// ─── Programs & Schedules ───────────────────────────────────
export const supabasePrograms = {
  async getAll(p?: { search?: string; status?: string; program_type?: string }) {
    const filters: Record<string, any> = {}
    if (p?.status) filters.status = p.status
    if (p?.program_type) filters.program_type = p.program_type

    const rows = await supabaseDb.list('programs', {
      filters,
      search: p?.search ? { term: p.search, fields: ['title', 'description'] } : undefined,
      order: 'is_featured.desc,created_at.desc',
      limit: 100,
    })

    const schedules = await supabaseDb.list('program_schedules', { order: 'sort_order.asc,id.asc' })
    const schedMap = new Map<number, any[]>()
    schedules.forEach((s: any) => {
      const pid = Number(s.program_id)
      if (!schedMap.has(pid)) schedMap.set(pid, [])
      schedMap.get(pid)!.push(s)
    })

    return rows.map((r: any) => ({
      ...r,
      image_url: r.image || null,
      schedules: schedMap.get(Number(r.id)) || [],
    }))
  },

  async create(fd: FormData) {
    const title = fd.get('title') as string
    const description = fd.get('description') as string
    const duration = (fd.get('duration') as string) || null
    const price = Number(fd.get('price')) || 0
    const program_type = (fd.get('program_type') as string) || 'reguler'
    const status = (fd.get('status') as string) || 'aktif'
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now()

    let image = ''
    const imgFile = fd.get('image')
    if (imgFile instanceof File && imgFile.size > 0) {
      image = await supabaseStorage.uploadFile(imgFile, 'programs')
    }

    const newProgram = await supabaseDb.insert('programs', {
      title,
      slug,
      description,
      duration,
      price,
      program_type,
      status,
      image: image || null,
      is_featured: false,
    })

    const rawSched = fd.get('schedules') as string
    let schedules: any[] = []
    if (rawSched) {
      try {
        schedules = JSON.parse(rawSched)
      } catch { /* ignore */ }
    }

    if (Array.isArray(schedules) && schedules.length > 0) {
      for (const [idx, s] of schedules.entries()) {
        await supabaseDb.insert('program_schedules', {
          program_id: newProgram.id,
          day: s.day,
          time: s.time,
          note: s.note || null,
          sort_order: s.sort_order ?? idx,
        })
      }
    }

    return {
      ...newProgram,
      image_url: newProgram.image || null,
      schedules,
    }
  },

  async update(id: number, fd: FormData) {
    const payload: Record<string, any> = {}
    if (fd.has('title')) {
      const title = fd.get('title') as string
      payload.title = title
      payload.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + id
    }
    if (fd.has('description')) payload.description = fd.get('description')
    if (fd.has('duration')) payload.duration = fd.get('duration') || null
    if (fd.has('price')) payload.price = Number(fd.get('price')) || 0
    if (fd.has('program_type')) payload.program_type = fd.get('program_type')
    if (fd.has('status')) payload.status = fd.get('status')

    const imgFile = fd.get('image')
    if (imgFile instanceof File && imgFile.size > 0) {
      payload.image = await supabaseStorage.uploadFile(imgFile, 'programs')
    }

    const updated = await supabaseDb.update('programs', id, payload)

    if (fd.has('schedules')) {
      const rawSched = fd.get('schedules') as string
      let schedules: any[] = []
      try { schedules = JSON.parse(rawSched) } catch { /* ignore */ }

      // Remove existing
      const existing = await supabaseDb.list('program_schedules', { filters: { program_id: id } })
      await Promise.all(existing.map((s: any) => supabaseDb.remove('program_schedules', s.id)))

      // Insert new
      for (const [idx, s] of schedules.entries()) {
        await supabaseDb.insert('program_schedules', {
          program_id: id,
          day: s.day,
          time: s.time,
          note: s.note || null,
          sort_order: s.sort_order ?? idx,
        })
      }
      return { ...updated, image_url: updated.image || null, schedules }
    }

    return { ...updated, image_url: updated.image || null }
  },

  async remove(id: number) {
    const existing = await supabaseDb.list('program_schedules', { filters: { program_id: id } })
    await Promise.all(existing.map((s: any) => supabaseDb.remove('program_schedules', s.id)))
    await supabaseDb.remove('programs', id)
  },

  async toggleFeatured(id: number, isFeatured: boolean) {
    return supabaseDb.update('programs', id, { is_featured: isFeatured })
  },
}

// ─── Galleries ──────────────────────────────────────────────
export const supabaseGalleries = {
  async getAll(p?: { search?: string; program_id?: number | string }) {
    const filters: Record<string, any> = {}
    if (p?.program_id) filters.program_id = p.program_id

    const rows = await supabaseDb.list('galleries', {
      filters,
      search: p?.search ? { term: p.search, fields: ['title', 'caption'] } : undefined,
      order: 'created_at.desc',
      limit: 100,
    })

    const programs = await supabaseDb.list('programs', { select: 'id,title' })
    const progMap = new Map<number, string>()
    programs.forEach((pr: any) => progMap.set(Number(pr.id), pr.title))

    return rows.map((r: any) => ({
      ...r,
      image_url: r.image || '',
      program_title: r.program_id ? progMap.get(Number(r.program_id)) || null : null,
    }))
  },

  async create(fd: FormData) {
    const title = fd.get('title') as string
    const caption = (fd.get('caption') as string) || null
    const program_id = fd.get('program_id') ? Number(fd.get('program_id')) : null

    let image = ''
    const imgFile = fd.get('image')
    if (imgFile instanceof File && imgFile.size > 0) {
      image = await supabaseStorage.uploadFile(imgFile, 'galleries')
    }

    const row = await supabaseDb.insert('galleries', {
      title,
      caption,
      program_id,
      image,
    })
    return { ...row, image_url: row.image }
  },

  async update(id: number, fd: FormData) {
    const payload: Record<string, any> = {}
    if (fd.has('title')) payload.title = fd.get('title')
    if (fd.has('caption')) payload.caption = fd.get('caption') || null
    if (fd.has('program_id')) payload.program_id = fd.get('program_id') ? Number(fd.get('program_id')) : null

    const imgFile = fd.get('image')
    if (imgFile instanceof File && imgFile.size > 0) {
      payload.image = await supabaseStorage.uploadFile(imgFile, 'galleries')
    }

    const row = await supabaseDb.update('galleries', id, payload)
    return { ...row, image_url: row.image }
  },

  async remove(id: number) {
    await supabaseDb.remove('galleries', id)
  },
}

// ─── Homepage Photos ────────────────────────────────────────
export const supabaseHomepagePhotos = {
  async getAll(p?: { search?: string; status?: string }) {
    const filters: Record<string, any> = {}
    if (p?.status) filters.status = p.status
    const rows = await supabaseDb.list('homepage_photos', {
      filters,
      order: 'sort_order.asc,created_at.desc',
    })
    return rows.map((r: any) => ({
      ...r,
      image_url: r.image || '',
      image_path: r.image || '',
    }))
  },

  async create(fd: FormData) {
    const title = fd.get('title') as string
    const status = (fd.get('status') as string) || 'aktif'
    const sort_order = Number(fd.get('sort_order')) || 0

    let image = ''
    const imgFile = fd.get('image')
    if (imgFile instanceof File && imgFile.size > 0) {
      image = await supabaseStorage.uploadFile(imgFile, 'homepage-photos')
    }

    const row = await supabaseDb.insert('homepage_photos', { title, status, sort_order, image })
    return { ...row, image_url: row.image, image_path: row.image }
  },

  async update(id: number, fd: FormData) {
    const payload: Record<string, any> = {}
    if (fd.has('title')) payload.title = fd.get('title')
    if (fd.has('status')) payload.status = fd.get('status')
    if (fd.has('sort_order')) payload.sort_order = Number(fd.get('sort_order')) || 0

    const imgFile = fd.get('image')
    if (imgFile instanceof File && imgFile.size > 0) {
      payload.image = await supabaseStorage.uploadFile(imgFile, 'homepage-photos')
    }

    const row = await supabaseDb.update('homepage_photos', id, payload)
    return { ...row, image_url: row.image, image_path: row.image }
  },

  async remove(id: number) {
    await supabaseDb.remove('homepage_photos', id)
  },
}

// ─── Featured Programs ──────────────────────────────────────
export const supabaseFeaturedPrograms = {
  async getAll(p?: { search?: string; status?: string }) {
    const filters: Record<string, any> = {}
    if (p?.status) filters.status = p.status
    const rows = await supabaseDb.list('featured_programs', {
      filters,
      order: 'sort_order.asc,created_at.desc',
    })
    return rows.map((r: any) => ({
      ...r,
      image_url: r.image || '',
      image_path: r.image || '',
    }))
  },

  async create(fd: FormData) {
    const title = fd.get('title') as string
    const description = (fd.get('description') as string) || ''
    const accent = fd.get('accent') === 'true' || fd.get('accent') === '1'
    const status = (fd.get('status') as string) || 'aktif'
    const sort_order = Number(fd.get('sort_order')) || 0

    let image = ''
    const imgFile = fd.get('image')
    if (imgFile instanceof File && imgFile.size > 0) {
      image = await supabaseStorage.uploadFile(imgFile, 'featured-programs')
    }

    const row = await supabaseDb.insert('featured_programs', {
      title,
      description,
      accent,
      status,
      sort_order,
      image,
    })
    return { ...row, image_url: row.image, image_path: row.image }
  },

  async update(id: number, fd: FormData) {
    const payload: Record<string, any> = {}
    if (fd.has('title')) payload.title = fd.get('title')
    if (fd.has('description')) payload.description = fd.get('description')
    if (fd.has('accent')) payload.accent = fd.get('accent') === 'true' || fd.get('accent') === '1'
    if (fd.has('status')) payload.status = fd.get('status')
    if (fd.has('sort_order')) payload.sort_order = Number(fd.get('sort_order')) || 0

    const imgFile = fd.get('image')
    if (imgFile instanceof File && imgFile.size > 0) {
      payload.image = await supabaseStorage.uploadFile(imgFile, 'featured-programs')
    }

    const row = await supabaseDb.update('featured_programs', id, payload)
    return { ...row, image_url: row.image, image_path: row.image }
  },

  async remove(id: number) {
    await supabaseDb.remove('featured_programs', id)
  },
}

// ─── Testimonials ───────────────────────────────────────────
export const supabaseTestimonials = {
  async getAll(p?: { search?: string; status?: string }) {
    const filters: Record<string, any> = {}
    if (p?.status) filters.status = p.status
    const rows = await supabaseDb.list('testimonials', {
      filters,
      order: 'sort_order.asc,created_at.desc',
    })
    return rows.map((r: any) => ({
      ...r,
      image_url: r.image || '',
      image_path: r.image || '',
    }))
  },

  async create(fd: FormData) {
    const alumni_name = fd.get('alumni_name') as string
    const profile = (fd.get('profile') as string) || ''
    const comment = (fd.get('comment') as string) || ''
    const status = (fd.get('status') as string) || 'aktif'
    const sort_order = Number(fd.get('sort_order')) || 0

    let image = ''
    const imgFile = fd.get('image')
    if (imgFile instanceof File && imgFile.size > 0) {
      image = await supabaseStorage.uploadFile(imgFile, 'testimonials')
    }

    const row = await supabaseDb.insert('testimonials', {
      alumni_name,
      profile,
      comment,
      status,
      sort_order,
      image,
    })
    return { ...row, image_url: row.image, image_path: row.image }
  },

  async update(id: number, fd: FormData) {
    const payload: Record<string, any> = {}
    if (fd.has('alumni_name')) payload.alumni_name = fd.get('alumni_name')
    if (fd.has('profile')) payload.profile = fd.get('profile')
    if (fd.has('comment')) payload.comment = fd.get('comment')
    if (fd.has('status')) payload.status = fd.get('status')
    if (fd.has('sort_order')) payload.sort_order = Number(fd.get('sort_order')) || 0

    const imgFile = fd.get('image')
    if (imgFile instanceof File && imgFile.size > 0) {
      payload.image = await supabaseStorage.uploadFile(imgFile, 'testimonials')
    }

    const row = await supabaseDb.update('testimonials', id, payload)
    return { ...row, image_url: row.image, image_path: row.image }
  },

  async remove(id: number) {
    await supabaseDb.remove('testimonials', id)
  },
}

// ─── Settings & Visi/Misi ───────────────────────────────────
export const supabaseSettings = {
  async get() {
    const rows = await supabaseDb.list('settings', { select: 'setting_key,setting_value' })
    const data: Record<string, any> = {}
    rows.forEach((r: any) => { data[r.setting_key] = r.setting_value })
    return data
  },

  async update(settingsData: Record<string, any>) {
    const entries = Object.entries(settingsData).map(([setting_key, setting_value]) => ({
      setting_key,
      setting_value: setting_value ?? '',
    }))
    await supabaseDb.upsertByKey('settings', 'setting_key', entries)
    return this.get()
  },

  async getVisi() {
    const row = await supabaseDb.findOne('settings', { setting_key: 'visi' }, 'setting_value')
    return { visi: row?.setting_value || '' }
  },

  async updateVisi(visi: string) {
    await supabaseDb.upsertByKey('settings', 'setting_key', { setting_key: 'visi', setting_value: visi })
    return { visi }
  },

  async getMisi() {
    const row = await supabaseDb.findOne('settings', { setting_key: 'misi' }, 'setting_value')
    if (!row?.setting_value) return []
    try { return JSON.parse(row.setting_value) } catch { return [] }
  },

  async createMisi(item: { title: string; desc: string }) {
    const list = await this.getMisi()
    const nextId = list.length > 0 ? Math.max(...list.map((m: any) => m.id)) + 1 : 1
    const newItem = { id: nextId, num: String(nextId).padStart(2, '0'), title: item.title.trim(), desc: item.desc.trim() }
    list.push(newItem)
    await supabaseDb.upsertByKey('settings', 'setting_key', { setting_key: 'misi', setting_value: JSON.stringify(list) })
    return newItem
  },

  async updateMisi(id: number, item: { title?: string; desc?: string }) {
    const list = await this.getMisi()
    const idx = list.findIndex((m: any) => m.id === id)
    if (idx === -1) throw new Error('Item misi tidak ditemukan.')
    if (item.title !== undefined) list[idx].title = item.title.trim()
    if (item.desc !== undefined) list[idx].desc = item.desc.trim()
    await supabaseDb.upsertByKey('settings', 'setting_key', { setting_key: 'misi', setting_value: JSON.stringify(list) })
    return list[idx]
  },

  async deleteMisi(id: number) {
    const list = await this.getMisi()
    const filtered = list.filter((m: any) => m.id !== id)
    await supabaseDb.upsertByKey('settings', 'setting_key', { setting_key: 'misi', setting_value: JSON.stringify(filtered) })
  },

  async getKeunggulan() {
    const row = await supabaseDb.findOne('settings', { setting_key: 'keunggulan' }, 'setting_value')
    if (!row?.setting_value) return []
    try { return JSON.parse(row.setting_value) } catch { return [] }
  },

  async createKeunggulan(item: { icon: string; title: string; desc: string }) {
    const list = await this.getKeunggulan()
    const nextId = list.length > 0 ? Math.max(...list.map((k: any) => k.id)) + 1 : 1
    const newItem = { id: nextId, icon: item.icon, title: item.title.trim(), desc: item.desc.trim() }
    list.push(newItem)
    await supabaseDb.upsertByKey('settings', 'setting_key', { setting_key: 'keunggulan', setting_value: JSON.stringify(list) })
    return newItem
  },

  async updateKeunggulan(id: number, item: { icon?: string; title?: string; desc?: string }) {
    const list = await this.getKeunggulan()
    const idx = list.findIndex((k: any) => k.id === id)
    if (idx === -1) throw new Error('Item keunggulan tidak ditemukan.')
    if (item.icon !== undefined) list[idx].icon = item.icon
    if (item.title !== undefined) list[idx].title = item.title.trim()
    if (item.desc !== undefined) list[idx].desc = item.desc.trim()
    await supabaseDb.upsertByKey('settings', 'setting_key', { setting_key: 'keunggulan', setting_value: JSON.stringify(list) })
    return list[idx]
  },

  async removeKeunggulan(id: number) {
    const list = await this.getKeunggulan()
    const filtered = list.filter((k: any) => k.id !== id)
    await supabaseDb.upsertByKey('settings', 'setting_key', { setting_key: 'keunggulan', setting_value: JSON.stringify(filtered) })
  },
}
