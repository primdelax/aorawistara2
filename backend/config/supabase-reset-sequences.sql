-- Run this in Supabase SQL Editor after importing old MySQL data with scripts/migrate-mysql-to-supabase.js.
-- It prevents duplicate ID errors when the admin creates new data after migration.

select setval(pg_get_serial_sequence('users', 'id'), coalesce((select max(id) from users), 1), true);
select setval(pg_get_serial_sequence('sessions', 'id'), coalesce((select max(id) from sessions), 1), true);
select setval(pg_get_serial_sequence('settings', 'id'), coalesce((select max(id) from settings), 1), true);
select setval(pg_get_serial_sequence('categories', 'id'), coalesce((select max(id) from categories), 1), true);
select setval(pg_get_serial_sequence('programs', 'id'), coalesce((select max(id) from programs), 1), true);
select setval(pg_get_serial_sequence('program_schedules', 'id'), coalesce((select max(id) from program_schedules), 1), true);
select setval(pg_get_serial_sequence('homepage_photos', 'id'), coalesce((select max(id) from homepage_photos), 1), true);
select setval(pg_get_serial_sequence('featured_programs', 'id'), coalesce((select max(id) from featured_programs), 1), true);
select setval(pg_get_serial_sequence('testimonials', 'id'), coalesce((select max(id) from testimonials), 1), true);
select setval(pg_get_serial_sequence('galleries', 'id'), coalesce((select max(id) from galleries), 1), true);
select setval(pg_get_serial_sequence('articles', 'id'), coalesce((select max(id) from articles), 1), true);
