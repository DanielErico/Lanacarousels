-- ============================================================
-- LANA IG CAROUSELS — SUPABASE DATABASE SCHEMA
-- Run this entire file in your Supabase SQL Editor:
-- https://supabase.com/dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. PROFILES (extends auth.users) ──────────────────────────
create table if not exists public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  email         text,
  full_name     text,
  avatar_url    text,
  onboarding_completed  boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 2. BRANDS ──────────────────────────────────────────────────
create table if not exists public.brands (
  id                uuid default gen_random_uuid() primary key,
  user_id           uuid references auth.users on delete cascade not null,
  name              text not null,
  website_url       text,
  industry          text,
  description       text,
  audience          text,
  voice             text default 'High Impact Marketing',
  primary_color     text default '#1B2B4A',
  secondary_color   text default '#E8691C',
  accent_color      text default '#FFFFFF',
  ig_handle         text,
  ig_connected      boolean default false,
  ig_account_name   text,
  posting_frequency text default '3x / week',
  is_primary        boolean default false,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ── 3. CAROUSELS ───────────────────────────────────────────────
create table if not exists public.carousels (
  id                uuid default gen_random_uuid() primary key,
  user_id           uuid references auth.users on delete cascade not null,
  brand_id          uuid references public.brands on delete cascade not null,
  title             text,
  source_type       text default 'prompt',
  status            text default 'draft',
  style_preset      text default 'navy_orange_diagonal',
  framework_type    text default 'educational_tips',
  hook_type         text default 'bold_claim',
  platform_spec     text default 'ig_4_5',
  caption_text      text,
  caption_hashtags  jsonb default '[]',
  caption_cta       text,
  performance_score jsonb default '{}',
  scheduled_at      timestamptz,
  published_at      timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ── 4. SLIDES ──────────────────────────────────────────────────
create table if not exists public.slides (
  id            uuid default gen_random_uuid() primary key,
  carousel_id   uuid references public.carousels on delete cascade not null,
  order_index   integer not null,
  type          text not null default 'value',
  headline      text,
  subtext       text,
  badge         text,
  bg_gradient   text,
  text_color    text default '#FFFFFF',
  accent_color  text,
  word_count    integer,
  created_at    timestamptz default now()
);

-- ── 5. ROW LEVEL SECURITY ──────────────────────────────────────
-- Enable RLS on all tables
alter table public.profiles       enable row level security;
alter table public.brands         enable row level security;
alter table public.carousels      enable row level security;
alter table public.slides         enable row level security;

-- Profiles: own row only
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Brands: own rows only
create policy "Users can view own brands"
  on public.brands for select using (auth.uid() = user_id);
create policy "Users can insert own brands"
  on public.brands for insert with check (auth.uid() = user_id);
create policy "Users can update own brands"
  on public.brands for update using (auth.uid() = user_id);
create policy "Users can delete own brands"
  on public.brands for delete using (auth.uid() = user_id);

-- Carousels: own rows only
create policy "Users can view own carousels"
  on public.carousels for select using (auth.uid() = user_id);
create policy "Users can insert own carousels"
  on public.carousels for insert with check (auth.uid() = user_id);
create policy "Users can update own carousels"
  on public.carousels for update using (auth.uid() = user_id);
create policy "Users can delete own carousels"
  on public.carousels for delete using (auth.uid() = user_id);

-- Slides: via carousel ownership
create policy "Users can view own slides"
  on public.slides for select
  using (exists (
    select 1 from public.carousels c
    where c.id = carousel_id and c.user_id = auth.uid()
  ));
create policy "Users can insert own slides"
  on public.slides for insert
  with check (exists (
    select 1 from public.carousels c
    where c.id = carousel_id and c.user_id = auth.uid()
  ));
create policy "Users can update own slides"
  on public.slides for update
  using (exists (
    select 1 from public.carousels c
    where c.id = carousel_id and c.user_id = auth.uid()
  ));
create policy "Users can delete own slides"
  on public.slides for delete
  using (exists (
    select 1 from public.carousels c
    where c.id = carousel_id and c.user_id = auth.uid()
  ));

-- ── Done ────────────────────────────────────────────────────────
-- After running this, go to:
-- Authentication > URL Configuration > Site URL = http://localhost:5173
-- Authentication > Email Templates > confirm signup (optional)
