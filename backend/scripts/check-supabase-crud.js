require("dotenv").config();

const supabase = require("../services/supabaseService");

const run = async () => {
  if ((process.env.DATABASE_PROVIDER || "").toLowerCase() !== "supabase") {
    throw new Error("Set DATABASE_PROVIDER=supabase di backend/.env sebelum menjalankan pengecekan.");
  }

  await supabase.ensureReady();

  const stamp = Date.now();
  const settingKey = "codex_supabase_check";
  const slug = `codex-check-${stamp}`;

  await supabase.upsertByKey("settings", "setting_key", {
    setting_key: settingKey,
    setting_value: `ok-${stamp}`,
  });

  const setting = await supabase.findOne("settings", { setting_key: settingKey });
  if (!setting || setting.setting_value !== `ok-${stamp}`) {
    throw new Error("READ/UPSERT settings gagal.");
  }

  const created = await supabase.insert("categories", {
    name: `Codex Check ${stamp}`,
    slug,
    description: "Create test dari JavaScript backend.",
  });

  if (!created?.id) throw new Error("CREATE category gagal.");

  const updated = await supabase.update("categories", created.id, {
    description: "Update test dari JavaScript backend.",
  });

  if (updated.description !== "Update test dari JavaScript backend.") {
    throw new Error("UPDATE category gagal.");
  }

  await supabase.remove("categories", created.id);

  const deleted = await supabase.findById("categories", created.id);
  if (deleted) throw new Error("DELETE category gagal.");

  console.log("Supabase CRUD online berhasil: settings upsert/read, category create/update/delete.");
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
