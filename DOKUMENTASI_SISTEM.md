# 📖 DOKUMENTASI SISTEM — AORA Wistara
### Website Resmi Lembaga Kursus & Pelatihan

> Versi Dokumen: 1.0 | Tanggal: Juni 2026  
> Bahasa: Bahasa Indonesia (mudah dipahami)

---

## 📋 DAFTAR ISI

1. [Gambaran Umum Website](#1-gambaran-umum-website)
2. [Fitur-Fitur Website](#2-fitur-fitur-website)
3. [Halaman Publik (Pengunjung)](#3-halaman-publik-pengunjung)
4. [Panel Admin](#4-panel-admin)
5. [Struktur Database](#5-struktur-database)
6. [Data Kritikal & Kepemilikan Data](#6-data-kritikal--kepemilikan-data)
7. [Teknologi yang Digunakan](#7-teknologi-yang-digunakan)
8. [Arsitektur Aplikasi](#8-arsitektur-aplikasi)
9. [Sistem Keamanan](#9-sistem-keamanan)
10. [Integrasi API & Layanan Eksternal](#10-integrasi-api--layanan-eksternal)
11. [Flowchart Pengguna (User Flow)](#11-flowchart-pengguna-user-flow)
12. [Flowchart Admin](#12-flowchart-admin)
13. [Alur Proses Bisnis](#13-alur-proses-bisnis)
14. [Alur Kerja / Workflow Sistem](#14-alur-kerja--workflow-sistem)
15. [Narasi Teknis Lengkap](#15-narasi-teknis-lengkap)

---

## 1. Gambaran Umum Website

**AORA Wistara** adalah website resmi untuk **Lembaga Kursus dan Pelatihan (LKP) AORA** — sebuah lembaga yang menyediakan program pelatihan di bidang seni, budaya, kuliner, dan lifeskill.

Website ini memiliki **dua sisi utama**:

| Sisi | Siapa yang menggunakannya | Fungsinya |
|------|--------------------------|-----------|
| **Website Publik** | Calon peserta / masyarakat umum | Melihat profil, program, galeri, dan menghubungi AORA |
| **Panel Admin** | Pengelola / staff AORA | Mengelola seluruh konten website |

### Tujuan Utama Website:
- 📢 **Mempromosikan** program pelatihan AORA kepada masyarakat
- 📞 **Menjembatani** calon peserta untuk menghubungi AORA via WhatsApp
- 🖼️ **Menampilkan** galeri kegiatan dan testimoni alumni
- ⚙️ **Memudahkan** admin mengelola konten tanpa perlu coding

---

## 2. Fitur-Fitur Website

### 🌐 Fitur Untuk Pengunjung (Publik)

| No | Fitur | Penjelasan |
|----|-------|------------|
| 1 | **Halaman Beranda (Home)** | Tampilan utama dengan slideshow foto, program unggulan, testimoni alumni, dan tombol WhatsApp |
| 2 | **Slideshow Foto Otomatis** | Foto-foto kegiatan berganti secara otomatis dengan animasi "throw" (melempar kartu) |
| 3 | **Jumlah Program Aktif** | Badge di beranda yang menampilkan total program aktif secara real-time dari database |
| 4 | **Program Unggulan** | Daftar 3 program unggulan yang dipilih admin, tampil di beranda |
| 5 | **Testimoni Alumni** | Kutipan pengalaman dari alumni AORA dengan foto profil |
| 6 | **Halaman Profil** | Informasi tentang AORA: sejarah, visi, misi, dan keunggulan |
| 7 | **Halaman Program** | Daftar lengkap program pelatihan dengan filter berdasarkan jenis (Intensif / Short Course / Reguler) |
| 8 | **Detail Program** | Judul, deskripsi, durasi, jadwal harian program (hari, jam, catatan) |
| 9 | **Halaman Galeri** | Kumpulan foto kegiatan pelatihan |
| 10 | **Halaman Kontak** | Informasi kontak lengkap, embed Google Maps, dan link WhatsApp |
| 11 | **Tombol WhatsApp** | Tombol di berbagai halaman untuk langsung menghubungi admin via WhatsApp |
| 12 | **Sosial Media** | Link ke Instagram, Facebook, YouTube, TikTok yang dikelola admin |
| 13 | **Running Text (Marquee)** | Teks berjalan di beranda yang menampilkan nama-nama program AORA |
| 14 | **Responsive Design** | Tampilan menyesuaikan layar HP, tablet, dan komputer |

### ⚙️ Fitur Untuk Admin (Panel Pengelola)

| No | Fitur | Penjelasan |
|----|-------|------------|
| 1 | **Login Admin** | Halaman login khusus admin dengan username & password |
| 2 | **Dashboard** | Ringkasan statistik: jumlah program, galeri, artikel, pengguna aktif |
| 3 | **Manajemen Program** | Tambah, edit, hapus program pelatihan (termasuk upload gambar & jadwal) |
| 4 | **Tandai Program Unggulan** | Memilih program mana yang tampil di beranda sebagai "Program Unggulan" |
| 5 | **Foto Homepage** | Kelola foto-foto yang muncul di slideshow beranda |
| 6 | **Manajemen Testimoni** | Tambah, edit, hapus testimoni alumni yang tampil di beranda |
| 7 | **Galeri Foto** | Upload dan kelola foto kegiatan / dokumentasi |
| 8 | **Pengaturan Website** | Ubah nama website, tagline, alamat, nomor WA, email, link sosmed, jam operasional |
| 9 | **Logout** | Keluar dari panel admin dengan aman |

---

## 3. Halaman Publik (Pengunjung)

### 🏠 Halaman Beranda (Home)

Ini adalah halaman pertama yang dilihat pengunjung. Berisi:

```
┌─────────────────────────────────────────────────────────┐
│  [NAVBAR] Logo | Beranda | Profil | Program | Galeri | Kontak │
├─────────────────────────────────────────────────────────┤
│                     HERO SECTION                        │
│  Teks: "Lembaga Kursus AORA"                           │
│  Deskripsi singkat tentang AORA                        │
│  [Tombol WA] [Tombol Lihat Program]                    │
│                         [Slideshow Foto Kegiatan]      │
│                         [Badge: XX Program Aktif]      │
├─────────────────────────────────────────────────────────┤
│  Running text berjalan: BARISTA ★ MENARI ★ BATIK ★ ... │
├─────────────────────────────────────────────────────────┤
│  TENTANG KAMI — Deskripsi singkat AORA                 │
├─────────────────────────────────────────────────────────┤
│  PROGRAM UNGGULAN — 3 kartu program pilihan admin      │
├─────────────────────────────────────────────────────────┤
│  TESTIMONI ALUMNI — Kata-kata dari alumni              │
├─────────────────────────────────────────────────────────┤
│  CTA — "Siap menjadi luar biasa? Chat WhatsApp"        │
├─────────────────────────────────────────────────────────┤
│  [FOOTER] Kontak | Sosmed | Copyright                  │
└─────────────────────────────────────────────────────────┘
```

**Hal spesial di beranda:**
- Slideshow foto bergerak dengan animasi "throw" (foto "dilempar" ke kanan/kiri bergantian)
- Semua teks dinamis — nama AORA, tagline, deskripsi, nomor WA — diambil dari database, bisa diubah admin

---

### 👤 Halaman Profil

Menampilkan informasi mendalam tentang AORA:
- **Tentang Kami** — Sejarah dan filosofi AORA
- **Visi** — Menjadi lembaga pelatihan terdepan yang melahirkan pribadi kreatif, kompeten, percaya diri
- **Misi** — 4 misi: Pelatihan Berkualitas, Pengembangan Karakter, Pelestarian Budaya, Komunitas Kuat
- **Keunggulan** — Alasan memilih AORA: program beragam, pengajar berpengalaman, berbasis komunitas, berkarakter

---

### 📚 Halaman Program

Menampilkan seluruh program pelatihan yang aktif, dibagi dalam 3 jenis:

| Jenis Program | Ikon | Penjelasan |
|---------------|------|------------|
| **Program Intensif** | ⚡ | Jadwal padat, materi mendalam, cocok bagi yang ingin cepat menguasai keahlian. Sertifikat kelulusan resmi. |
| **Short Course** | 🎓 | Kelas singkat berbasis praktik dan hasil karya nyata. Contoh: Membatik, Fotografi. |
| **Program Reguler** | 📅 | Jadwal fleksibel, biaya terjangkau, materi bertahap. Cocok untuk belajar konsisten. |

Setiap program menampilkan:
- Nama program & kategori
- Deskripsi
- Durasi
- **Jadwal lengkap** (hari, jam, catatan)
- Gambar program

---

### 🖼️ Halaman Galeri

Menampilkan kumpulan foto-foto kegiatan AORA (workshop, pelatihan, penampilan, dll).

---

### 📞 Halaman Kontak

- **Tombol WhatsApp** langsung ke nomor admin
- **Informasi Kontak**: Alamat, email, nomor telepon, jam operasional
- **Embed Google Maps** — peta lokasi AORA
- **Sosial Media**: Instagram, TikTok, Facebook, YouTube (dari pengaturan admin)
- **CTA** — Ajakan menghubungi AORA

---

## 4. Panel Admin

Diakses dengan menekan tombol ⚙️ (roda gigi) di pojok kanan bawah website.

### 🔐 Proses Login Admin

```
Pengunjung klik ⚙️ → Halaman Login Admin muncul
→ Masukkan username + password
→ Jika salah: tampil pesan error
→ Jika benar: masuk ke Panel Admin
```

Default login:
- **Username**: `adminaora`
- **Email**: `admin@aorawistara.id`
- **Password**: `admin123`

---

### 📊 Menu Admin

```
┌──────────────────────┬────────────────────────────────────────┐
│   SIDEBAR NAVIGASI   │            AREA KONTEN                 │
│                      │                                        │
│ [Logo AORA]          │  ┌─ Header: Nama Halaman + User       │
│ Admin Panel          │  │                                    │
│                      │  ├─────────────────────────────────── │
│ ▶ Dashboard          │  │                                    │
│   Program            │  │  [Konten sesuai menu yang dipilih] │
│   Foto Homepage      │  │                                    │
│   Testimoni          │  │                                    │
│   Galeri             │  │                                    │
│   Pengaturan         │  │                                    │
│                      │  └─────────────────────────────────── │
│ ─────────────────    │                                        │
│ [Username Admin]     │                                        │
│ [Keluar]             │                                        │
└──────────────────────┴────────────────────────────────────────┘
```

### 📌 Penjelasan Setiap Menu Admin

#### 1. Dashboard
- Menampilkan ringkasan statistik website
- Jumlah total program, galeri, artikel, user aktif
- Data diambil dari API backend secara langsung

#### 2. Program
Fitur CRUD (Create, Read, Update, Delete) untuk program pelatihan:
- **Tambah Program**: Isi form (nama, deskripsi, durasi, harga, jenis, kategori, gambar, jadwal harian)
- **Edit Program**: Ubah data program yang sudah ada
- **Hapus Program**: Hapus program dengan konfirmasi
- **Tandai Unggulan**: Toggle "featured" agar tampil di beranda
- **Status Aktif/Nonaktif**: Program nonaktif tidak tampil di halaman publik

> Setiap program bisa punya **beberapa jadwal** (misal: Senin 09.00-11.00, Rabu 13.00-15.00)

#### 3. Foto Homepage
- Tambah/edit/hapus foto yang muncul di slideshow beranda
- Upload gambar dari komputer
- Atur urutan tampil (sort order)
- Aktifkan/nonaktifkan foto

#### 4. Testimoni Alumni
- Tambah/edit/hapus testimoni alumni
- Upload foto profil alumni
- Isi nama, profil (misal: "Alumni Program Membatik"), dan kutipan
- Atur urutan tampil

#### 5. Galeri Foto
- Upload foto-foto dokumentasi kegiatan
- Isi judul, caption, dan kategori
- Bisa terhubung ke program tertentu

#### 6. Pengaturan Website
Mengatur konten dinamis yang tampil di seluruh halaman:

| Setting | Penjelasan |
|---------|------------|
| `site_name` | Nama website (default: "Aora") |
| `tagline` | Tagline/slogan |
| `about_text` | Deskripsi singkat AORA |
| `address` | Alamat kantor |
| `phone` | Nomor WhatsApp (untuk tombol WA) |
| `email` | Email kontak |
| `instagram` | Link/username Instagram |
| `facebook` | Link/username Facebook |
| `youtube` | Link/username YouTube |
| `tiktok` | Link/username TikTok |
| `maps_url` | Link Google Maps |
| `operational_hours` | Jam operasional |

---

## 5. Struktur Database

Database yang digunakan: **MySQL** (nama database: `aora_db`)  
Dukungan alternatif: **Supabase** (PostgreSQL cloud)

### Diagram Tabel Database

```
┌─────────────────┐       ┌─────────────────────┐
│     USERS       │       │     SESSIONS        │
│─────────────────│       │─────────────────────│
│ id (PK)         │──1:N──│ id (PK)             │
│ name            │       │ user_id (FK→users)  │
│ username        │       │ token_hash          │
│ email           │       │ ip_address          │
│ password (hash) │       │ user_agent          │
│ role            │       │ expires_at          │
│ avatar          │       └─────────────────────┘
│ is_active       │
└────────┬────────┘
         │
    1:N──┼──────────────────────────────────────┐
         │                                      │
         ↓                                      ↓
┌─────────────────┐       ┌─────────────────────┐
│    PROGRAMS     │       │     ARTICLES        │
│─────────────────│       │─────────────────────│
│ id (PK)         │       │ id (PK)             │
│ title           │       │ title               │
│ slug (unik)     │       │ slug (unik)         │
│ description     │       │ excerpt             │
│ duration        │       │ content             │
│ price           │       │ cover_image         │
│ image           │       │ status              │
│ program_type    │       │ category_id (FK)    │
│ status          │       │ author_id (FK)      │
│ is_featured     │       │ views               │
│ category_id(FK) │       │ published_at        │
│ created_by (FK) │       └─────────────────────┘
└────────┬────────┘
         │
    1:N──┘
         ↓
┌─────────────────────┐
│  PROGRAM_SCHEDULES  │
│─────────────────────│
│ id (PK)             │
│ program_id (FK)     │
│ day (hari)          │
│ time (jam)          │
│ note (catatan)      │
│ sort_order          │
└─────────────────────┘

┌─────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│   CATEGORIES    │   │    GALLERIES        │   │    TESTIMONIALS     │
│─────────────────│   │─────────────────────│   │─────────────────────│
│ id (PK)         │   │ id (PK)             │   │ id (PK)             │
│ name            │   │ title               │   │ alumni_name         │
│ slug (unik)     │   │ image_path          │   │ profile             │
│ description     │   │ image_url           │   │ comment             │
└─────────────────┘   │ caption             │   │ image_path          │
                      │ category            │   │ image_url           │
                      │ program_id (FK)     │   │ status              │
                      │ uploaded_by (FK)    │   │ sort_order          │
                      └─────────────────────┘   └─────────────────────┘

┌─────────────────────┐   ┌─────────────────────┐   ┌──────────────────────┐
│  HOMEPAGE_PHOTOS    │   │  FEATURED_PROGRAMS  │   │      SETTINGS        │
│─────────────────────│   │─────────────────────│   │──────────────────────│
│ id (PK)             │   │ id (PK)             │   │ id (PK)              │
│ title               │   │ title               │   │ setting_key (unik)   │
│ image_path          │   │ description         │   │ setting_value        │
│ image_url           │   │ image_path          │   └──────────────────────┘
│ status              │   │ image_url           │
│ sort_order          │   │ accent              │
│ uploaded_by (FK)    │   │ status              │
└─────────────────────┘   │ sort_order          │
                          │ created_by (FK)     │
                          └─────────────────────┘
```

### Penjelasan Setiap Tabel

| Tabel | Fungsi | Data Penting |
|-------|--------|--------------|
| `users` | Menyimpan akun admin & user | email unik, password terenkripsi, role (admin/user) |
| `sessions` | Menyimpan token login | token_hash, waktu kedaluwarsa |
| `categories` | Kategori program & artikel | nama, slug unik |
| `programs` | Data program pelatihan | judul, tipe, status aktif, is_featured |
| `program_schedules` | Jadwal setiap program | hari, jam, catatan (anak dari programs) |
| `homepage_photos` | Foto slideshow beranda | path gambar, urutan tampil |
| `featured_programs` | Program unggulan di beranda | gambar, deskripsi, urutan |
| `testimonials` | Testimoni alumni | nama, profil, komentar, foto |
| `galleries` | Foto dokumentasi kegiatan | gambar, caption, kategori |
| `articles` | Artikel/berita AORA | judul, konten, status draft/published |
| `settings` | Pengaturan website | key-value pairs (nama, WA, alamat, dll) |

---

## 6. Data Kritikal & Kepemilikan Data

### 🔴 Data Kritikal (Tidak Boleh Hilang)

| Data | Lokasi | Risiko Jika Hilang |
|------|--------|-------------------|
| **Password admin** | Tabel `users`, kolom `password` | Tidak bisa login sama sekali |
| **JWT Secret** | File `.env`, variabel `JWT_SECRET` | Semua token login tidak valid |
| **Data program** | Tabel `programs` | Website kehilangan konten utama |
| **Settings** | Tabel `settings` | Nomor WA, alamat, kontak hilang dari website |
| **Folder uploads** | `backend/uploads/` | Semua gambar program, galeri, testimoni hilang |

### 👤 Kepemilikan Data

```
Admin (role: 'admin')
  ├── Bisa CRUD semua data
  ├── Bisa mengubah settings website
  └── Bisa mengelola user lain

User biasa (role: 'user')
  └── Hanya bisa melihat profil sendiri (saat ini tidak digunakan di frontend)
```

### ⚠️ Isu Konsistensi & Duplikasi

| Isu | Penjelasan | Solusi yang Diterapkan |
|-----|------------|------------------------|
| **Duplikasi slug** | Program/artikel mungkin punya judul sama | Kolom `slug` dibuat `UNIQUE` di database |
| **Gambar orphan** | Gambar di folder uploads tapi datanya dihapus dari DB | Belum ada mekanisme auto-cleanup (perlu diperhatikan) |
| **Featured programs vs programs** | Ada dua tabel berbeda untuk program unggulan | `featured_programs` untuk kartu beranda (konten bebas), `programs.is_featured` untuk menandai program aktif |
| **Settings duplikasi** | Tabel settings pakai sistem key-value | Kolom `setting_key` dibuat `UNIQUE` untuk mencegah duplikasi |

---

## 7. Teknologi yang Digunakan

### Frontend (Tampilan)

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **React** | 18.x | Framework UI utama |
| **TypeScript** | 5.x | Bahasa pemrograman (JavaScript + type safety) |
| **Vite** | 5.x | Build tool & dev server (cepat) |
| **Tailwind CSS** | 3.x | Framework styling (utility-first CSS) |
| **Lucide React** | - | Ikon-ikon yang digunakan di UI |

### Backend (Server & API)

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Node.js** | 18+ | Runtime JavaScript server-side |
| **Express.js** | 4.x | Framework web server / routing API |
| **MySQL2** | 3.x | Driver koneksi ke database MySQL |
| **Multer** | 1.x | Handle upload file gambar |
| **JWT (jsonwebtoken)** | 9.x | Token autentikasi login |
| **bcryptjs** | 2.x | Enkripsi/hash password |
| **Helmet** | 7.x | Header keamanan HTTP |
| **express-rate-limit** | 7.x | Pembatas request (anti-spam) |
| **Morgan** | 1.x | Logging HTTP request |
| **express-validator** | 7.x | Validasi & sanitasi input |
| **Compression** | 1.x | Kompresi response (gzip) |
| **dotenv** | 16.x | Pembacaan file .env |

### Database

| Opsi | Keterangan |
|------|------------|
| **MySQL (local)** | Digunakan di mode development / lokal menggunakan phpMyAdmin |
| **Supabase (cloud)** | Opsi alternatif untuk deployment online (PostgreSQL) |

---

## 8. Arsitektur Aplikasi

### Diagram Arsitektur Sederhana

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Pengunjung/Admin)               │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │              FRONTEND (React + Vite)                     │  │
│   │              http://localhost:5173                       │  │
│   │                                                          │  │
│   │  Halaman Publik:          Panel Admin:                   │  │
│   │  • HomePage               • AdminDashboard              │  │
│   │  • ProfilPage             • AdminProgram                │  │
│   │  • ProgramPage            • AdminGaleri                 │  │
│   │  • GaleriPage             • AdminHomepagePhotos         │  │
│   │  • KontakPage             • AdminTestimonials           │  │
│   │                           • AdminPengaturan             │  │
│   └──────────────────┬───────────────────────────────────────┘  │
└──────────────────────┼──────────────────────────────────────────┘
                       │ HTTP Requests (fetch API)
                       │ /api/... (melewati Vite proxy)
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)                   │
│                   http://localhost:5000                         │
│                                                                 │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────────────┐  │
│  │ Middleware │  │   Routes    │  │     Controllers          │  │
│  │            │  │             │  │                          │  │
│  │ • Helmet   │  │ /api/auth   │  │ authController.js        │  │
│  │ • CORS     │  │ /api/prog.. │  │ programController.js     │  │
│  │ • RateLimit│  │ /api/gall.. │  │ galleryController.js     │  │
│  │ • Morgan   │  │ /api/arti.. │  │ articleController.js     │  │
│  │ • Compress │  │ /api/dash.. │  │ dashboardController.js   │  │
│  │ • JWT Auth │  │ /api/sett.. │  │ settingsController.js    │  │
│  └────────────┘  │ /api/test.. │  │ testimonialController.js │  │
│                  │ /api/home.. │  │ homepagePhotoController  │  │
│                  │ /api/feat.. │  │ featuredProgramController │  │
│                  └──────┬──────┘  └──────────────────────────┘  │
│                         │                                       │
│                  ┌──────▼──────┐                                │
│                  │   Uploads   │  (folder gambar)               │
│                  │ /uploads/   │                                │
│                  └─────────────┘                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │ MySQL Protocol
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                    DATABASE (MySQL)                             │
│                    aora_db                                      │
│                                                                 │
│  users • sessions • programs • program_schedules               │
│  categories • galleries • articles • settings                  │
│  homepage_photos • featured_programs • testimonials            │
└─────────────────────────────────────────────────────────────────┘
```

### Aplikasi Inti vs Pendukung

| Jenis | Komponen | Fungsi Bisnis |
|-------|----------|---------------|
| **Inti** | Frontend (React) | Tampilan yang dilihat pengunjung dan admin |
| **Inti** | Backend API (Express) | Logika bisnis, keamanan, pengolahan data |
| **Inti** | Database (MySQL) | Penyimpanan data utama |
| **Pendukung** | Multer (upload) | Fitur upload gambar |
| **Pendukung** | Supabase | Alternatif database cloud |
| **Pendukung** | WhatsApp URL | Jembatan komunikasi ke tim AORA |
| **Pendukung** | Google Maps Embed | Tampilan peta lokasi |

---

## 9. Sistem Keamanan

### 🔐 Autentikasi (Siapa yang Bisa Masuk)

```
Pengunjung → Tidak perlu login → Hanya bisa BACA data publik
Admin      → Harus login dulu  → Bisa BACA + TULIS + HAPUS data
```

**Cara kerja login:**
1. Admin masukkan username & password
2. Backend cek password dengan **bcrypt** (verifikasi hash)
3. Jika cocok, backend buat **JWT Token** (berlaku 7 hari)
4. Token disimpan di `localStorage` browser
5. Setiap request ke API admin selalu menyertakan token di header:
   ```
   Authorization: Bearer <token>
   ```
6. Backend verifikasi token sebelum memproses request

### 🛡️ Lapisan Keamanan Berlapis

| Lapisan | Teknologi | Fungsi |
|---------|-----------|--------|
| **Password hashing** | bcrypt (salt rounds: 12) | Password tidak disimpan plain text |
| **Token autentikasi** | JWT (JSON Web Token) | Verifikasi identitas tanpa simpan sesi di server |
| **HTTP Headers** | Helmet.js | Mencegah clickjacking, XSS, MIME sniffing |
| **CORS** | Express CORS | Hanya request dari frontend resmi yang diterima |
| **Rate Limiting** | express-rate-limit | Mencegah spam / brute force attack |
| **Validasi Input** | express-validator | Sanitasi semua input sebelum diproses |
| **Ukuran Upload** | Multer | Maksimal 5MB per gambar |
| **Format Gambar** | Whitelist | Hanya JPG, PNG, WEBP, GIF yang diterima |

### 📊 Detail Rate Limiting

| Endpoint | Batas Request | Jendela Waktu |
|----------|--------------|---------------|
| Semua `/api/*` | **100 request** | Per 15 menit |
| Login `/api/auth/login` | **20 request** | Per 15 menit |
| Register `/api/auth/register` | **20 request** | Per 15 menit |

> Jika melewati batas, server mengembalikan pesan: *"Terlalu banyak request. Coba lagi setelah 15 menit."*

### 🔑 Role & Hak Akses

| Endpoint | Pengunjung (tanpa login) | Admin (dengan token) |
|----------|--------------------------|----------------------|
| GET /api/programs | ✅ Bisa | ✅ Bisa |
| GET /api/galleries | ✅ Bisa | ✅ Bisa |
| GET /api/articles | ✅ Bisa | ✅ Bisa |
| GET /api/settings | ✅ Bisa | ✅ Bisa |
| POST /api/programs | ❌ Tidak bisa | ✅ Bisa |
| PUT /api/programs/:id | ❌ Tidak bisa | ✅ Bisa |
| DELETE /api/programs/:id | ❌ Tidak bisa | ✅ Bisa |
| GET /api/dashboard/stats | ❌ Tidak bisa | ✅ Bisa |
| PATCH /api/dashboard/users/:id | ❌ Tidak bisa | ✅ Bisa (Admin only) |

---

## 10. Integrasi API & Layanan Eksternal

### 🔌 API Internal (Backend ↔ Frontend)

Semua komunikasi frontend–backend menggunakan **REST API** dengan format JSON standar:

```json
// Response sukses
{
  "success": true,
  "message": "Data berhasil diambil.",
  "data": { ... }
}

// Response dengan pagination
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}

// Response error
{
  "success": false,
  "message": "Pesan error.",
  "errors": { ... }
}
```

### 📡 Daftar Endpoint API

```
AUTH
POST   /api/auth/login          → Login admin
POST   /api/auth/logout         → Logout
GET    /api/auth/me             → Data profil admin

PROGRAM
GET    /api/programs            → List semua program (publik)
GET    /api/programs/:id        → Detail program (publik)
POST   /api/programs            → Tambah program (admin)
PUT    /api/programs/:id        → Edit program (admin)
DELETE /api/programs/:id        → Hapus program (admin)
PATCH  /api/programs/:id/featured → Toggle unggulan (admin)

GALERI
GET    /api/galleries           → List foto (publik)
POST   /api/galleries           → Upload foto (admin)
PUT    /api/galleries/:id       → Edit galeri (admin)
DELETE /api/galleries/:id       → Hapus foto (admin)

ARTIKEL
GET    /api/articles            → List artikel (publik)
POST   /api/articles            → Buat artikel (admin)
PUT    /api/articles/:id        → Edit artikel (admin)
DELETE /api/articles/:id        → Hapus artikel (admin)

KATEGORI
GET    /api/categories          → List kategori (publik)
POST   /api/categories          → Buat kategori (admin)

DASHBOARD
GET    /api/dashboard/stats     → Statistik (admin)
GET    /api/dashboard/users     → Daftar user (admin)

SETTINGS
GET    /api/settings            → Ambil pengaturan (publik)
PUT    /api/settings            → Simpan pengaturan (admin)

FOTO HOMEPAGE
GET    /api/homepage-photos     → List foto slideshow (publik)
POST   /api/homepage-photos     → Upload foto (admin)
PUT    /api/homepage-photos/:id → Edit foto (admin)
DELETE /api/homepage-photos/:id → Hapus foto (admin)

PROGRAM UNGGULAN
GET    /api/featured-programs   → List program unggulan (publik)
POST   /api/featured-programs   → Tambah (admin)

TESTIMONI
GET    /api/testimonials        → List testimoni (publik)
POST   /api/testimonials        → Tambah (admin)
```

### 🌐 Layanan Eksternal yang Digunakan

| Layanan | Fungsi | Bagaimana Terintegrasi |
|---------|--------|------------------------|
| **WhatsApp** | Tombol chat langsung ke admin | URL dibuat: `https://wa.me/62xxxxx?text=...` dari nomor di settings |
| **Google Maps Embed** | Tampilkan peta lokasi | `<iframe>` dengan URL embed berdasarkan alamat |
| **Google Maps Link** | Tombol "Buka Google Maps" | Link langsung dari settings `maps_url` |
| **Instagram** | Link profil sosmed | URL dari settings `instagram` |
| **Facebook** | Link profil sosmed | URL dari settings `facebook` |
| **YouTube** | Link channel | URL dari settings `youtube` |
| **TikTok** | Link profil | URL dari settings `tiktok` |
| **Unsplash** (default) | Gambar placeholder | Digunakan sebagai foto default testimoni/featured jika belum ada upload |
| **Supabase** (opsional) | Database cloud | Alternatif MySQL untuk deployment online |

---

## 11. Flowchart Pengguna (User Flow)

### Alur Pengunjung Website

```
[Pengunjung Buka Website]
          │
          ▼
    [Halaman Beranda]
    ─ Melihat hero, slideshow foto
    ─ Melihat program unggulan
    ─ Melihat testimoni alumni
          │
    ┌─────┴──────────────────────────────────┐
    │     Navigasi ke halaman mana?          │
    └─┬──────────┬──────────┬──────────┬─────┘
      │          │          │          │
      ▼          ▼          ▼          ▼
  [PROFIL]   [PROGRAM]  [GALERI]   [KONTAK]
      │          │          │          │
      │     ┌────┴────┐      │     ┌────┴────┐
      │     │Pilih    │      │     │Lihat    │
      │     │Jenis    │      │     │Alamat   │
      │     │Program  │      │     │WA/Email │
      │     │Intensif │      │     │Maps     │
      │     │Short    │      │     │Sosmed   │
      │     │Reguler  │      │     └─────────┘
      │     └────┬────┘      │
      │          │           │
      │     [Lihat Detail    │
      │      Program]        │
      │          │           │
      └──────────┴───────────┘
                 │
                 ▼
      [Tertarik? Klik Tombol WhatsApp]
                 │
                 ▼
      [Chat dengan Tim AORA via WA]
                 │
                 ▼
      [Daftar/Konsultasi Program]
```

---

## 12. Flowchart Admin

### Alur Login & Navigasi Admin

```
[Admin Buka Website]
          │
          ▼
[Klik Tombol ⚙️ di pojok kanan bawah]
          │
          ▼
    [Halaman Login Admin]
          │
    ┌─────┴──────────────────────┐
    │ Masukkan username+password │
    └─────┬──────────────────────┘
          │
    ┌─────▼─────┐
    │ Verifikasi│
    │  Server   │
    └─────┬─────┘
          │
    ┌─────┴─────────────────────────┐
    │ Cocok?                        │
    └─────┬──────────────┬──────────┘
          │ YA            │ TIDAK
          ▼               ▼
    [Token JWT       [Tampil pesan
     disimpan]        error, coba lagi]
          │
          ▼
    [Panel Admin Terbuka]
          │
    ┌─────┴──────────────────────────────────────────────┐
    │ Menu mana yang dipilih?                            │
    └─┬────────┬──────────┬──────────┬──────────┬────────┘
      │        │          │          │          │
      ▼        ▼          ▼          ▼          ▼
 [DASHBOARD] [PROGRAM] [FOTO HOME] [TESIMONI] [GALERI] [PENGATURAN]
      │        │          │          │          │          │
      ▼        ▼          ▼          ▼          ▼          ▼
  Lihat    Tambah/     Upload/    Tambah/    Upload/    Edit nama,
  statistik Edit/Hapus  Edit/Hapus  Edit/Hapus  Edit/Hapus  WA, alamat,
            program      foto        testimoni  foto        sosmed
                │
           ┌────┴────┐
           │ Toggle  │
           │Unggulan?│
           └────┬────┘
                │ YA
                ▼
          [Tampil di
           Beranda]
          │
          │
          ▼ (setelah selesai)
    [Klik Keluar / Logout]
          │
          ▼
    [Token dihapus, kembali ke website]
```

### Alur CRUD Program (Contoh Proses Lengkap)

```
Admin di menu "Program"
         │
         ▼
[Klik "Tambah Program"]
         │
   ┌─────▼──────────────────────┐
   │ Isi Form:                  │
   │ • Nama program             │
   │ • Deskripsi                │
   │ • Jenis (Intensif/Reguler) │
   │ • Durasi                   │
   │ • Harga                    │
   │ • Kategori                 │
   │ • Upload gambar            │
   │ • Jadwal (hari + jam)      │
   └─────┬──────────────────────┘
         │ Klik Simpan
         ▼
   [Validasi Input]
         │
   ┌─────┴───────────────────────┐
   │ Ada field kosong/invalid?   │
   └─────┬──────────┬────────────┘
         │ TIDAK     │ YA
         ▼           ▼
  [Kirim ke API   [Tampil pesan
   Backend]        error validasi]
         │
         ▼
  [Backend simpan
   ke database]
         │
         ▼
  [Gambar disimpan
   di folder uploads]
         │
         ▼
  [Response sukses]
         │
         ▼
  [Program tampil
   di daftar]
         │
         ▼ (opsional)
  [Toggle is_featured
   → Tampil di Beranda]
```

---

## 13. Alur Proses Bisnis

### 📊 Bagaimana Website Mendukung Bisnis AORA

```
PROSES BISNIS: Calon Peserta → Mendaftar Program

Calon Peserta                    Tim AORA (Admin)
─────────────                    ─────────────────
Cari info kursus
    │
    ▼
Buka website AORA
    │
    ▼
Baca info program          ←── Admin sudah upload program
(jenis, jadwal, durasi)         di panel admin
    │
    ▼
Tertarik dengan program
    │
    ▼
Klik tombol WhatsApp       ──→ Admin terima pesan WA
    │                           dari calon peserta
    ▼
Chat dengan tim AORA       ←── Tim AORA jawab pertanyaan,
                                berikan info pendaftaran
    │
    ▼
Sepakat → Daftar           ──→ Tim AORA catat peserta
    │
    ▼
Ikuti pelatihan            ←── Foto dokumentasi diupload
                                admin ke galeri website
    │
    ▼
Selesai → Jadi Alumni      ──→ Admin tambah testimoni
                                ke halaman beranda
```

### 🔄 Siklus Konten Website

```
Admin                              Website Publik
─────                              ──────────────
Upload program baru
         │
         ▼
     Database tersimpan    ──→    Program muncul di
                                  halaman Program
         │
         ▼
Tandai sebagai unggulan   ──→    Tampil di Beranda
                                  sebagai Program Unggulan
         │
         ▼
Upload foto kegiatan      ──→    Foto tampil di Galeri
         │
         ▼
Tambah testimoni alumni   ──→    Tampil di Beranda
                                  bagian "Apa Kata Mereka"
         │
         ▼
Update pengaturan WA      ──→    Tombol WhatsApp di
(nomor baru)                      seluruh halaman berubah
```

---

## 14. Alur Kerja / Workflow Sistem

### 🔄 Workflow Request-Response (Cara Kerja Sistem)

```
PENGUNJUNG klik "Lihat Program"
              │
              ▼
    Frontend (React) kirim request HTTP:
    GET http://localhost:5173/api/programs?status=aktif
              │
              ▼
    Vite Proxy teruskan ke backend:
    GET http://localhost:5000/api/programs?status=aktif
              │
              ▼
    Backend Express terima request
              │
              ▼
    ┌─── Middleware pipeline ────────────────────────────┐
    │ 1. Rate Limiter → cek tidak spam                  │
    │ 2. Helmet → tambah security headers               │
    │ 3. Morgan → log request                           │
    │ 4. CORS → validasi origin                         │
    │ 5. JSON parser → parse request body               │
    └────────────────────────────────────────────────────┘
              │
              ▼
    Router /api/programs
    → programRoutes.js
    → programController.js → getAll()
              │
              ▼
    Query ke database MySQL:
    SELECT * FROM programs WHERE status = 'aktif'
              │
              ▼
    MySQL kembalikan data
              │
              ▼
    Controller format response JSON:
    { success: true, data: [...], pagination: {...} }
              │
              ▼
    Frontend terima data
              │
              ▼
    React render kartu-kartu program
              │
              ▼
    Pengunjung melihat daftar program ✅
```

### 🔄 Workflow Upload Gambar (Admin Upload Foto Program)

```
Admin di form "Tambah Program"
→ Pilih file gambar (JPG/PNG/WEBP, max 5MB)
→ Klik "Simpan"
              │
              ▼
Frontend kirim FormData (multipart):
POST /api/programs + file + data lain
+ Header: Authorization: Bearer <token>
              │
              ▼
Backend terima request
              │
              ▼
Middleware auth.js verifikasi JWT token
→ Token valid? Lanjut
→ Token tidak valid? Return 401 Unauthorized
              │
              ▼
Middleware Multer proses upload:
→ Cek format file (hanya gambar)
→ Cek ukuran (max 5MB)
→ Simpan ke folder: backend/uploads/programs/
→ Buat nama file unik (UUID + timestamp)
              │
              ▼
programController.js → create()
→ Simpan data ke tabel programs
→ Simpan path gambar ke kolom image
              │
              ▼
Response: { success: true, data: { ...program, image_url: "..." } }
              │
              ▼
Frontend tampilkan program baru di daftar ✅
```

### 🔄 Workflow Settings (Pengaturan Berubah → Website Berubah)

```
Admin ubah nomor WhatsApp di Pengaturan
              │
              ▼
Frontend kirim:
PUT /api/settings
Body: { phone: "0812-xxxx-xxxx" }
              │
              ▼
Backend update tabel settings:
UPDATE settings SET setting_value = '0812-xxxx-xxxx'
WHERE setting_key = 'phone'
              │
              ▼
Frontend di semua halaman pakai SettingsContext:
→ Saat halaman dimuat ulang / dibuka baru:
→ GET /api/settings → ambil data terbaru
→ buildWhatsAppUrl(phone) → buat URL WA baru
→ Semua tombol WA otomatis pakai nomor baru ✅
```

---

## 15. Narasi Teknis Lengkap

### 📦 Data — Jenis, Kepemilikan, Konsistensi

**Jenis Data Kritikal:**
- **Data Identitas** (`users`): email, username, password hash — unik per pengguna
- **Data Konten** (`programs`, `articles`, `galleries`): konten utama website — dimiliki oleh admin yang membuatnya (`created_by` / `uploaded_by`)
- **Data Konfigurasi** (`settings`): pengaturan global website — dimiliki sistem, diubah admin
- **Data Media** (folder `uploads/`): file gambar fisik di server — berkaitan dengan data di database

**Kepemilikan Data:**
- Kolom `created_by` / `uploaded_by` di setiap tabel merujuk ke `users.id`
- Jika user dihapus → data terkait ikut terhapus (CASCADE) atau kolom jadi NULL (SET NULL)

**Isu Konsistensi:**
- Slug program/artikel dijamin unik di level database (`UNIQUE` constraint)
- File gambar yang sudah diupload tidak otomatis terhapus jika record di database dihapus → potensi file "orphan" di server
- Dua sistem program unggulan: `programs.is_featured` (toggle) vs tabel `featured_programs` (konten terpisah dengan gambar & deskripsi bebas)

---

### 🖥️ Aplikasi — Inti, Pendukung, Hubungan Antar Komponen

**Aplikasi Inti:**
1. **Frontend React** — Melayani semua fungsi bisnis yang dilihat pengguna: informasi program, kontak, galeri, testimoni
2. **Backend Express** — Melayani semua operasi data: CRUD program, auth admin, upload gambar
3. **Database MySQL** — Pusat penyimpanan semua data konten dan konfigurasi

**Aplikasi Pendukung:**
- **Multer** — Layanan upload file (hanya aktif saat admin upload gambar)
- **JWT** — Layanan autentikasi (hanya aktif saat ada request dengan token)
- **Vite Dev Server** — Proxy request `/api/*` ke backend (mode development)
- **Supabase** (opsional) — Bisa menggantikan MySQL untuk deployment cloud

**Hubungan Antar Komponen:**
```
Frontend ──(REST API)──→ Backend ──(SQL)──→ Database
Frontend ←──(JSON)────── Backend ←──(data)── Database
Frontend ──(FormData)──→ Backend → Simpan file di /uploads/
Frontend ←──(URL gambar)── Backend
```

---

### 🌐 Teknologi — Platform, Keamanan, Integrasi

**Platform:**
- **Development**: On-premise (lokal di komputer) menggunakan Node.js + MySQL
- **Deployment Konseptual**: Bisa dipindahkan ke VPS (server virtual), shared hosting Node.js, atau layanan cloud (Railway, Render, Vercel + Supabase)
- **Database Cloud**: Supabase (PostgreSQL) sudah disiapkan sebagai alternatif untuk deployment online

**Keamanan:**
- Auth berbasis **JWT stateless** — server tidak perlu simpan sesi
- Password diproses dengan **bcrypt** (salt 12 rounds, sangat aman)
- HTTP security headers via **Helmet** (mencegah XSS, clickjacking)
- CORS strict: hanya domain frontend resmi yang bisa akses API
- Rate limiting di seluruh API + lebih ketat di endpoint login
- Semua input divalidasi dengan **express-validator** sebelum diproses

**Integrasi (API / Service):**
- **REST API Internal**: Komunikasi frontend-backend via JSON, token JWT di header
- **WhatsApp**: Deep link `wa.me/` + teks pesan awal
- **Google Maps**: Embed iframe + link langsung
- **Sosial Media**: Link langsung ke platform (Instagram, FB, YouTube, TikTok)
- **File Storage**: Lokal di server (`uploads/`) — bukan CDN eksternal
- **Supabase** (opsional): SDK Supabase untuk database cloud + storage

---

## 📝 Catatan Penting

> **Untuk Admin**: Nomor WhatsApp yang diisi di **Pengaturan** → langsung memengaruhi semua tombol WA di seluruh halaman. Pastikan formatnya benar (contoh: `08221234567`).

> **Upload Gambar**: Ukuran maksimal 5MB per gambar. Format yang diterima: JPG, PNG, WEBP, GIF.

> **Reset Password Admin**: Jika lupa password, jalankan `node update_admin.js` di folder `backend`.

> **Backup**: Selalu backup folder `backend/uploads/` dan database `aora_db` secara berkala karena semua gambar dan data tersimpan di sana.

---

*Dokumentasi ini dibuat otomatis berdasarkan analisis source code project AORA Wistara.*  
*Jika ada perubahan sistem, dokumentasi ini perlu diperbarui secara manual.*
