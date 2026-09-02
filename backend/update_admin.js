require("dotenv").config();
const bcrypt = require("bcryptjs");
const { isSupabase } = require("./config/dataProvider");
const supabase = require("./services/supabaseService");
const { pool } = require("./config/database");

async function run() {
  try {
    const passwordHash = await bcrypt.hash("admin123", 12);

    if (isSupabase) {
      console.log("Menggunakan database provider: Supabase");
      const existing = await supabase.findOne("users", { username: "adminaora" });
      if (existing) {
        await supabase.update("users", existing.id, {
          name: "Administrator",
          email: "adminaora@aora.local",
          password: passwordHash,
          role: "admin",
          is_active: true,
        });
        console.log("✅ User 'adminaora' berhasil diupdate! Password: admin123");
      } else {
        await supabase.insert("users", {
          name: "Administrator",
          username: "adminaora",
          email: "adminaora@aora.local",
          password: passwordHash,
          role: "admin",
          is_active: true,
        });
        console.log("✅ Admin baru 'adminaora' berhasil dibuat! Password: admin123");
      }

      // Pastikan primodelax juga aktif dengan password primo123
      const primoHash = await bcrypt.hash("primo123", 12);
      const primo = await supabase.findOne("users", { username: "primodelax" });
      if (primo) {
        await supabase.update("users", primo.id, {
          password: primoHash,
          role: "admin",
          is_active: true,
        });
        console.log("✅ User 'primodelax' siap digunakan! Password: primo123");
      }
      return;
    }

    // MySQL mode
    const [users] = await pool.query("SELECT * FROM users WHERE username = 'adminaora'");
    if (users.length > 0) {
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
