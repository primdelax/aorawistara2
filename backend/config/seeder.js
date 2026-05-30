require("dotenv").config();
const mysql2 = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const run = async () => {
  const conn = await mysql2.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  console.log("🔧 Creating database...");
  await conn.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || "aora_db"} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE ${process.env.DB_NAME || "aora_db"}`);

  console.log("📦 Creating tables...");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
      avatar VARCHAR(255) DEFAULT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      token_hash VARCHAR(255) NOT NULL,
      ip_address VARCHAR(45) DEFAULT NULL,
      user_agent TEXT DEFAULT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_token_hash (token_hash(191)),
      INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(120) NOT NULL UNIQUE,
      description TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS programs (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      slug VARCHAR(170) NOT NULL UNIQUE,
      description TEXT NOT NULL,
      duration VARCHAR(100) DEFAULT NULL,
      price DECIMAL(12,2) DEFAULT 0.00,
      image VARCHAR(255) DEFAULT NULL,
      status ENUM('aktif', 'tidak_aktif') NOT NULL DEFAULT 'aktif',
      category_id INT UNSIGNED DEFAULT NULL,
      created_by INT UNSIGNED NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS galleries (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      image_path VARCHAR(255) NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      caption TEXT DEFAULT NULL,
      category VARCHAR(100) DEFAULT NULL,
      program_id INT UNSIGNED DEFAULT NULL,
      uploaded_by INT UNSIGNED NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      slug VARCHAR(220) NOT NULL UNIQUE,
      excerpt VARCHAR(500) DEFAULT NULL,
      content LONGTEXT NOT NULL,
      cover_image VARCHAR(255) DEFAULT NULL,
      status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
      category_id INT UNSIGNED DEFAULT NULL,
      author_id INT UNSIGNED NOT NULL,
      views INT UNSIGNED DEFAULT 0,
      published_at DATETIME DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  console.log("🌱 Seeding categories...");
  await conn.query(`
    INSERT IGNORE INTO categories (name, slug, description) VALUES
    ('Seni & Budaya', 'seni-budaya', 'Program pelatihan seni tradisional dan budaya lokal'),
    ('Teknologi', 'teknologi', 'Program pelatihan komputer dan teknologi digital'),
    ('Kuliner', 'kuliner', 'Program pelatihan seni kuliner dan minuman'),
    ('Fashion', 'fashion', 'Program pelatihan desain dan mode'),
    ('Berita', 'berita', 'Berita dan informasi terkini Aora'),
    ('Tips & Tutorial', 'tips-tutorial', 'Tips dan tutorial seputar kegiatan LKP')
  `);

  console.log("👤 Seeding admin user...");
  const passwordHash = await bcrypt.hash("Admin@1234", 12);
  await conn.query(
    `INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    ["Administrator", "admin@aorawistara.id", passwordHash, "admin"]
  );

  console.log("\n✅ Seeder selesai!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 Email  : admin@aorawistara.id");
  console.log("🔑 Password: Admin@1234");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await conn.end();
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Seeder error:", err.message);
  process.exit(1);
});
