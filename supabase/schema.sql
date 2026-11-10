-- =====================================================================
-- Bore & Barrel — Supabase schema (jalankan di Supabase > SQL Editor)
-- Database milik SENDIRI (bukan shared API modul).
-- =====================================================================

create table if not exists products (
  id          bigint generated always as identity primary key,
  name        text not null,
  type        text default 'Pistol',
  caliber     text default '9mm',
  price       numeric default 0,
  description text default '',
  specs       text[] default '{}',
  image_url   text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table if not exists favorites (
  id         bigint generated always as identity primary key,
  product_id bigint references products(id) on delete cascade,
  user_id    uuid not null,
  created_at timestamptz default now(),
  unique (product_id, user_id)
);

create table if not exists reviews (
  id         bigint generated always as identity primary key,
  product_id bigint references products(id) on delete cascade,
  user_id    uuid not null,
  rating     int check (rating between 1 and 5),
  comment    text default '',
  created_at timestamptz default now()
);

-- Row Level Security: terbuka untuk anon (cukup untuk praktikum, tanpa login)
alter table products  enable row level security;
alter table favorites enable row level security;
alter table reviews   enable row level security;

drop policy if exists "open products"  on products;
drop policy if exists "open favorites" on favorites;
drop policy if exists "open reviews"   on reviews;
create policy "open products"  on products  for all using (true) with check (true);
create policy "open favorites" on favorites for all using (true) with check (true);
create policy "open reviews"   on reviews   for all using (true) with check (true);

-- Data contoh (20 baris) supaya paginasi terlihat: 8 item/halaman => 3 halaman
insert into products (name, type, caliber, price, description, specs, image_url)
select
  'Sample Piece ' || g,
  (array['Pistol','Rifle','Shotgun','Submachine Gun'])[1 + g % 4],
  (array['9mm','5.56mm','12 Gauge','.45 ACP'])[1 + g % 4],
  400 + g * 25,
  'Sample catalog entry number ' || g || ' for pagination demo.',
  array['Frame: Polymer', 'Capacity: 15 rounds'],
  '/guns/' || (array['pistol','rifle','shotgun','pistol'])[1 + g % 4] || '.svg'
from generate_series(1, 20) g;

-- (Opsional) Storage: buat bucket PUBLIC bernama "guns" lewat dashboard
-- Storage > New bucket > name: guns > Public. Jika dilewati, upload gambar
-- otomatis fallback ke base64.
