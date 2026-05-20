# ✅ AORA Wistara — Sudah Diperbaiki

## Cara Pakai (Langkah-langkah)

### 1. Import Database
1. Buka **phpMyAdmin**
2. Pilih database `aora_db`
3. Klik tab **SQL**
4. Copy-paste isi file `JALANKAN_DI_PHPMYADMIN.sql` → klik **Go**

### 2. Jalankan Backend
```bash
cd backend
npm install
node server.js
```
Backend jalan di `http://localhost:5000`

### 3. Jalankan Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend jalan di `http://localhost:5173`

### 4. Masuk Admin
- Klik tombol ⚙️ di pojok kanan bawah website
- Login: `admin@aorawistara.id`
- Password: `admin123` (jika diubah, jalankan `node update_admin.js` di folder `backend` untuk mereset ke `admin123`)

---

## Reset Password Admin

Jika lupa atau ingin mereset password ke `admin123`, cukup jalankan ini di terminal folder `backend`:
```bash
node update_admin.js
```
Script tersebut akan mendeteksi admin yang sudah ada dan langsung memperbarui password-nya menjadi `admin123`.

---

## Yang Sudah Diperbaiki

| Bug | Status |
|-----|--------|
| AdminPage pakai data dummy, tidak fetch ke API | ✅ Fixed |
| Tidak ada form login admin → JWT tidak pernah ada | ✅ Fixed |
| vite.config.ts hilang → CORS error | ✅ Fixed |
| Semua menu admin tampil konten sama | ✅ Fixed |
| Tidak ada tabel/route settings | ✅ Fixed |

## File yang Berubah/Ditambah

**Frontend:**
- `vite.config.ts` — dibuat ulang (dengan proxy backend)
- `src/app/lib/api.ts` — baru (API client terpusat)
- `src/app/components/AdminPage.tsx` — diganti (ada login + routing menu)
- `src/app/components/admin/AdminLogin.tsx` — baru
- `src/app/components/admin/AdminDashboard.tsx` — baru
- `src/app/components/admin/AdminProgram.tsx` — baru (CRUD nyambung API)
- `src/app/components/admin/AdminGaleri.tsx` — baru (upload foto nyambung API)
- `src/app/components/admin/AdminPengaturan.tsx` — baru (simpan ke database)

**Backend:**
- `server.js` — ditambah baris route settings
- `controllers/settingsController.js` — baru
- `routes/settingsRoutes.js` — baru

**Database:**
- `JALANKAN_DI_PHPMYADMIN.sql` — buat tabel settings
