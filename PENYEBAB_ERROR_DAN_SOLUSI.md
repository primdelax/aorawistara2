# 🔧 Penyebab Error & Cara Mengatasi — Aora Project

> Dokumen ini menjelaskan **apa penyebab** error yang muncul di website Aora dan **apa yang bisa kamu lakukan** agar CRUD data berjalan lancar.

---

## ❌ Error 0: "Forbidden use of secret API key in browser" ⭐ PENTING

### Apa yang Terjadi

Error ini muncul di browser saat kamu mencoba **login atau CRUD data** di GitHub Pages. Pesan lengkapnya biasanya:

```
Supabase error (403): Forbidden use of secret API key in browser
```
atau
```
Error: Supabase error (403)
```

### Penyebab Teknis

Kode frontend sebelumnya menggunakan **`service_role` key** (kunci `sb_secret_...`) langsung dari browser. Ini **diblokir keras oleh Supabase** karena:

| Jenis Key | Akses | Cocok Untuk |
|-----------|-------|-------------|
| `anon` key (format `eyJ...`) | Dibatasi RLS policies | ✅ Browser / GitHub Pages |
| `service_role` key | Akses penuh, bypass RLS | ✅ Backend server saja ❌ JANGAN di browser |

Supabase sengaja memblokir `service_role` key dari browser demi keamanan. Kalau key ini bocor, siapa pun bisa baca/hapus seluruh database.

### Perbaikan yang Sudah Dilakukan (Kode)

- **`frontend/src/app/lib/supabaseClient.ts`**: Key sekarang diambil dari `VITE_SUPABASE_ANON_KEY` (env variable), bukan hardcode `service_role` key
- **`.github/workflows/deploy.yml`**: GitHub Actions sekarang meng-inject `secrets.VITE_SUPABASE_ANON_KEY` saat build

### Langkah yang Harus Kamu Lakukan

#### Step 1 — Dapatkan Anon Key

1. Login ke [supabase.com](https://supabase.com) → pilih project kamu
2. Klik **Project Settings** (ikon gear) → **API**
3. Di bagian **Project API keys**, salin nilai **`anon public`**
4. Key dimulai dengan `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

> [!CAUTION]
> Jangan salin `service_role` — itu untuk backend saja. Salin `anon public`.

#### Step 2 — Tambah GitHub Secret

1. Buka repo GitHub kamu → **Settings** → **Secrets and variables** → **Actions**
2. Klik **New repository secret**
3. **Name**: `VITE_SUPABASE_ANON_KEY`
4. **Value**: paste anon key dari Step 1
5. Klik **Add secret**

#### Step 3 — Jalankan SQL RLS di Supabase

1. Buka [supabase.com](https://supabase.com) → project → **SQL Editor**
2. Klik **New query**
3. Salin isi file [`backend/config/supabase-rls-anon-fix.sql`](file:///c:/Users/MyBook%20Hype%20AMD/Documents/Codex/2026-05-31/aku-ingin-mengirim-mu-project-coding/work/aorawistara2/backend/config/supabase-rls-anon-fix.sql)
4. Klik **Run**

#### Step 4 — Tambah ke `.env` Lokal (Development)

Edit file `frontend/.env` dan isi `VITE_SUPABASE_ANON_KEY`:
```env
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Step 5 — Push ke GitHub

Setelah semua langkah di atas, push kode ke branch `main`. GitHub Actions akan otomatis rebuild dan deploy ke GitHub Pages dengan anon key yang benar.

---


## ❌ Error 1: "Koneksi ke backend gagal. Pastikan backend server sudah berjalan"

### Penyebab
Error ini muncul ketika **frontend tidak bisa menjangkau backend** di `http://localhost:5000`.

Ini terjadi karena:
1. **Backend belum dijalankan** — server Node.js di folder `backend/` belum dinyalakan
2. **Backend crash** — server sempat jalan tapi kemudian error dan berhenti sendiri
3. **Port konflik** — port 5000 sedang dipakai aplikasi lain

### Cara Memperbaiki

**Langkah 1: Jalankan backend terlebih dahulu**
```bash
cd backend
npm install
node server.js
```

Kalau berhasil, akan muncul:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚀 Aora Backend API
  🌐 URL      : http://localhost:5000
  🗄️  Database : Supabase online
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Langkah 2: Jalankan frontend**
```bash
cd frontend
npm install
npm run dev
```

> [!IMPORTANT]
> **Urutan wajib**: Backend harus jalan DULU, baru frontend. Keduanya harus aktif secara bersamaan di terminal yang berbeda.

**Tes koneksi manual:** Buka browser → `http://localhost:5000/api/health`. Kalau muncul `{"success":true}` berarti backend aktif.

---

## ❌ Error 2: "Token sudah kadaluarsa" / "Sesi login telah berakhir"

### Penyebab
JWT (JSON Web Token) yang dipakai untuk autentikasi **memiliki masa berlaku** (default: 7 hari). Setelah 7 hari, token otomatis tidak berlaku lagi.

Sebelumnya, kode frontend **tidak mendeteksi** token expired secara otomatis — token lama masih tersimpan di browser (`localStorage`) dan ketika dipakai untuk request, backend menolaknya dengan status `401 Unauthorized`. Hasilnya: semua operasi CRUD gagal karena dianggap tidak terautentikasi.

### Perbaikan Kode yang Sudah Dilakukan

**✅ Auto-detect token expired secara lokal** — Parsing payload JWT tanpa request ke server. Kalau expired, langsung arahkan ke halaman login.

**✅ Validasi ke server saat halaman admin dibuka** — Saat pertama buka admin panel, sistem memanggil `/api/auth/me`. Kalau ditolak → otomatis logout.

**✅ Auto-logout saat 401** — Kalau sedang CRUD dan backend balas `401`, frontend otomatis clear token dan tampilkan halaman login.

### Cara Mengatasi (Manual)

Kalau masih muncul notifikasi token kadaluarsa:

1. **Logout lalu login ulang** dari halaman admin
2. Atau: F12 → Application → Local Storage → hapus `aora_token` dan `aora_user` → refresh → login ulang

---

## 🗄️ Tentang Supabase — Apa yang Bisa Kamu Lakukan

Project ini menggunakan **Supabase** sebagai database online (PostgreSQL hosted).

### Konfigurasi di `backend/.env`

```env
DATABASE_PROVIDER=supabase
SUPABASE_URL=https://lmynhhijvqayukxiptqi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  ← harus format JWT!
SUPABASE_STORAGE_BUCKET=aora-uploads
```

### 1. Mendapatkan / Memperbarui Service Role Key

> [!CAUTION]
> `SUPABASE_SERVICE_ROLE_KEY` adalah kunci dengan **akses penuh** ke database. Jangan commit ke GitHub.

**Cara mendapatkan key yang benar:**
1. Login ke [supabase.com](https://supabase.com) → pilih project
2. Klik **Project Settings** → **API**
3. Di bagian **Project API keys**, salin nilai `service_role` (bukan `anon`)
4. Key harus dimulai dengan `eyJ...` (format JWT — 3 bagian dipisah titik)
5. Paste ke `backend/.env` → `SUPABASE_SERVICE_ROLE_KEY=`
6. Restart backend

### 2. Kalau Project Supabase di-Pause

Supabase free tier **mem-pause project** setelah 7 hari tidak ada request aktif.

**Ciri-ciri project paused:**
- Backend berjalan, tapi semua request CRUD gagal
- Log backend: error "fetch failed" atau timeout dari Supabase

**Cara mengaktifkan kembali:**
1. Login ke [supabase.com](https://supabase.com)
2. Pilih project → akan ada banner "Project is paused"
3. Klik **Restore project** → tunggu 1-2 menit

**Cara mencegah auto-pause:**
- Akses website/API sesekali setiap beberapa hari
- Atau upgrade ke plan Pro Supabase (berbayar)

### 3. Mengatur Row Level Security (RLS)

Jika INSERT/UPDATE/DELETE gagal dengan error `"violates row-level security policy"`:

Buka **Supabase SQL Editor** dan jalankan:
```sql
-- Disable RLS untuk semua tabel (development)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE galleries DISABLE ROW LEVEL SECURITY;
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE featured_programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE program_schedules DISABLE ROW LEVEL SECURITY;
```

> [!NOTE]
> Backend sudah menggunakan `service_role` key yang mem-bypass RLS secara default. Jalankan SQL di atas hanya kalau masih ada issue.

### 4. Mengatur Storage Bucket (untuk Upload Gambar)

Bucket `aora-uploads` harus ada dan bersifat **public** agar gambar bisa ditampilkan:

1. Login Supabase → **Storage** di sidebar
2. Pastikan bucket `aora-uploads` ada
3. Klik bucket → **Policies** → pastikan ada policy read public

Kalau bucket belum ada, jalankan di SQL Editor:
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'aora-uploads',
  'aora-uploads',
  true,
  5242880,
  array['image/jpeg','image/jpg','image/png','image/webp','image/gif']
) ON CONFLICT (id) DO UPDATE SET public = true;
```

### 5. Reset / Inisialisasi Database Ulang

Kalau tabel belum ada atau perlu reset, jalankan file schema di Supabase SQL Editor:

1. Buka Supabase → **SQL Editor** → **New query**
2. Salin seluruh isi file `backend/config/supabase-schema.sql`
3. Klik **Run**

File ini membuat semua tabel, bucket, dan data awal (termasuk akun admin).

---

## ✅ Checklist Sebelum Mulai CRUD

- [ ] Backend berjalan (`node server.js` sukses tanpa error merah)
- [ ] Frontend berjalan (`npm run dev` sukses)
- [ ] Sudah login sebagai admin di halaman admin
- [ ] Supabase project tidak dalam status paused
- [ ] `SUPABASE_SERVICE_ROLE_KEY` format JWT (`eyJ...`)

---

## 📋 Akun Admin Default

| Field    | Value         |
|----------|---------------|
| Username | `adminaora`   |
| Password | `admin123`    |
| Role     | `admin`       |

> [!WARNING]
> Ganti password default segera setelah pertama kali login!

---

## 📝 Ringkasan Perbaikan Kode

| File | Perbaikan |
|------|-----------|
| [`api.ts`](file:///c:/Users/MyBook%20Hype%20AMD/Documents/Codex/2026-05-31/aku-ingin-mengirim-mu-project-coding/work/aorawistara2/frontend/src/app/lib/api.ts) | Deteksi JWT expired lokal, auto-logout saat 401, `validateSession()`, `isLoggedIn()` kini cek exp |
| [`AdminPage.tsx`](file:///c:/Users/MyBook%20Hype%20AMD/Documents/Codex/2026-05-31/aku-ingin-mengirim-mu-project-coding/work/aorawistara2/frontend/src/app/components/AdminPage.tsx) | Validasi session saat buka admin, event `aora:session-expired`, spinner loading |
