const provider = (process.env.DATABASE_PROVIDER || process.env.DB_PROVIDER || "mysql").toLowerCase();

const isSupabase = provider === "supabase";

module.exports = { provider, isSupabase };
