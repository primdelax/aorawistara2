/**
 * Script: Seed Dummy Programs
 * Jalankan: node seed_programs.js
 *
 * Script ini akan menghapus data program lama dan mengisi data program dummy baru
 * untuk database MySQL maupun Supabase (tergantung DATABASE_PROVIDER di .env).
 */

require("dotenv").config();
const bcrypt = require("bcryptjs");
const { isSupabase } = require("./config/dataProvider");
const supabase = require("./services/supabaseService");
const { pool } = require("./config/database");

const programsDummy = [
  // --- PROGRAM INTENSIF ---
  {
    title: "Pelatihan Menari Tradisional",
    slug: "pelatihan-menari-tradisional",
    description: "Pelatihan tari tradisional Nusantara terlengkap dari tingkat dasar hingga mahir. Dibimbing langsung oleh koreografer profesional berpengalaman untuk menguasai tari klasik dan kontemporer.",
    duration: "3 Bulan",
    price: 1500000,
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=60",
    program_type: "intensif",
    status: "aktif",
    category_id: 1, // Seni & Budaya
    schedules: [
      { day: "Senin & Rabu", time: "15:00 - 17:00", note: "Membawa selendang/pakaian tari sendiri", sort_order: 0 },
      { day: "Sabtu", time: "10:00 - 12:00", note: "Evaluasi mingguan & latihan gabungan", sort_order: 1 }
    ]
  },
  {
    title: "Professional Barista & Coffee Art",
    slug: "professional-barista-coffee-art",
    description: "Pelajari seni meracik kopi, teknik espresso extraction, manual brewing, milk texturing, hingga membuat latte art yang indah. Sangat cocok untuk calon barista profesional.",
    duration: "1 Bulan",
    price: 2500000,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=60",
    program_type: "intensif",
    status: "aktif",
    category_id: 3, // Kuliner
    schedules: [
      { day: "Selasa & Kamis", time: "09:00 - 12:00", note: "Bahan dan kopi premium sudah disediakan", sort_order: 0 }
    ]
  },
  {
    title: "Personality Development & Public Speaking",
    slug: "personality-development-public-speaking",
    description: "Tingkatkan rasa percaya diri, etika berkomunikasi profesional, body language, cara berpakaian menarik, dan teknik berbicara di depan umum secara meyakinkan.",
    duration: "2 Bulan",
    price: 1800000,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60",
    program_type: "intensif",
    status: "aktif",
    category_id: 1, // Seni & Budaya
    schedules: [
      { day: "Rabu & Jumat", time: "13:00 - 15:00", note: "Wajib menggunakan pakaian rapi dan formal", sort_order: 0 }
    ]
  },
  {
    title: "Seni Melukis & Ekspresi Visual",
    slug: "seni-melukis-ekspresi-visual",
    description: "Eksplorasi teknik melukis menggunakan cat air, akrilik, hingga cat minyak di atas kanvas. Temukan gaya artistik unik yang ada dalam dirimu bersama pelukis profesional.",
    duration: "2 Bulan",
    price: 1200000,
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=60",
    program_type: "intensif",
    status: "aktif",
    category_id: 1, // Seni & Budaya
    schedules: [
      { day: "Senin & Kamis", time: "14:00 - 16:00", note: "Kanvas dan peralatan cat premium disediakan", sort_order: 0 }
    ]
  },
  {
    title: "Tata Rias Pengantin & Makeup Artist",
    slug: "tata-rias-pengantin-makeup-artist",
    description: "Kuasai teknik makeup pengantin tradisional, modern, wisuda, hingga makeup panggung. Pelatihan dari nol untuk memulai karir sukses sebagai Makeup Artist (MUA).",
    duration: "2 Bulan",
    price: 3000000,
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop&q=60",
    program_type: "intensif",
    status: "aktif",
    category_id: 4, // Fashion
    schedules: [
      { day: "Sabtu & Minggu", time: "09:00 - 13:00", note: "Membawa model masing-masing untuk sesi praktik", sort_order: 0 }
    ]
  },
  {
    title: "Teknisi Komputer & Jaringan Dasar",
    slug: "teknisi-komputer-jaringan-dasar",
    description: "Praktik langsung merakit komputer (PC), instalasi sistem operasi Windows & Linux, troubleshooting perangkat keras/lunak, serta konfigurasi jaringan kabel dan nirkabel.",
    duration: "1 Bulan",
    price: 1600000,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=60",
    program_type: "intensif",
    status: "aktif",
    category_id: 2, // Teknologi
    schedules: [
      { day: "Senin & Rabu", time: "18:00 - 20:00", note: "Kelas malam, cocok bagi pekerja atau mahasiswa", sort_order: 0 }
    ]
  },
  {
    title: "Desain Grafis & Komunikasi Visual",
    slug: "desain-grafis-komunikasi-visual",
    description: "Kuasai software Adobe Photoshop, Illustrator, dan CorelDraw untuk merancang logo, materi promosi, layout majalah, dan konten media sosial yang estetik.",
    duration: "2 Bulan",
    price: 1750000,
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=60",
    program_type: "intensif",
    status: "aktif",
    category_id: 2, // Teknologi
    schedules: [
      { day: "Selasa & Jumat", time: "15:00 - 17:00", note: "Wajib membawa laptop spesifikasi standar desain", sort_order: 0 }
    ]
  },
  {
    title: "Aplikasi Perkantoran & Administrasi Bisnis",
    slug: "aplikasi-perkantoran-administrasi-bisnis",
    description: "Pelatihan intensif Microsoft Word, Excel, dan PowerPoint tingkat lanjut untuk kebutuhan perkantoran modern, pengolahan data keuangan, dan presentasi dinamis.",
    duration: "1 Bulan",
    price: 1000000,
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=60",
    program_type: "intensif",
    status: "aktif",
    category_id: 2, // Teknologi
    schedules: [
      { day: "Sabtu & Minggu", time: "14:00 - 17:00", note: "Modul pelatihan dan ujian sertifikasi komputer", sort_order: 0 }
    ]
  },

  // --- SHORT COURSE ---
  {
    title: "Digital Photography & Editing",
    slug: "digital-photography-editing",
    description: "Pelajari segitiga eksposur, teknik komposisi foto kreatif, penggunaan studio lighting, serta retouching foto digital menggunakan Adobe Lightroom.",
    duration: "2 Minggu",
    price: 950000,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
    program_type: "short_course",
    status: "aktif",
    category_id: 1, // Seni & Budaya
    schedules: [
      { day: "Sabtu", time: "08:00 - 12:00", note: "Ada sesi outdoor hunting foto di taman kota", sort_order: 0 }
    ]
  },
  {
    title: "Seni Batik Tulis Tradisional",
    slug: "seni-batik-tulis-tradisional",
    description: "Short course untuk mempelajari teknik membatik klasik Jawa, mulai dari menggambar pola di kain primissima, mencanting lilin malam, hingga teknik pewarnaan celup.",
    duration: "3 Hari",
    price: 600000,
    image: "https://images.unsplash.com/photo-1604973104381-870c92f10343?w=800&auto=format&fit=crop&q=60",
    program_type: "short_course",
    status: "aktif",
    category_id: 1, // Seni & Budaya
    schedules: [
      { day: "Jumat - Minggu", time: "09:00 - 16:00", note: "Seluruh bahan kain canting disediakan dan batik dibawa pulang", sort_order: 0 }
    ]
  },

  // --- PROGRAM REGULER ---
  {
    title: "Kelas Desain UI/UX & Produk Digital",
    slug: "kelas-desain-ui-ux-produk-digital",
    description: "Program reguler berdurasi panjang untuk mempelajari user research, wireframing, visual design, dan interactive prototyping di Figma untuk aplikasi mobile maupun web.",
    duration: "4 Bulan",
    price: 1800000,
    image: "https://images.unsplash.com/photo-1561070791-26c113006238?w=800&auto=format&fit=crop&q=60",
    program_type: "reguler",
    status: "aktif",
    category_id: 2, // Teknologi
    schedules: [
      { day: "Rabu", time: "19:00 - 21:00", note: "Kelas online tatap muka via Zoom", sort_order: 0 },
      { day: "Sabtu", time: "13:00 - 15:00", note: "Praktik review portofolio secara tatap muka", sort_order: 1 }
    ]
  }
];

async function seedSupabase() {
  console.log("⚙️  Seeding data ke Supabase...");

  // Dapatkan user ID admin yang valid
  const users = await supabase.list("users", { filters: { username: "primodelax" } });
  if (users.length === 0) {
    throw new Error("User primodelax tidak ditemukan. Harap jalankan script update_supabase_user.js terlebih dahulu.");
  }
  const adminId = users[0].id;
  console.log(`👤 Menggunakan admin user ID: ${adminId} (${users[0].username})`);

  // Dapatkan program lama
  console.log("🧹 Membersihkan program lama...");
  const oldPrograms = await supabase.list("programs");
  for (const prog of oldPrograms) {
    // Hapus jadwal terkait
    const schedules = await supabase.list("program_schedules", { filters: { program_id: prog.id } });
    for (const sched of schedules) {
      await supabase.remove("program_schedules", sched.id);
    }
    // Hapus program
    await supabase.remove("programs", prog.id);
  }
  console.log("✅ Program lama terhapus.");

  // Insert program baru
  for (const p of programsDummy) {
    console.log(`➡️  Memasukkan program: ${p.title}`);
    const insertedProg = await supabase.insert("programs", {
      title: p.title,
      slug: p.slug,
      description: p.description,
      duration: p.duration,
      price: p.price,
      image: p.image,
      program_type: p.program_type,
      status: p.status,
      category_id: p.category_id,
      created_by: adminId,
    });

    if (insertedProg && insertedProg.id) {
      for (const s of p.schedules) {
        await supabase.insert("program_schedules", {
          program_id: insertedProg.id,
          day: s.day,
          time: s.time,
          note: s.note,
          sort_order: s.sort_order,
        });
      }
    }
  }

  console.log("🎉 Seeding Supabase selesai dengan sukses!");
}

async function seedMySQL() {
  console.log("⚙️  Seeding data ke MySQL...");

  // Dapatkan user ID admin yang valid
  const [users] = await pool.query("SELECT id FROM users WHERE username = 'primodelax' OR role = 'admin' LIMIT 1");
  if (users.length === 0) {
    throw new Error("Admin user tidak ditemukan di database MySQL.");
  }
  const adminId = users[0].id;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    console.log("🧹 Membersihkan program lama...");
    await conn.query("DELETE FROM program_schedules");
    await conn.query("DELETE FROM programs");

    for (const p of programsDummy) {
      console.log(`➡️  Memasukkan program: ${p.title}`);
      const [res] = await conn.query(
        `INSERT INTO programs (title, slug, description, duration, price, image, program_type, status, category_id, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.title, p.slug, p.description, p.duration, p.price, p.image, p.program_type, p.status, p.category_id, adminId]
      );

      const progId = res.insertId;
      for (const s of p.schedules) {
        await conn.query(
          `INSERT INTO program_schedules (program_id, day, time, note, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [progId, s.day, s.time, s.note, s.sort_order]
        );
      }
    }

    await conn.commit();
    console.log("🎉 Seeding MySQL selesai dengan sukses!");
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function main() {
  if (isSupabase) {
    await seedSupabase();
  } else {
    await seedMySQL();
  }
}

main()
  .then(() => {
    console.log("\n🚀 SEMUA DATA PROGRAM BERHASIL DI-SEED!\n");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seeding gagal:", err);
    process.exit(1);
  });
