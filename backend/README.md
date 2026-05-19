# 🚀 AORA Wistara Backend API

Backend profesional untuk sistem manajemen **AORA Wistara** (LKP — Lembaga Kursus dan Pelatihan).

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (mysql2)
- **Auth**: JWT + bcryptjs
- **Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiter
- **Logging**: Morgan
- **Validation**: express-validator

---

## ⚡ Cara Menjalankan

### 1. Clone & Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Database MySQL

Buat database terlebih dahulu, lalu jalankan seeder:

```bash
npm run seed
```

Seeder akan otomatis membuat semua tabel dan data awal.

### 3. Konfigurasi `.env`

Edit file `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=aora_db
JWT_SECRET=ganti_dengan_string_random_panjang
FRONTEND_URL=http://localhost:5173
```

### 4. Jalankan Server

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Server berjalan di: **http://localhost:5000**

---

## 🔑 Default Admin

```
Email    : admin@aorawistara.id
Password : Admin@1234
```

---

## 📋 Daftar Endpoint API

### Auth

| Method | Endpoint             | Deskripsi              | Auth     |
|--------|---------------------|------------------------|----------|
| POST   | /api/auth/register  | Daftar akun baru       | ❌        |
| POST   | /api/auth/login     | Login                  | ❌        |
| POST   | /api/auth/logout    | Logout                 | ✅ Token  |
| GET    | /api/auth/me        | Profil saya            | ✅ Token  |

### Programs

| Method | Endpoint                    | Deskripsi              | Auth        |
|--------|-----------------------------|------------------------|-------------|
| GET    | /api/programs               | List semua program     | ❌           |
| GET    | /api/programs/:id           | Detail program         | ❌           |
| GET    | /api/programs/slug/:slug    | Detail program by slug | ❌           |
| POST   | /api/programs               | Tambah program         | ✅ Admin    |
| PUT    | /api/programs/:id           | Edit program           | ✅ Admin    |
| DELETE | /api/programs/:id           | Hapus program          | ✅ Admin    |

### Galleries

| Method | Endpoint               | Deskripsi              | Auth        |
|--------|------------------------|------------------------|-------------|
| GET    | /api/galleries         | List semua foto        | ❌           |
| GET    | /api/galleries/:id     | Detail foto            | ❌           |
| POST   | /api/galleries         | Upload foto baru       | ✅ Admin    |
| PUT    | /api/galleries/:id     | Edit galeri            | ✅ Admin    |
| DELETE | /api/galleries/:id     | Hapus foto             | ✅ Admin    |

### Articles

| Method | Endpoint                     | Deskripsi              | Auth        |
|--------|------------------------------|------------------------|-------------|
| GET    | /api/articles                | List artikel           | ❌           |
| GET    | /api/articles/:id            | Detail artikel         | ❌           |
| GET    | /api/articles/slug/:slug     | Detail by slug         | ❌           |
| POST   | /api/articles                | Buat artikel           | ✅ Admin    |
| PUT    | /api/articles/:id            | Edit artikel           | ✅ Admin    |
| DELETE | /api/articles/:id            | Hapus artikel          | ✅ Admin    |

### Dashboard (Admin Only)

| Method | Endpoint                                   | Deskripsi               |
|--------|--------------------------------------------|-------------------------|
| GET    | /api/dashboard/stats                       | Statistik lengkap       |
| GET    | /api/dashboard/users                       | List semua user         |
| PATCH  | /api/dashboard/users/:id/toggle-status     | Toggle status user      |

### Categories

| Method | Endpoint               | Deskripsi         | Auth        |
|--------|------------------------|-------------------|-------------|
| GET    | /api/categories        | List kategori     | ❌           |
| GET    | /api/categories/:id    | Detail kategori   | ❌           |
| POST   | /api/categories        | Buat kategori     | ✅ Admin    |
| PUT    | /api/categories/:id    | Edit kategori     | ✅ Admin    |
| DELETE | /api/categories/:id    | Hapus kategori    | ✅ Admin    |

---

## 🧪 Contoh Request (Postman)

### Login

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@aorawistara.id",
  "password": "Admin@1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Administrator",
      "email": "admin@aorawistara.id",
      "role": "admin"
    }
  }
}
```

### Tambah Program (dengan gambar)

```
POST http://localhost:5000/api/programs
Authorization: Bearer <token>
Content-Type: multipart/form-data

Fields:
- title: Pelatihan Barista
- description: Kursus barista profesional standar kafe modern
- duration: 3 Bulan
- price: 1500000
- status: aktif
- image: [file gambar]
```

### Upload Foto Galeri

```
POST http://localhost:5000/api/galleries
Authorization: Bearer <token>
Content-Type: multipart/form-data

Fields:
- title: Foto Workshop Batik
- caption: Peserta antusias dalam workshop batik
- category: Seni & Budaya
- image: [file gambar]
```

### List Artikel dengan Pagination

```
GET http://localhost:5000/api/articles?page=1&limit=10&status=published
```

### Dashboard Stats

```
GET http://localhost:5000/api/dashboard/stats
Authorization: Bearer <token>
```

---

## 🔧 Query Parameters

### Pagination (semua list endpoint)
- `page` — halaman (default: 1)
- `limit` — jumlah per halaman (default: 10, max: 100)

### Filter
- `search` — pencarian teks
- `status` — filter status
- `category_id` — filter kategori
- `program_id` — filter program (galeri)

---

## 📁 Struktur Folder

```
backend/
├── controllers/          # Logic bisnis tiap resource
│   ├── authController.js
│   ├── programController.js
│   ├── galleryController.js
│   ├── articleController.js
│   ├── dashboardController.js
│   └── categoryController.js
├── routes/               # Definisi endpoint
│   ├── authRoutes.js
│   ├── programRoutes.js
│   ├── galleryRoutes.js
│   ├── articleRoutes.js
│   ├── dashboardRoutes.js
│   └── categoryRoutes.js
├── middleware/           # Middleware custom
│   ├── auth.js           # verifyToken, isAdmin, optionalAuth
│   ├── validate.js       # Handler express-validator
│   └── errorHandler.js   # Global error handler
├── config/
│   ├── database.js       # MySQL connection pool
│   ├── seeder.js         # Script seeder database
│   └── schema.sql        # SQL schema manual
├── utils/
│   ├── response.js       # Helper response standar
│   ├── helpers.js        # Slug, pagination, format
│   └── upload.js         # Multer config & helpers
├── validators/           # express-validator rules
│   ├── authValidator.js
│   ├── programValidator.js
│   └── contentValidator.js
├── uploads/              # Folder hasil upload gambar
│   ├── gallery/
│   ├── programs/
│   ├── articles/
│   └── avatars/
├── .env                  # Environment variables
├── package.json
├── server.js             # Entry point
└── README.md
```

---

## ⚙️ Format Response API

Semua response menggunakan format standar:

```json
{
  "success": true,
  "message": "Data berhasil diambil.",
  "data": {}
}
```

Response dengan pagination:

```json
{
  "success": true,
  "message": "Data berhasil diambil.",
  "data": [],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

Response error:

```json
{
  "success": false,
  "message": "Pesan error.",
  "errors": {}
}
```

---

## 🔒 Autentikasi

Semua endpoint yang membutuhkan auth, kirim header:

```
Authorization: Bearer <JWT_TOKEN>
```

Token berlaku **7 hari**.

---

## 📦 Upload Gambar

- Format yang diterima: JPG, PNG, WEBP, GIF
- Maksimal ukuran: **5MB**
- Gambar disimpan di folder `uploads/`
- URL gambar otomatis dibangun dalam response

---

## 🛡️ Security Features

- **Helmet** — HTTP security headers
- **CORS** — hanya izinkan origin yang terdaftar
- **Rate Limiter** — maks 100 req/15 menit; auth 20 req/15 menit
- **bcrypt** — hash password dengan salt rounds 12
- **JWT** — token signed dengan secret key
- **express-validator** — sanitasi & validasi semua input
