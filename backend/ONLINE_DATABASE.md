# Online Database Mode

Backend bisa berjalan tanpa MySQL lokal dengan mode Supabase.

## Setup Supabase

1. Buat project di Supabase.
2. Buka SQL Editor, lalu jalankan isi file `config/supabase-schema.sql`.
3. Copy file `.env.supabase.example` menjadi `.env`.
4. Isi:
   - `DATABASE_PROVIDER=supabase`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET=aora-uploads`
   - `JWT_SECRET`
5. Jalankan backend seperti biasa.

Jika schema Supabase sudah pernah dibuat sebelum fitur username admin ditambahkan, jalankan juga `config/supabase-username-migration.sql` satu kali di SQL Editor. Setelah itu login admin default menjadi:

```text
username: adminaora
password: admin123
```

## Data yang Disimpan Online

Mode Supabase menyimpan data ini di database online:

- user admin dan auth
- pengaturan website
- program dan jadwal program
- kategori
- galeri
- foto homepage
- program unggulan
- testimoni alumni
- artikel

Upload foto juga diarahkan ke Supabase Storage bucket `aora-uploads`, jadi gambar dari admin panel tidak bergantung pada folder lokal.

## Migrasi Data Lama

Jika masih ada data di MySQL lokal dan ingin dipindahkan ke Supabase:

```bash
cd backend
node scripts/migrate-mysql-to-supabase.js
```

Pastikan `.env` masih berisi koneksi MySQL lama (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) dan juga berisi credential Supabase.

Setelah migrasi selesai, buka SQL Editor Supabase dan jalankan isi file `config/supabase-reset-sequences.sql`. Ini penting agar data baru dari dashboard admin tidak bentrok dengan ID lama yang diimport.

## Cek CRUD Online

Setelah `.env` sudah berisi credential Supabase, jalankan:

```bash
cd backend
node scripts/check-supabase-crud.js
```

Jika sukses, terminal akan menampilkan:

```text
Supabase CRUD online berhasil: settings upsert/read, category create/update/delete.
```

## Cara Kerja di Kode

- Default backend masih memakai MySQL supaya development lama tidak rusak.
- Saat `DATABASE_PROVIDER=supabase`, semua controller utama memakai Supabase REST API dari JavaScript.
- File foto dari dashboard admin diupload ke Supabase Storage, lalu URL publiknya disimpan ke tabel online.
- Data yang diedit admin di panel pengaturan langsung dipakai ulang oleh footer, kontak, WhatsApp, maps, dan bagian lain yang mengambil settings.
