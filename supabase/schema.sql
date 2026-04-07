-- DaysWeMet Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (mirrors auth.users for RLS joins)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  display_name text,
  couple_id uuid,
  created_at timestamptz default now()
);

-- Couples table
create table public.couples (
  id uuid default uuid_generate_v4() primary key,
  user1_id uuid references auth.users(id) on delete set null,
  user2_id uuid references auth.users(id) on delete set null,
  invite_code text unique not null,
  connected_at timestamptz,
  created_at timestamptz default now()
);

-- Photos table
create table public.photos (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  capture_date date not null,
  storage_path text not null,
  thumbnail_path text not null,
  original_filename text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Memos table (one per couple + date)
create table public.memos (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  memo_date date not null,
  content text not null default '',
  updated_by uuid references auth.users(id),
  updated_at timestamptz default now(),
  unique(couple_id, memo_date)
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_photos_couple_date on public.photos(couple_id, capture_date);
create index idx_photos_couple_id on public.photos(couple_id);
create index idx_couples_invite_code on public.couples(invite_code);
create index idx_profiles_couple_id on public.profiles(couple_id);
create index idx_memos_couple_date on public.memos(couple_id, memo_date);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.photos enable row level security;
alter table public.memos enable row level security;

-- PROFILES
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- COUPLES
create policy "Couple members can view their couple"
  on public.couples for select
  using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Anyone can view unconnected couple by invite code"
  on public.couples for select
  using (user2_id is null and invite_code is not null);

create policy "Users can create a couple"
  on public.couples for insert
  with check (auth.uid() = user1_id);

create policy "Couple members can update their couple"
  on public.couples for update
  using (auth.uid() = user1_id or auth.uid() = user2_id);

-- PHOTOS
create policy "Couple members can view photos"
  on public.photos for select
  using (
    couple_id in (
      select id from public.couples
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

create policy "Couple members can insert photos"
  on public.photos for insert
  with check (
    couple_id in (
      select id from public.couples
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

create policy "Couple members can delete photos"
  on public.photos for delete
  using (
    couple_id in (
      select id from public.couples
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

-- MEMOS
create policy "Couple members can view memos"
  on public.memos for select
  using (
    couple_id in (
      select id from public.couples
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

create policy "Couple members can insert memos"
  on public.memos for insert
  with check (
    couple_id in (
      select id from public.couples
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

create policy "Couple members can update memos"
  on public.memos for update
  using (
    couple_id in (
      select id from public.couples
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

-- ============================================
-- STORAGE
-- ============================================

insert into storage.buckets (id, name, public)
values ('photos', 'photos', false);

-- Storage RLS
create policy "Couple members can upload photos"
  on storage.objects for insert
  with check (
    bucket_id = 'photos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] in (
      select id::text from public.couples
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

create policy "Couple members can read photos"
  on storage.objects for select
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] in (
      select id::text from public.couples
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

create policy "Couple members can delete photos"
  on storage.objects for delete
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] in (
      select id::text from public.couples
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Calendar data aggregation function
create or replace function get_calendar_data(
  p_couple_id uuid,
  p_start_date date,
  p_end_date date
)
returns table (
  capture_date date,
  photo_count bigint,
  thumbnail_path text
) as $$
  select
    p.capture_date,
    count(*) as photo_count,
    (
      select p2.thumbnail_path from public.photos p2
      where p2.couple_id = p_couple_id
        and p2.capture_date = p.capture_date
      order by p2.created_at desc limit 1
    ) as thumbnail_path
  from public.photos p
  where p.couple_id = p_couple_id
    and p.capture_date >= p_start_date
    and p.capture_date <= p_end_date
  group by p.capture_date
  order by p.capture_date;
$$ language sql security definer;

-- ============================================
-- EVENTS (Couple Schedule Sharing)
-- ============================================

create table public.events (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  title text not null,
  event_date date not null,
  start_time time,
  end_time time,
  color text default '#6C63FF',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create index idx_events_couple_date on public.events(couple_id, event_date);

alter table public.events enable row level security;

create policy "Couple members can view events"
  on public.events for select
  using (
    couple_id in (
      select id from public.couples
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

create policy "Couple members can insert events"
  on public.events for insert
  with check (
    couple_id in (
      select id from public.couples
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

create policy "Couple members can update events"
  on public.events for update
  using (
    couple_id in (
      select id from public.couples
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

create policy "Couple members can delete events"
  on public.events for delete
  using (
    couple_id in (
      select id from public.couples
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

-- ============================================
-- PLACES (Where we went)
-- ============================================

create table public.places (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  visit_date date not null,
  name text not null,
  category text not null default 'etc',
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create index idx_places_couple_date on public.places(couple_id, visit_date);

alter table public.places enable row level security;

create policy "Couple members can view places"
  on public.places for select
  using (
    couple_id in (
      select id from public.couples
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

create policy "Couple members can insert places"
  on public.places for insert
  with check (
    couple_id in (
      select id from public.couples
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

create policy "Couple members can update places"
  on public.places for update
  using (
    couple_id in (
      select id from public.couples
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

create policy "Couple members can delete places"
  on public.places for delete
  using (
    couple_id in (
      select id from public.couples
      where user1_id = auth.uid() or user2_id = auth.uid()
    )
  );

-- ============================================
-- DATE FLAGS (met, loved, etc.)
-- ============================================

create table public.date_flags (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  flag_date date not null,
  met boolean default false,
  loved boolean default false,
  updated_by uuid references auth.users(id),
  updated_at timestamptz default now(),
  unique(couple_id, flag_date)
);

create index idx_date_flags_couple_date on public.date_flags(couple_id, flag_date);

alter table public.date_flags enable row level security;

create policy "Couple members can view date_flags"
  on public.date_flags for select
  using (couple_id in (select id from public.couples where user1_id = auth.uid() or user2_id = auth.uid()));

create policy "Couple members can insert date_flags"
  on public.date_flags for insert
  with check (couple_id in (select id from public.couples where user1_id = auth.uid() or user2_id = auth.uid()));

create policy "Couple members can update date_flags"
  on public.date_flags for update
  using (couple_id in (select id from public.couples where user1_id = auth.uid() or user2_id = auth.uid()));
