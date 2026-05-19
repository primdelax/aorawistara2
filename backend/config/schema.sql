-- ================================================
-- AORA WISTARA DATABASE SCHEMA
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
  status ENUM('aktif', 'tidak_aktif') NOT NULL DEFAULT 'aktif',
  category_id INT UNSIGNED DEFAULT NULL,
  created_by INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_slug (slug)
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
('Berita', 'berita', 'Berita dan informasi terkini AORA Wistara'),
('Tips & Tutorial', 'tips-tutorial', 'Tips dan tutorial seputar kegiatan LKP');

-- Admin default (password: Admin@1234)
-- Hash: $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgKSQoMnDIbJFHsY7/lKbm
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Administrator', 'admin@aorawistara.id', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgKSQoMnDIbJFHsY7/lKbm', 'admin');
