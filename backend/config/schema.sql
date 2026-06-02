-- ================================================
-- AORA DATABASE SCHEMA
-- Database: aora_db
-- ================================================

CREATE DATABASE IF NOT EXISTS aora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aora_db;

-- ================================================
-- TABLE: users
-- ================================================
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(32) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  avatar VARCHAR(255) DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================
-- TABLE: sessions
-- ================================================
CREATE TABLE IF NOT EXISTS sessions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token_hash (token_hash),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================
-- TABLE: settings
-- ================================================
CREATE TABLE IF NOT EXISTS settings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================
-- TABLE: categories
-- ================================================
CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================
-- TABLE: programs
-- ================================================
CREATE TABLE IF NOT EXISTS programs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  slug VARCHAR(170) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  duration VARCHAR(100) DEFAULT NULL,
  price DECIMAL(12,2) DEFAULT 0.00,
  image VARCHAR(255) DEFAULT NULL,
  program_type ENUM('intensif', 'short_course', 'reguler') NOT NULL DEFAULT 'reguler',
  status ENUM('aktif', 'tidak_aktif') NOT NULL DEFAULT 'aktif',
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  category_id INT UNSIGNED DEFAULT NULL,
  created_by INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_program_type (program_type),
  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================
-- TABLE: program_schedules
-- ================================================
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================
-- TABLE: homepage_photos
-- ================================================
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================
-- TABLE: featured_programs
-- ================================================
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================
-- TABLE: testimonials
-- ================================================
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================
-- TABLE: galleries
-- ================================================
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
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_program_id (program_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================
-- TABLE: articles
-- ================================================
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
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_slug (slug),
  INDEX idx_author (author_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================
-- DEFAULT DATA SEEDER
-- ================================================

-- Categories
INSERT IGNORE INTO categories (name, slug, description) VALUES
('Seni & Budaya', 'seni-budaya', 'Program pelatihan seni tradisional dan budaya lokal'),
('Teknologi', 'teknologi', 'Program pelatihan komputer dan teknologi digital'),
('Kuliner', 'kuliner', 'Program pelatihan seni kuliner dan minuman'),
('Fashion', 'fashion', 'Program pelatihan desain dan mode'),
('Berita', 'berita', 'Berita dan informasi terkini Aora'),
('Tips & Tutorial', 'tips-tutorial', 'Tips dan tutorial seputar kegiatan LKP');

-- Admin default (username: adminaora, password: admin123)
INSERT IGNORE INTO users (name, username, email, password, role) VALUES
('Administrator', 'adminaora', 'adminaora@aora.local', '$2a$12$ambR/Yrqs5m8uHoDGJbSBOtNP7Fb1yYgHZuFVeAL8wk8KALt9GidG', 'admin');

-- Settings
INSERT IGNORE INTO settings (setting_key, setting_value) VALUES
('site_name', 'Aora'),
('tagline', 'Lembaga Kursus'),
('address', 'Jl Tambak Medokan Ayu 6-C/56B'),
('phone', '0822 2591 6619 (pak hari)'),
('email', 'info@aora.id'),
('instagram', 'https://instagram.com/aora'),
('facebook', 'https://facebook.com/aora'),
('youtube', 'https://youtube.com/@aora'),
('tiktok', 'https://tiktok.com/@aora'),
('maps_url', 'https://share.google/SVdjuvR7RWXbMcyMe'),
('operational_hours', 'Senin-Jumat 10.00-17.00'),
('logo_url', ''),
('about_text', 'Aora adalah Lembaga Kursus yang membentuk individu berdaya saing melalui kombinasi lifeskill praktis dan ekspresi seni.');

-- Homepage photos
INSERT IGNORE INTO homepage_photos (id, title, image_path, sort_order) VALUES
(1, 'Tari Tradisional', '/gallery/tari1.jpg', 1),
(2, 'Kelas Tari', '/gallery/tari2.png', 2),
(3, 'Membatik', '/gallery/batik1.jpg', 3),
(4, 'Batik Kreatif', '/gallery/batik2.jpg', 4),
(5, 'Melukis', '/gallery/melukis1.jpg', 5),
(6, 'Kelas Melukis', '/gallery/melukis2.png', 6);

-- Featured programs
INSERT IGNORE INTO featured_programs (id, title, description, image_path, accent, sort_order) VALUES
(1, 'Pelatihan Barista', 'Latte art, espresso, manual brew. Standar profesional kafe modern.', 'https://images.unsplash.com/photo-1637029567716-6c6775c341e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 0, 1),
(2, 'Seni Menari', 'Tradisional dan kontemporer. Bangun ekspresi dan percaya diri di panggung.', 'https://images.unsplash.com/photo-1666902715814-691194b2f45f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 1, 2),
(3, 'Batik', 'Membatik dari pola hingga pewarnaan. Lestarikan warisan budaya.', 'https://images.unsplash.com/photo-1604973104381-870c92f10343?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 0, 3);

-- Testimonials
INSERT IGNORE INTO testimonials (id, alumni_name, profile, comment, image_path, sort_order) VALUES
(1, 'Nadia Putri', 'Alumni Program Membatik', 'Belajar di Aora membuat saya lebih percaya diri berkarya. Materinya praktis dan pengajarnya sabar.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=faces&fit=crop&fm=jpg&q=80&w=400&h=400', 1),
(2, 'Raka Pratama', 'Alumni Fotografi', 'Saya jadi paham cara mengambil foto yang bercerita, bukan hanya sekadar menekan tombol kamera.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=faces&fit=crop&fm=jpg&q=80&w=400&h=400', 2),
(3, 'Salsa Aulia', 'Alumni Seni Tari', 'Lingkungannya nyaman dan mendukung. Saya merasa punya ruang untuk berkembang dan tampil lebih berani.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=faces&fit=crop&fm=jpg&q=80&w=400&h=400', 3),
(4, 'Dimas Arya', 'Alumni Barista', 'Dari nol sampai bisa membuat kopi dengan standar yang rapi. Ilmunya langsung bisa dipakai.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=faces&fit=crop&fm=jpg&q=80&w=400&h=400', 4),
(5, 'Mira Lestari', 'Alumni Lifeskill', 'Programnya membantu saya menemukan potensi diri dan punya bekal baru untuk mulai usaha kecil.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=faces&fit=crop&fm=jpg&q=80&w=400&h=400', 5);
