-- Aora online database schema for Supabase
-- Run this once in Supabase SQL Editor, then set DATABASE_PROVIDER=supabase in backend/.env.

create table if not exists users (
  id bigserial primary key,
  name varchar(100) not null,
  username varchar(32) not null unique,
  email varchar(150) not null unique,
  password varchar(255) not null,
  role varchar(20) not null default 'user' check (role in ('admin', 'user')),
  avatar text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sessions (
  id bigserial primary key,
  user_id bigint references users(id) on delete cascade,
  token_hash varchar(255) not null,
  ip_address varchar(45),
  user_agent text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists settings (
  id bigserial primary key,
  setting_key varchar(100) not null unique,
  setting_value text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id bigserial primary key,
  name varchar(100) not null,
  slug varchar(120) not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists programs (
  id bigserial primary key,
  title varchar(150) not null,
  slug varchar(170) not null unique,
  description text not null,
  duration varchar(100),
  price numeric(12,2) default 0,
  image text,
  program_type varchar(30) not null default 'reguler' check (program_type in ('intensif', 'short_course', 'reguler')),
  status varchar(30) not null default 'aktif' check (status in ('aktif', 'tidak_aktif')),
  is_featured boolean not null default false,
  category_id bigint references categories(id) on delete set null,
  created_by bigint references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists program_schedules (
  id bigserial primary key,
  program_id bigint not null references programs(id) on delete cascade,
  day varchar(50) not null,
  time varchar(100) not null,
  note varchar(255),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists homepage_photos (
  id bigserial primary key,
  title varchar(150) not null,
  image_path text not null,
  status varchar(30) not null default 'aktif' check (status in ('aktif', 'tidak_aktif')),
  sort_order int not null default 0,
  uploaded_by bigint references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists featured_programs (
  id bigserial primary key,
  title varchar(150) not null,
  description varchar(500) not null,
  image_path text not null,
  accent boolean not null default false,
  status varchar(30) not null default 'aktif' check (status in ('aktif', 'tidak_aktif')),
  sort_order int not null default 0,
  created_by bigint references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists testimonials (
  id bigserial primary key,
  alumni_name varchar(120) not null,
  profile varchar(150) not null,
  comment varchar(500) not null,
  image_path text not null,
  status varchar(30) not null default 'aktif' check (status in ('aktif', 'tidak_aktif')),
  sort_order int not null default 0,
  created_by bigint references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists galleries (
  id bigserial primary key,
  title varchar(150) not null,
  image_path text not null,
  image_url text not null,
  caption text,
  category varchar(100),
  program_id bigint references programs(id) on delete set null,
  uploaded_by bigint references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists articles (
  id bigserial primary key,
  title varchar(200) not null,
  slug varchar(220) not null unique,
  excerpt varchar(500),
  content text not null,
  cover_image text,
  status varchar(30) not null default 'draft' check (status in ('draft', 'published')),
  category_id bigint references categories(id) on delete set null,
  author_id bigint references users(id) on delete set null,
  views int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('aora-uploads', 'aora-uploads', true, 5242880, array['image/jpeg','image/jpg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true;

insert into users (id, name, username, email, password, role, is_active)
values (1, 'Administrator', 'adminaora', 'adminaora@aora.local', '$2a$12$ambR/Yrqs5m8uHoDGJbSBOtNP7Fb1yYgHZuFVeAL8wk8KALt9GidG', 'admin', true)
on conflict (username) do update
set name = excluded.name,
    email = excluded.email,
    password = excluded.password,
    role = excluded.role,
    is_active = excluded.is_active;

insert into categories (id, name, slug, description) values
(1, 'Seni & Budaya', 'seni-budaya', 'Program pelatihan seni tradisional dan budaya lokal'),
(2, 'Teknologi', 'teknologi', 'Program pelatihan komputer dan teknologi digital'),
(3, 'Kuliner', 'kuliner', 'Program pelatihan seni kuliner dan minuman'),
(4, 'Fashion', 'fashion', 'Program pelatihan desain dan mode')
on conflict (slug) do nothing;

insert into settings (setting_key, setting_value) values
('site_name', 'Aora'),
('tagline', 'Lembaga Kursus'),
('address', 'Jl Tambak Medokan Ayu 6-C/56B'),
('phone', '0822 2591 6619 (pak hari)'),
('email', 'info@aora.id'),
('instagram', 'https://instagram.com/aora'),
('facebook', 'https://facebook.com/aora'),
('youtube', 'https://youtube.com/@aora'),
('tiktok', 'https://tiktok.com/@aora'),
('maps_url', 'https://share.google/SVdjuvR7RWXbMcyMe'),
('operational_hours', 'Senin-Jumat 10.00-17.00'),
('logo_url', ''),
('about_text', 'Aora adalah Lembaga Kursus yang membentuk individu berdaya saing melalui kombinasi lifeskill praktis dan ekspresi seni.')
on conflict (setting_key) do nothing;

select setval(pg_get_serial_sequence('users', 'id'), coalesce((select max(id) from users), 1), true);
select setval(pg_get_serial_sequence('settings', 'id'), coalesce((select max(id) from settings), 1), true);
select setval(pg_get_serial_sequence('categories', 'id'), coalesce((select max(id) from categories), 1), true);
select setval(pg_get_serial_sequence('programs', 'id'), coalesce((select max(id) from programs), 1), true);
select setval(pg_get_serial_sequence('program_schedules', 'id'), coalesce((select max(id) from program_schedules), 1), true);
select setval(pg_get_serial_sequence('homepage_photos', 'id'), coalesce((select max(id) from homepage_photos), 1), true);
select setval(pg_get_serial_sequence('featured_programs', 'id'), coalesce((select max(id) from featured_programs), 1), true);
select setval(pg_get_serial_sequence('testimonials', 'id'), coalesce((select max(id) from testimonials), 1), true);
select setval(pg_get_serial_sequence('galleries', 'id'), coalesce((select max(id) from galleries), 1), true);
select setval(pg_get_serial_sequence('articles', 'id'), coalesce((select max(id) from articles), 1), true);
