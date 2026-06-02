require("dotenv").config();

const path = require("path");
const fs = require("fs");
const { pool } = require("../config/database");
const supabase = require("../services/supabaseService");

const imageColumns = {
  programs: [{ column: "image", folder: "programs" }],
  galleries: [
    { column: "image_path", folder: "gallery" },
    { column: "image_url", folder: "gallery", mirrorOf: "image_path" },
  ],
  articles: [{ column: "cover_image", folder: "articles" }],
  homepage_photos: [{ column: "image_path", folder: "homepage" }],
  featured_programs: [{ column: "image_path", folder: "featured" }],
  testimonials: [{ column: "image_path", folder: "testimonials" }],
};

const tables = [
  "users",
  "categories",
  "programs",
  "program_schedules",
  "settings",
  "galleries",
  "articles",
  "homepage_photos",
  "featured_programs",
  "testimonials",
];

const contentTypeFor = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
};

const maybeUploadLocalFile = async (value, folder) => {
  if (!value || value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) return value;
  if (!value.startsWith("uploads/")) return value;

  const localPath = path.join(__dirname, "..", value);
  if (!fs.existsSync(localPath)) return value;

  return supabase.uploadFile({
    path: localPath,
    originalname: path.basename(localPath),
    mimetype: contentTypeFor(localPath),
    keepLocal: true,
  }, folder);
};

const normalizeRow = async (table, row) => {
  const normalized = { ...row };

  if (normalized.created_at instanceof Date) normalized.created_at = normalized.created_at.toISOString();
  if (normalized.updated_at instanceof Date) normalized.updated_at = normalized.updated_at.toISOString();
  if (normalized.published_at instanceof Date) normalized.published_at = normalized.published_at.toISOString();
  if (normalized.expires_at instanceof Date) normalized.expires_at = normalized.expires_at.toISOString();

  for (const spec of imageColumns[table] || []) {
    if (spec.mirrorOf) {
      normalized[spec.column] = normalized[spec.mirrorOf];
    } else {
      normalized[spec.column] = await maybeUploadLocalFile(normalized[spec.column], spec.folder);
    }
  }

  return normalized;
};

const run = async () => {
  if ((process.env.DATABASE_PROVIDER || "").toLowerCase() !== "supabase") {
    throw new Error("Set DATABASE_PROVIDER=supabase di backend/.env sebelum menjalankan migrasi.");
  }

  for (const table of tables) {
    let rows = [];
    try {
      [rows] = await pool.query(`SELECT * FROM ${table}`);
    } catch (error) {
      if (error.code === "ER_NO_SUCH_TABLE") {
        console.log(`Skip ${table}: table tidak ada di MySQL lokal.`);
        continue;
      }
      throw error;
    }

    if (rows.length === 0) {
      console.log(`Skip ${table}: kosong.`);
      continue;
    }

    const payload = [];
    for (const row of rows) payload.push(await normalizeRow(table, row));

    const conflictKey = table === "settings" ? "setting_key" : "id";
    await supabase.upsertByKey(table, conflictKey, payload);
    console.log(`Migrated ${payload.length} rows: ${table}`);
  }

  await pool.end();
  console.log("Migrasi MySQL lokal ke Supabase selesai.");
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
