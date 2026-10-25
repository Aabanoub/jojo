-- =========================================================================
-- BIBO & JOJO INTERACTIVE PORTAL ("Our Space")
-- Complete Supabase Database Schema, Storage Buckets, RLS & Initial Seed
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- -------------------------------------------------------------------------
-- 1. SITE SETTINGS & THEME CONFIGURATION (Single-row table, id = 1)
-- -------------------------------------------------------------------------
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  portal_title text not null default 'Our Space ✨ Bibo & Jojo',
  his_name text not null default 'Abanoub',
  his_nickname text not null default 'Bibo',
  her_name text not null default 'Jostena',
  her_nickname text not null default 'Jojo',
  relationship_start timestamptz not null default '2025-09-15T00:00:00+03:00',
  her_birthday date not null default '2011-06-30',
  master_password text not null default 'Aj1592025=1',
  -- Theme & Appearance Controls
  theme_preset text not null default 'dreamy-rose',
  bg_primary text not null default '#F8DCDA',
  bg_secondary text not null default '#F2C4C1',
  text_primary text not null default '#44292E',
  accent_color text not null default '#D48C96',
  card_glass_opacity numeric not null default 0.55,
  heading_font text not null default 'Playfair Display',
  body_font text not null default 'Inter',
  particle_effect text not null default 'sakura', -- 'sparkles' | 'sakura' | 'hearts' | 'stars' | 'none'
  -- Daily Sticky Note
  daily_note_title text not null default 'Daily Note from Bibo 💌 :',
  daily_note_content text not null default 'Good luck today my Jojo! Always remember how much Bibo loves you ❤️',
  daily_note_updated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- 2. EVENTS & TIME-LOCKED VAULTS TABLE
-- -------------------------------------------------------------------------
create table if not exists public.events_vault (
  id text primary key default uuid_generate_v4()::text,
  title text not null,
  subtitle text default 'Live Countdown Timer',
  target_date timestamptz not null,
  is_featured boolean not null default false,
  unlock_method text not null default 'scratch', -- 'scratch' | 'password' | 'instant'
  event_password text default 'Aj1592025=1',
  force_unlocked boolean not null default false,
  teaser_clue text default 'Something special from Bibo is waiting for you inside...',
  -- Vault Payload (Revealed when current_time >= target_date OR force_unlocked = true)
  vault_letter text default '',
  vault_media jsonb not null default '[]'::jsonb, -- Array of { id, type: 'image'|'audio'|'video', url, caption }
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- 3. "OPEN WHEN..." ENVELOPES TABLE
-- -------------------------------------------------------------------------
create table if not exists public.open_when_envelopes (
  id text primary key default uuid_generate_v4()::text,
  title text not null,
  emoji text not null default '💌',
  letter_content text not null,
  media_url text,
  audio_url text,
  requires_password boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- 4. MUSIC PLAYLIST TABLE
-- -------------------------------------------------------------------------
create table if not exists public.playlist_tracks (
  id text primary key default uuid_generate_v4()::text,
  title text not null,
  artist text not null default 'Bibo & Jojo',
  audio_url text not null,
  cover_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- 5. MEMORY LANE TIMELINE TABLE
-- -------------------------------------------------------------------------
create table if not exists public.memories (
  id text primary key default uuid_generate_v4()::text,
  title text not null,
  memory_date date not null,
  caption text,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- 6. SIGNALS / REACTIONS FROM JOJO TO BIBO
-- -------------------------------------------------------------------------
create table if not exists public.jojo_signals (
  id text primary key default uuid_generate_v4()::text,
  signal_type text not null default 'heart',
  message text not null default 'Jojo is thinking of Bibo ❤️',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- 7. UPLOADED ASSETS / PHOTO LIBRARY TABLE
-- -------------------------------------------------------------------------
create table if not exists public.uploaded_assets (
  id text primary key default uuid_generate_v4()::text,
  name text not null,
  url text not null unique,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------------------
alter table public.site_settings enable row level security;
alter table public.events_vault enable row level security;
alter table public.open_when_envelopes enable row level security;
alter table public.playlist_tracks enable row level security;
alter table public.memories enable row level security;
alter table public.jojo_signals enable row level security;
alter table public.uploaded_assets enable row level security;

-- Drop existing policies if re-running script to avoid duplicate policy errors
drop policy if exists "Allow public all on site_settings" on public.site_settings;
drop policy if exists "Allow public all on events_vault" on public.events_vault;
drop policy if exists "Allow public all on open_when_envelopes" on public.open_when_envelopes;
drop policy if exists "Allow public all on playlist_tracks" on public.playlist_tracks;
drop policy if exists "Allow public all on memories" on public.memories;
drop policy if exists "Allow public all on jojo_signals" on public.jojo_signals;
drop policy if exists "Allow public all on uploaded_assets" on public.uploaded_assets;

create policy "Allow public all on site_settings" on public.site_settings for all to public using (true) with check (true);
create policy "Allow public all on events_vault" on public.events_vault for all to public using (true) with check (true);
create policy "Allow public all on open_when_envelopes" on public.open_when_envelopes for all to public using (true) with check (true);
create policy "Allow public all on playlist_tracks" on public.playlist_tracks for all to public using (true) with check (true);
create policy "Allow public all on memories" on public.memories for all to public using (true) with check (true);
create policy "Allow public all on jojo_signals" on public.jojo_signals for all to public using (true) with check (true);
create policy "Allow public all on uploaded_assets" on public.uploaded_assets for all to public using (true) with check (true);

-- -------------------------------------------------------------------------
-- 9. STORAGE BUCKETS (Public buckets for media, music, memories)
-- -------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values 
  ('vault-media', 'vault-media', true),
  ('music', 'music', true),
  ('memories', 'memories', true)
on conflict (id) do update set public = true;

-- Storage policies for public upload, view, and manage
drop policy if exists "Allow public read from love app buckets" on storage.objects;
drop policy if exists "Allow public upload to love app buckets" on storage.objects;
drop policy if exists "Allow public update in love app buckets" on storage.objects;
drop policy if exists "Allow public delete in love app buckets" on storage.objects;

create policy "Allow public read from love app buckets" on storage.objects
  for select to public using (bucket_id in ('vault-media', 'music', 'memories'));

create policy "Allow public upload to love app buckets" on storage.objects
  for insert to public with check (bucket_id in ('vault-media', 'music', 'memories'));

create policy "Allow public update in love app buckets" on storage.objects
  for update to public using (bucket_id in ('vault-media', 'music', 'memories'));

create policy "Allow public delete in love app buckets" on storage.objects
  for delete to public using (bucket_id in ('vault-media', 'music', 'memories'));

-- -------------------------------------------------------------------------
-- 10. INITIAL SETTINGS ROW
-- -------------------------------------------------------------------------
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- -------------------------------------------------------------------------
-- 11. REALTIME PUBLICATION SETUP (Idempotent)
-- -------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'site_settings') then
    alter publication supabase_realtime add table public.site_settings;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'events_vault') then
    alter publication supabase_realtime add table public.events_vault;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'open_when_envelopes') then
    alter publication supabase_realtime add table public.open_when_envelopes;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'playlist_tracks') then
    alter publication supabase_realtime add table public.playlist_tracks;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'memories') then
    alter publication supabase_realtime add table public.memories;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'jojo_signals') then
    alter publication supabase_realtime add table public.jojo_signals;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'uploaded_assets') then
    alter publication supabase_realtime add table public.uploaded_assets;
  end if;
end $$;
