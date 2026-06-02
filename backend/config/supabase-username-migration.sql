-- Run once in Supabase SQL Editor after the old schema is already installed.
-- Default admin login after this migration:
-- username: adminaora
-- password: admin123

alter table users add column if not exists username varchar(32);

update users
set username = lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9]', '', 'g'))
where username is null or username = '';

update users
set username = 'adminaora',
    email = 'adminaora@aora.local',
    password = '$2a$12$ambR/Yrqs5m8uHoDGJbSBOtNP7Fb1yYgHZuFVeAL8wk8KALt9GidG',
    name = 'Administrator',
    role = 'admin',
    is_active = true
where id = (
  select id from users
  where role = 'admin'
  order by id asc
  limit 1
);

insert into users (name, username, email, password, role, is_active)
select 'Administrator', 'adminaora', 'adminaora@aora.local', '$2a$12$ambR/Yrqs5m8uHoDGJbSBOtNP7Fb1yYgHZuFVeAL8wk8KALt9GidG', 'admin', true
where not exists (select 1 from users where username = 'adminaora');

update users
set username = 'user' || id
where username is null or username = '';

alter table users alter column username set not null;
create unique index if not exists users_username_key on users(username);

select setval(pg_get_serial_sequence('users', 'id'), coalesce((select max(id) from users), 1), true);
