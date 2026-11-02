-- Huellas de Esperanza - Esquema inicial para Supabase/PostgreSQL
-- Ejecutar completo desde: Supabase Dashboard > SQL Editor > New query

begin;

-- Extensiones usadas para correo sin distinción de mayúsculas y hash bcrypt.
create extension if not exists citext with schema extensions;
create extension if not exists pgcrypto with schema extensions;

do $$
begin
  create type public.user_role as enum ('Adoptante', 'Admin');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null check (char_length(trim(name)) >= 2),
  email extensions.citext not null unique,
  password_hash text not null check (char_length(password_hash) >= 50),
  role public.user_role not null default 'Adoptante',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  name varchar(60) not null check (char_length(trim(name)) >= 1),
  species varchar(10) not null check (species in ('Perro', 'Gato')),
  approximate_age varchar(40) not null,
  description text not null,
  image_url text,
  status varchar(20) not null default 'Disponible'
    check (status in ('Disponible', 'En proceso', 'Adoptado')),
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.adoptions (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete restrict,
  pet_name varchar(60) not null,
  full_name varchar(100) not null,
  email extensions.citext not null,
  phone varchar(30) not null,
  city varchar(80) not null,
  occupation varchar(100) not null,
  housing_type varchar(50) not null,
  pet_experience text not null,
  adoption_reason text not null,
  status varchar(20) not null default 'Pendiente'
    check (status in ('Pendiente', 'En revisión', 'Aprobada', 'Rechazada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_role on public.users (role);
create index if not exists idx_pets_species_status on public.pets (species, status);
create index if not exists idx_pets_last_activity on public.pets (last_activity_at);
create index if not exists idx_adoptions_pet on public.adoptions (pet_id);
create index if not exists idx_adoptions_status on public.adoptions (status, created_at desc);

-- Mantiene updated_at sincronizado automáticamente.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists pets_set_updated_at on public.pets;
create trigger pets_set_updated_at
before update on public.pets
for each row execute function public.set_updated_at();

drop trigger if exists adoptions_set_updated_at on public.adoptions;
create trigger adoptions_set_updated_at
before update on public.adoptions
for each row execute function public.set_updated_at();

-- RLS: nunca se exponen usuarios ni escrituras administrativas al navegador.
alter table public.users enable row level security;
alter table public.pets enable row level security;
alter table public.adoptions enable row level security;

revoke all on table public.users from anon, authenticated;
revoke all on table public.pets from anon, authenticated;
revoke all on table public.adoptions from anon, authenticated;
grant select on table public.pets to anon, authenticated;

drop policy if exists "Catalogo publico de mascotas" on public.pets;
create policy "Catalogo publico de mascotas"
on public.pets
for select
to anon, authenticated
using (status = 'Disponible');

commit;

-- ================================================================
-- CREAR EL PRIMER ADMINISTRADOR
-- Reemplaza los tres valores y ejecuta este INSERT por separado.
-- La contraseña se convierte a bcrypt dentro de PostgreSQL.
-- ================================================================
-- insert into public.users (name, email, password_hash, role)
-- values (
--   'Nombre del administrador',
--   'admin@correo.com',
--   extensions.crypt('CAMBIA_ESTA_CONTRASENA', extensions.gen_salt('bf', 12)),
--   'Admin'
-- );

-- ================================================================
-- EJEMPLOS OPCIONALES DE MASCOTAS
-- ================================================================
-- insert into public.pets
--   (name, species, approximate_age, description, image_url)
-- values
--   ('Luna', 'Perro', '2 años', 'Perrita juguetona y sociable.',
--    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800'),
--   ('Simba', 'Gato', '1 año', 'Gato cariñoso y tranquilo.',
--    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800');

-- ================================================================
-- CONSULTAS DE COMPROBACIÓN (no muestran contraseñas)
-- ================================================================
-- select id, name, email, role, active, created_at from public.users;
-- select id, name, species, approximate_age, status from public.pets;

-- Ejemplo técnico para validar una contraseña desde SQL:
-- select id, email, role
-- from public.users
-- where email = 'admin@correo.com'
--   and password_hash = extensions.crypt('CONTRASENA_A_VALIDAR', password_hash);
