-- ============================================================
-- SUPABASE RLS FIX untuk GitHub Pages (Anon Key)
-- ============================================================
-- Masalah: "Forbidden use of secret API key in browser"
-- Solusi: Gunakan ANON KEY + aktifkan RLS policies berikut
-- Cara: Supabase Dashboard ? SQL Editor ? New query ? paste ? Run
-- ============================================================

-- Aktifkan RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Hapus policies lama
DROP POLICY IF EXISTS "anon_read_programs" ON programs;
DROP POLICY IF EXISTS "anon_write_programs" ON programs;
DROP POLICY IF EXISTS "anon_read_schedules" ON program_schedules;
DROP POLICY IF EXISTS "anon_write_schedules" ON program_schedules;
DROP POLICY IF EXISTS "anon_read_galleries" ON galleries;
DROP POLICY IF EXISTS "anon_write_galleries" ON galleries;
DROP POLICY IF EXISTS "anon_read_settings" ON settings;
DROP POLICY IF EXISTS "anon_write_settings" ON settings;
DROP POLICY IF EXISTS "anon_read_homepage_photos" ON homepage_photos;
DROP POLICY IF EXISTS "anon_write_homepage_photos" ON homepage_photos;
DROP POLICY IF EXISTS "anon_read_featured_programs" ON featured_programs;
DROP POLICY IF EXISTS "anon_write_featured_programs" ON featured_programs;
DROP POLICY IF EXISTS "anon_read_testimonials" ON testimonials;
DROP POLICY IF EXISTS "anon_write_testimonials" ON testimonials;
DROP POLICY IF EXISTS "anon_read_users" ON users;
DROP POLICY IF EXISTS "anon_write_users" ON users;

-- Tabel: programs
CREATE POLICY "anon_read_programs" ON programs FOR SELECT TO anon USING (true);
CREATE POLICY "anon_write_programs" ON programs FOR ALL TO anon USING (true) WITH CHECK (true);

-- Tabel: program_schedules
CREATE POLICY "anon_read_schedules" ON program_schedules FOR SELECT TO anon USING (true);
CREATE POLICY "anon_write_schedules" ON program_schedules FOR ALL TO anon USING (true) WITH CHECK (true);

-- Tabel: galleries
CREATE POLICY "anon_read_galleries" ON galleries FOR SELECT TO anon USING (true);
CREATE POLICY "anon_write_galleries" ON galleries FOR ALL TO anon USING (true) WITH CHECK (true);

-- Tabel: settings
CREATE POLICY "anon_read_settings" ON settings FOR SELECT TO anon USING (true);
CREATE POLICY "anon_write_settings" ON settings FOR ALL TO anon USING (true) WITH CHECK (true);

-- Tabel: homepage_photos
CREATE POLICY "anon_read_homepage_photos" ON homepage_photos FOR SELECT TO anon USING (true);
CREATE POLICY "anon_write_homepage_photos" ON homepage_photos FOR ALL TO anon USING (true) WITH CHECK (true);

-- Tabel: featured_programs
CREATE POLICY "anon_read_featured_programs" ON featured_programs FOR SELECT TO anon USING (true);
CREATE POLICY "anon_write_featured_programs" ON featured_programs FOR ALL TO anon USING (true) WITH CHECK (true);

-- Tabel: testimonials
CREATE POLICY "anon_read_testimonials" ON testimonials FOR SELECT TO anon USING (true);
CREATE POLICY "anon_write_testimonials" ON testimonials FOR ALL TO anon USING (true) WITH CHECK (true);

-- Tabel: users
CREATE POLICY "anon_read_users" ON users FOR SELECT TO anon USING (true);
CREATE POLICY "anon_write_users" ON users FOR ALL TO anon USING (true) WITH CHECK (true);

-- Storage policies
DROP POLICY IF EXISTS "anon_upload_storage" ON storage.objects;
DROP POLICY IF EXISTS "anon_read_storage" ON storage.objects;
DROP POLICY IF EXISTS "anon_delete_storage" ON storage.objects;
CREATE POLICY "anon_read_storage" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'aora-uploads');
CREATE POLICY "anon_upload_storage" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'aora-uploads');
CREATE POLICY "anon_delete_storage" ON storage.objects FOR DELETE TO anon USING (bucket_id = 'aora-uploads');

-- Pastikan bucket public
UPDATE storage.buckets SET public = true WHERE id = 'aora-uploads';
