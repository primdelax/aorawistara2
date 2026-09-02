# 🚀 Panduan Menjalankan Web AORA Wistara (Supabase Online Database)

Dokumen ini berisi panduan lengkap untuk menjalankan website AORA Wistara secara lokal yang sudah terhubung langsung ke database **Supabase**.

---

## 📌 1. Checklist Menjalankan Proyek

Setiap kali ingin menjalankan website ini, buka **2 terminal terpisah**:

### Terminal 1: Menjalankan Backend API (Port 5000)
```powershell
cd backend
npm install
node server.js
```
> Pastikan muncul log:  
> `🌐 URL      : http://localhost:5000`  
> `🗄️  Database : Supabase online`

---

### Terminal 2: Menjalankan Frontend Web (Port 5173)
```powershell
cd frontend
npm install
npm run dev
```
> Buka browser di: **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 2. Akun & Login Admin Panel

1. Buka website di **http://localhost:5173**
2. Klik tombol **⚙️ (Ikon Pengaturan)** di pojok kanan bawah halaman.
3. Masukkan kredensial admin:
   - **Username**: `adminaora`
   - **Password**: `admin123`
   *(Atau alternatif: Username: `primodelax`, Password: `primo123`)*

> 💡 *Jika ingin mereset/membuat ulang password default*, buka terminal folder `backend` lalu jalankan:
> ```powershell
> node update_admin.js
> ```

---

## 🛡️ 3. Fitur Role & Hak Akses Menu Admin

Website ini dilengkapi sistem **Role & Hak Akses (Multi-Permission)** untuk membatasi menu apa saja yang bisa diakses oleh masing-masing akun admin:

### Pilihan Hak Akses yang Tersedia:
1. **All Access (Penuh)**:
   - Memilih opsi ini otomatis memberikan akses ke **semua menu**, termasuk menu **Pengaturan Website & Akun Admin**.
2. **Program**:
   - Izin untuk menambah, mengedit, menghapus program kursus, jadwal, dan program unggulan.
3. **Foto Homepage**:
   - Izin untuk mengelola animasi foto slideshow lempar kartu di halaman utama.
4. **Testimoni**:
   - Izin untuk mengelola ulasan alumni yang tampil di halaman utama.
5. **Galeri**:
   - Izin untuk upload, mengedit, dan menghapus foto-foto kegiatan di galeri.

### Tampilan Menu yang Terkunci (Lens Blur):
- Jika admin mengklik menu yang **tidak memiliki hak akses**, sistem akan menampilkan tampilan **Lens Blur Putih (Frosted Glass)** elegan dengan:
  - 🔒 **Ikon Gembok Terkunci (Lock Padlock)**
  - Teks: **"Anda tidak punya akses untuk menu ini"**
  - Keterangan & tombol kembali ke Dashboard.

### Cara Mengatur Hak Akses Admin Baru / Edit Admin:
1. Masuk ke panel admin dengan akun Super Admin (`adminaora`).
2. Masuk ke menu **Pengaturan** -> bagian **Akun Admin & Hak Akses Role**.
3. Klik tombol **Tambah Admin** atau ikon **✏️ Edit** pada akun yang diinginkan.
4. Di bagian **Pilihan Hak Akses Menu**, centang menu-menu yang ingin diberikan (bisa pilih lebih dari satu atau pilih **All Access**).
5. Klik **Simpan Akun Admin**.

---

## ⚙️ 4. Konfigurasi Database Supabase

Koneksi Supabase sudah dikonfigurasi di file `backend/.env`:
- **Provider**: `DATABASE_PROVIDER=supabase`
- **URL Supabase**: `https://lmynhhijvqayukxiptqi.supabase.co`
- **Bucket Storage**: `aora-uploads`

Semua data (program, galeri, foto homepage, testimoni, settings profil/visi-misi, dan hak akses user) tersimpan langsung di cloud Supabase.

---

## 🛠️ 5. Fitur-Fitur Admin Panel yang Tersedia

1. **Dashboard**: Ringkasan jumlah program, galeri, artikel, dan user admin.
2. **Manajemen Program**: Tambah, edit, hapus program kursus, atur jadwal, upload gambar program, dan tandai program unggulan.
3. **Foto Homepage**: Tambah/edit/hapus foto slideshow animasi lempar kartu di halaman utama.
4. **Testimoni Alumni**: Kelola ulasan alumni yang tampil di halaman utama.
5. **Galeri**: Upload dan kategorisasi foto kegiatan lembaga.
6. **Pengaturan Website & Akun**:
   - Identitas (Nama website, tagline, tentang kami)
   - Visi & Misi lembaga
   - Daftar Keunggulan lembaga
   - Informasi Kontak (No. WhatsApp, email, jam kerja, alamat)
   - Link Media Sosial (Instagram, Facebook, YouTube, TikTok)
   - Link Google Maps
   - Manajemen Akun Admin & Pembagian Hak Akses Role

---

## ❓ 6. Troubleshooting / Solusi Masalah

| Masalah | Solusi |
|---|---|
| **Halaman web putih / blank** | Tekan `Ctrl + Shift + R` (Hard Reload) di browser untuk membersihkan cache frontend. Pastikan tidak ada error kompilasi di terminal frontend. |
| **Data tidak muncul (loading terus)** | Pastikan **Backend** di terminal 1 sudah berjalan di port 5000 (`node server.js`). |
| **Gagal upload gambar** | Pastikan storage bucket `aora-uploads` di Supabase diset ke mode **Public Bucket**. |
| **Port 5000 atau 5173 bentrok (EADDRINUSE)** | Matikan proses Node lama di Task Manager atau restart terminal. |

---

*Selamat mengelola website AORA Wistara!*
