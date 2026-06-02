/**
 * Script: Update password user di Supabase agar bisa login
 * Jalankan: node update_supabase_user.js
 *
 * Script ini akan:
 * 1. Mencari user dengan username "primodelax"
 * 2. Hash password "primo123" dengan bcrypt
 * 3. Update password di Supabase
 */

require("dotenv").config();
const bcrypt = require("bcryptjs");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env");
  process.exit(1);
}

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

async function supabaseRequest(endpoint, options = {}) {
  const url = `${SUPABASE_URL.replace(/\/$/, "")}${endpoint}`;
  const res = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

async function updateUserPassword(username, plainPassword) {
  console.log(`\n🔍 Mencari user: ${username}`);

  // Cari user
  const users = await supabaseRequest(
    `/rest/v1/users?username=eq.${encodeURIComponent(username)}&select=id,name,username,email,role,is_active`
  );

  if (!users || users.length === 0) {
    console.log(`⚠️  User "${username}" tidak ditemukan. Membuat user baru...`);

    const passwordHash = await bcrypt.hash(plainPassword, 12);
    const newUser = await supabaseRequest("/rest/v1/users", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        name: username,
        username: username,
        email: `${username}@aora.local`,
        password: passwordHash,
        role: "admin",
        is_active: true,
        avatar: null,
      }),
    });

    console.log(`✅ User baru berhasil dibuat!`);
    console.log(`   Username : ${username}`);
    console.log(`   Password : ${plainPassword}`);
    console.log(`   Role     : admin`);
    return;
  }

  const user = users[0];
  console.log(`✅ User ditemukan: id=${user.id}, role=${user.role}, active=${user.is_active}`);

  // Hash password baru
  const passwordHash = await bcrypt.hash(plainPassword, 12);
  console.log(`🔐 Hashing password "${plainPassword}"...`);

  // Update password
  await supabaseRequest(`/rest/v1/users?id=eq.${user.id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ password: passwordHash }),
  });

  console.log(`\n🎉 Password berhasil diupdate!`);
  console.log(`   Username : ${username}`);
  console.log(`   Password : ${plainPassword}`);
  console.log(`   Role     : ${user.role}`);
  console.log(`   Active   : ${user.is_active}`);
}

async function main() {
  console.log("=================================================");
  console.log("  Supabase User Password Updater");
  console.log("=================================================");

  // Update user primodelax
  await updateUserPassword("primodelax", "primo123");

  console.log("\n✅ Selesai! Sekarang bisa login dengan:");
  console.log("   Username : primodelax");
  console.log("   Password : primo123");
  console.log("=================================================\n");
}

main().catch((err) => {
  console.error("❌ Error:", err.message || err);
  process.exit(1);
});
