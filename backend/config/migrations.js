const { pool } = require("./database");

const DEFAULT_SETTINGS = {
  site_name: "Aora",
  tagline: "Lembaga Kursus",
  address: "Jl Tambak Medokan Ayu 6-C/56B",
  phone: "0822 2591 6619 (pak hari)",
  email: "info@aora.id",
  instagram: "https://instagram.com/aora",
  facebook: "https://facebook.com/aora",
  youtube: "https://youtube.com/@aora",
  tiktok: "https://tiktok.com/@aora",
  maps_url: "https://share.google/SVdjuvR7RWXbMcyMe",
  operational_hours: "Senin-Jumat 10.00-17.00",
  logo_url: "",
  about_text: "Aora adalah Lembaga Kursus yang membentuk individu berdaya saing melalui kombinasi lifeskill praktis dan ekspresi seni.",
  desc_intensif: "Program pembelajaran intensif dengan jadwal padat dan materi mendalam. Cocok untuk peserta yang ingin menguasai keahlian dalam waktu singkat dengan bimbingan instruktur berpengalaman.",
  desc_short_course: "Kelas singkat yang fokus pada Program Membatik dan Fotografi, dirancang untuk praktik kreatif dan hasil karya nyata dalam waktu yang lebih ringkas.",
  desc_reguler: "Program pembelajaran rutin dengan jadwal fleksibel dan biaya terjangkau. Ideal bagi peserta yang ingin belajar secara konsisten tanpa tekanan waktu yang ketat.",
};

const getDatabaseName = async () => {
  const [[row]] = await pool.query("SELECT DATABASE() AS database_name");
  return row.database_name;
};

const hasColumn = async (databaseName, tableName, columnName) => {
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [databaseName, tableName, columnName]
  );
  return rows.length > 0;
};

const safeQuery = async (sql, params = [], ignoredCodes = []) => {
  try {
    await pool.query(sql, params);
  } catch (error) {
    if (!ignoredCodes.includes(error.code)) throw error;
  }
};

const ensureUsernames = async (databaseName) => {
  if (!(await hasColumn(databaseName, "users", "username"))) {
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN username VARCHAR(32) NULL AFTER name
    `);
  }

  await pool.query(`
    UPDATE users
    SET username = CONCAT('user', id)
    WHERE username IS NULL OR username = ''
  `);

  await pool.query(`
    UPDATE users
    SET username = 'adminaora',
        password = '$2a$12$ambR/Yrqs5m8uHoDGJbSBOtNP7Fb1yYgHZuFVeAL8wk8KALt9GidG',
        name = 'Administrator',
        role = 'admin',
        is_active = 1
    WHERE role = 'admin'
    ORDER BY id ASC
    LIMIT 1
  `);

  await pool.query(`
    UPDATE users
    SET username = CONCAT('user', id)
    WHERE username IS NULL OR username = ''
  `);

  await pool.query(`
    INSERT INTO users (name, username, email, password, role, is_active)
    SELECT 'Administrator', 'adminaora', 'adminaora@aora.local', '$2a$12$ambR/Yrqs5m8uHoDGJbSBOtNP7Fb1yYgHZuFVeAL8wk8KALt9GidG', 'admin', 1
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'adminaora')
  `);

  await safeQuery("ALTER TABLE users MODIFY username VARCHAR(32) NOT NULL", [], ["ER_DUP_FIELDNAME"]);
  await safeQuery("ALTER TABLE users ADD UNIQUE KEY uq_users_username (username)", [], ["ER_DUP_KEYNAME"]);
};

const ensureProgramType = async (databaseName) => {
  if (!(await hasColumn(databaseName, "programs", "program_type"))) {
    await pool.query(`
      ALTER TABLE programs
      ADD COLUMN program_type ENUM('intensif', 'short_course', 'reguler') NOT NULL DEFAULT 'reguler' AFTER image
    `);
  }

  await safeQuery("ALTER TABLE programs ADD INDEX idx_program_type (program_type)", [], ["ER_DUP_KEYNAME"]);

  if (!(await hasColumn(databaseName, "programs", "is_featured"))) {
    await pool.query(`
      ALTER TABLE programs
      ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0 AFTER status
    `);
  }
};

const ensureProgramSchedules = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS program_schedules (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      program_id INT UNSIGNED NOT NULL,
      day VARCHAR(50) NOT NULL,
      time VARCHAR(100) NOT NULL,
      note VARCHAR(255) DEFAULT NULL,
      sort_order INT UNSIGNED NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
      INDEX idx_program_id (program_id),
      INDEX idx_sort_order (sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
};

const ensureHomepagePhotos = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS homepage_photos (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      image_path VARCHAR(500) NOT NULL,
      status ENUM('aktif', 'tidak_aktif') NOT NULL DEFAULT 'aktif',
      sort_order INT UNSIGNED NOT NULL DEFAULT 0,
      uploaded_by INT UNSIGNED DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_status (status),
      INDEX idx_sort_order (sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    INSERT IGNORE INTO homepage_photos (id, title, image_path, sort_order) VALUES
    (1, 'Tari Tradisional', '/gallery/tari1.jpg', 1),
    (2, 'Kelas Tari', '/gallery/tari2.png', 2),
    (3, 'Membatik', '/gallery/batik1.jpg', 3),
    (4, 'Batik Kreatif', '/gallery/batik2.jpg', 4),
    (5, 'Melukis', '/gallery/melukis1.jpg', 5),
    (6, 'Kelas Melukis', '/gallery/melukis2.png', 6)
  `);
};

const ensureFeaturedPrograms = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS featured_programs (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      description VARCHAR(500) NOT NULL,
      image_path VARCHAR(500) NOT NULL,
      accent TINYINT(1) NOT NULL DEFAULT 0,
      status ENUM('aktif', 'tidak_aktif') NOT NULL DEFAULT 'aktif',
      sort_order INT UNSIGNED NOT NULL DEFAULT 0,
      created_by INT UNSIGNED DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_status (status),
      INDEX idx_sort_order (sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    INSERT IGNORE INTO featured_programs (id, title, description, image_path, accent, sort_order) VALUES
    (1, 'Pelatihan Barista', 'Latte art, espresso, manual brew. Standar profesional kafe modern.', 'https://images.unsplash.com/photo-1637029567716-6c6775c341e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 0, 1),
    (2, 'Seni Menari', 'Tradisional dan kontemporer. Bangun ekspresi dan percaya diri di panggung.', 'https://images.unsplash.com/photo-1666902715814-691194b2f45f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 1, 2),
    (3, 'Batik', 'Membatik dari pola hingga pewarnaan. Lestarikan warisan budaya.', 'https://images.unsplash.com/photo-1604973104381-870c92f10343?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 0, 3)
  `);
};

const ensureTestimonials = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      alumni_name VARCHAR(120) NOT NULL,
      profile VARCHAR(150) NOT NULL,
      comment VARCHAR(500) NOT NULL,
      image_path VARCHAR(500) NOT NULL,
      status ENUM('aktif', 'tidak_aktif') NOT NULL DEFAULT 'aktif',
      sort_order INT UNSIGNED NOT NULL DEFAULT 0,
      created_by INT UNSIGNED DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_status (status),
      INDEX idx_sort_order (sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    INSERT IGNORE INTO testimonials (id, alumni_name, profile, comment, image_path, sort_order) VALUES
    (1, 'Nadia Putri', 'Alumni Program Membatik', 'Belajar di Aora membuat saya lebih percaya diri berkarya. Materinya praktis dan pengajarnya sabar.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=faces&fit=crop&fm=jpg&q=80&w=400&h=400', 1),
    (2, 'Raka Pratama', 'Alumni Fotografi', 'Saya jadi paham cara mengambil foto yang bercerita, bukan hanya sekadar menekan tombol kamera.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=faces&fit=crop&fm=jpg&q=80&w=400&h=400', 2),
    (3, 'Salsa Aulia', 'Alumni Seni Tari', 'Lingkungannya nyaman dan mendukung. Saya merasa punya ruang untuk berkembang dan tampil lebih berani.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=faces&fit=crop&fm=jpg&q=80&w=400&h=400', 3),
    (4, 'Dimas Arya', 'Alumni Barista', 'Dari nol sampai bisa membuat kopi dengan standar yang rapi. Ilmunya langsung bisa dipakai.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=faces&fit=crop&fm=jpg&q=80&w=400&h=400', 4),
    (5, 'Mira Lestari', 'Alumni Lifeskill', 'Programnya membantu saya menemukan potensi diri dan punya bekal baru untuk mulai usaha kecil.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=faces&fit=crop&fm=jpg&q=80&w=400&h=400', 5)
  `);
};

const ensureSettings = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) NOT NULL UNIQUE,
      setting_value TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  const values = Object.entries(DEFAULT_SETTINGS);
  await pool.query(
    `INSERT INTO settings (setting_key, setting_value)
     VALUES ?
     ON DUPLICATE KEY UPDATE setting_value = IF(setting_value IS NULL OR setting_value = '', VALUES(setting_value), setting_value)`,
    [values]
  );

  await pool.query(
    `UPDATE settings
     SET setting_value = 'Lembaga Kursus'
     WHERE setting_key = 'tagline' AND setting_value = 'Lembaga Kursus & Pelatihan'`
  );
  await pool.query(
    `UPDATE settings
     SET setting_value = 'Jl Tambak Medokan Ayu 6-C/56B'
     WHERE setting_key = 'address' AND setting_value IN ('', 'Surabaya, Jawa Timur')`
  );
  await pool.query(
    `UPDATE settings
     SET setting_value = REPLACE(REPLACE(REPLACE(setting_value, 'lembaga kursus dan pelatihan', 'lembaga kursus'), 'keterampilan', 'lifeskill'), 'ketrampilan', 'lifeskill')
     WHERE setting_key = 'about_text'`
  );
};

const ensureDatabaseSchema = async () => {
  const databaseName = await getDatabaseName();

  await ensureUsernames(databaseName);
  await ensureProgramType(databaseName);
  await ensureProgramSchedules();
  await ensureSettings();
  await ensureHomepagePhotos();
  await ensureFeaturedPrograms();
  await ensureTestimonials();

  console.log("Database schema checked and migrated.");
};

module.exports = { ensureDatabaseSchema };
