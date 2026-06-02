/**
 * Migration: Add is_featured column to programs table
 * Run once: node add_featured_column.js
 */
require("dotenv").config();
const supabase = require("./services/supabaseService");

async function main() {
  const url = process.env.SUPABASE_URL.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Execute SQL via Supabase REST SQL endpoint
  const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: "ALTER TABLE programs ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;"
    }),
  });

  if (!res.ok) {
    // Try alternative: direct PATCH to add column via Supabase SQL
    // Supabase doesn't expose direct SQL via REST - need to use pg endpoint
    console.log("RPC not available, trying direct approach...");
    
    // Just insert a program with is_featured to see if column exists
    const test = await supabase.list("programs", { limit: 1, select: "id,is_featured" });
    if (test.length > 0 && "is_featured" in test[0]) {
      console.log("✅ Column is_featured already exists!");
      return;
    }
    
    console.log("❌ Column does not exist. Please run this SQL in Supabase SQL Editor:");
    console.log("ALTER TABLE programs ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;");
    return;
  }

  console.log("✅ Migration done!");
}

main().catch(console.error);
