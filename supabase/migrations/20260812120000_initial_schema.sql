-- Initial Database Schema (Stage 7)
--
-- Scope: only what Stage 8 (Core Stuff Library) needs — profiles, finds,
-- products, boards, board_products. Deliberately excludes import_jobs,
-- source_assets, product_evidence, retail_offers, product_feedback,
-- outbound_clicks, usage_events and subscriptions — those belong to
-- later stages (Import System, Product Search, RevenueCat, Analytics)
-- and would be premature here.
--
-- Design decisions worth recording:
--   * user_id is denormalized onto finds/products/boards (not just
--     inferred via joins) so RLS policies stay simple, single-column
--     checks — cheap to add now, meaningfully simpler and faster later.
--   * "All Saved" (see project spec) is NOT a real row here. It's the
--     union of a user's products across all their boards, computed at
--     query time once the Boards UI exists (Stage 8) — a real Board row
--     for it would need special-cased rename/delete protection for no
--     real benefit.
--   * Idempotent (IF NOT EXISTS / CREATE OR REPLACE / guarded DO blocks)
--     since this may be re-run by pasting into the SQL Editor rather
--     than through CLI-tracked migrations.

create extension if not exists pgcrypto;

-- Enums -----------------------------------------------------------------

do $$
begin
  create type public.find_platform as enum (
    'instagram', 'tiktok', 'youtube', 'pinterest', 'facebook',
    'website', 'screenshot', 'video', 'text'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.match_type as enum (
    'exact_match', 'likely_match', 'mentioned', 'similar'
  );
exception
  when duplicate_object then null;
end $$;

-- Tables ------------------------------------------------------------------

-- One row per auth.users row, kept in sync by the trigger below. Holds
-- app-facing profile fields that don't belong in Supabase Auth itself.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

-- A Find: one imported piece of source content. May contain zero, one or
-- many products (see public.products).
create table if not exists public.finds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform public.find_platform not null,
  source_url text,
  caption text,
  thumbnail_url text,
  created_at timestamptz not null default now()
);

create index if not exists finds_user_id_idx on public.finds(user_id);

-- A single identified product within a Find. Identification fields
-- (match_type, confidence, evidence-derived attributes) are nullable —
-- they stay empty until the Product Identification stage populates them;
-- this table only defines where that data will live.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  find_id uuid not null references public.finds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  brand text,
  model text,
  category text,
  variant text,
  colour text,
  size text,
  description text,
  image_url text,
  match_type public.match_type,
  confidence numeric(3, 2) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  created_at timestamptz not null default now()
);

create index if not exists products_find_id_idx on public.products(find_id);
create index if not exists products_user_id_idx on public.products(user_id);

-- A user-created collection of products. Names are unique per user
-- (case-insensitive) to avoid accidental duplicate Boards.
create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists boards_user_id_idx on public.boards(user_id);
create unique index if not exists boards_user_id_name_key on public.boards(user_id, lower(name));

-- Join table: a product saved to a Board. A product may be saved to
-- multiple Boards (composite primary key allows exactly that, once).
create table if not exists public.board_products (
  board_id uuid not null references public.boards(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (board_id, product_id)
);

create index if not exists board_products_product_id_idx on public.board_products(product_id);

-- Triggers ------------------------------------------------------------------

-- Keeps public.profiles in sync with auth.users on signup. security
-- definer so it can insert despite the caller (the signing-up user)
-- having no profiles INSERT policy of their own.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists boards_set_updated_at on public.boards;
create trigger boards_set_updated_at
  before update on public.boards
  for each row execute procedure public.set_updated_at();

-- Row Level Security ---------------------------------------------------
--
-- Every table here holds private, per-user data. No table is readable or
-- writable across users — see project rule: "One user must never be able
-- to access another user's private Finds, Products, Boards, preferences."

alter table public.profiles enable row level security;
alter table public.finds enable row level security;
alter table public.products enable row level security;
alter table public.boards enable row level security;
alter table public.board_products enable row level security;

drop policy if exists "select own profile" on public.profiles;
create policy "select own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- No profiles INSERT/DELETE policy for users: rows are created by the
-- handle_new_user trigger and removed via auth.users' ON DELETE CASCADE.

drop policy if exists "select own finds" on public.finds;
create policy "select own finds" on public.finds
  for select using (auth.uid() = user_id);

drop policy if exists "insert own finds" on public.finds;
create policy "insert own finds" on public.finds
  for insert with check (auth.uid() = user_id);

drop policy if exists "update own finds" on public.finds;
create policy "update own finds" on public.finds
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "delete own finds" on public.finds;
create policy "delete own finds" on public.finds
  for delete using (auth.uid() = user_id);

drop policy if exists "select own products" on public.products;
create policy "select own products" on public.products
  for select using (auth.uid() = user_id);

drop policy if exists "insert own products" on public.products;
create policy "insert own products" on public.products
  for insert with check (auth.uid() = user_id);

drop policy if exists "update own products" on public.products;
create policy "update own products" on public.products
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "delete own products" on public.products;
create policy "delete own products" on public.products
  for delete using (auth.uid() = user_id);

drop policy if exists "select own boards" on public.boards;
create policy "select own boards" on public.boards
  for select using (auth.uid() = user_id);

drop policy if exists "insert own boards" on public.boards;
create policy "insert own boards" on public.boards
  for insert with check (auth.uid() = user_id);

drop policy if exists "update own boards" on public.boards;
create policy "update own boards" on public.boards
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "delete own boards" on public.boards;
create policy "delete own boards" on public.boards
  for delete using (auth.uid() = user_id);

-- board_products has no user_id column of its own — ownership is proven
-- via the parent board (and, for inserts, the product too, so a user
-- can't link a board_products row to a product they can't otherwise see).

drop policy if exists "select own board_products" on public.board_products;
create policy "select own board_products" on public.board_products
  for select using (
    exists (
      select 1 from public.boards
      where boards.id = board_products.board_id and boards.user_id = auth.uid()
    )
  );

drop policy if exists "insert own board_products" on public.board_products;
create policy "insert own board_products" on public.board_products
  for insert with check (
    exists (
      select 1 from public.boards
      where boards.id = board_products.board_id and boards.user_id = auth.uid()
    )
    and exists (
      select 1 from public.products
      where products.id = board_products.product_id and products.user_id = auth.uid()
    )
  );

drop policy if exists "delete own board_products" on public.board_products;
create policy "delete own board_products" on public.board_products
  for delete using (
    exists (
      select 1 from public.boards
      where boards.id = board_products.board_id and boards.user_id = auth.uid()
    )
  );
