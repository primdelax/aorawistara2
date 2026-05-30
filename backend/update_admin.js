const bcrypt = require("bcryptjs");
const { pool } = require("./config/database");

async function run() {
  try {
    const passwordHash = await bcrypt.hash("admin123", 12);

    // Cek apakah ada admin
    const [users] = await pool.query("SELECT * FROM users WHERE role = 'admin'");

    if (users.length > 0) {
      // Update password admin yang ada
      await pool.query("UPDATE users SET password = ? WHERE role = 'admin'", [passwordHash]);
      console.log(`Password untuk admin email (${users[0].email}) berhasil diupdate menjadi: admin123`);
    } else {
      // Buat admin baru
      const defaultEmail = "admin@aorawistara.id";
      await pool.query(
        "INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)",
        ["Administrator", defaultEmail, passwordHash, "admin", true]
      );
      console.log(`Admin baru berhasil dibuat! Email: ${defaultEmail}, Password: admin123`);
    }
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  } finally {
    process.exit(0);
  }
}

run();
