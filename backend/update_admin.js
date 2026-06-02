const bcrypt = require("bcryptjs");
const { pool } = require("./config/database");

async function run() {
  try {
    const passwordHash = await bcrypt.hash("admin123", 12);

    // Cek apakah ada admin
    const [users] = await pool.query("SELECT * FROM users WHERE role = 'admin'");

    if (users.length > 0) {
      // Update password admin yang ada
      await pool.query("UPDATE users SET name = ?, username = ?, email = ?, password = ?, role = ?, is_active = ? WHERE id = ?", [
        "Administrator",
        "adminaora",
        "adminaora@aora.local",
        passwordHash,
        "admin",
        true,
        users[0].id,
      ]);
      console.log("Username admin berhasil diupdate menjadi: adminaora, password: admin123");
    } else {
      // Buat admin baru
      await pool.query(
        "INSERT INTO users (name, username, email, password, role, is_active) VALUES (?, ?, ?, ?, ?, ?)",
        ["Administrator", "adminaora", "adminaora@aora.local", passwordHash, "admin", true]
      );
      console.log("Admin baru berhasil dibuat! Username: adminaora, Password: admin123");
    }
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  } finally {
    process.exit(0);
  }
}

run();
