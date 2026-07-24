-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query).
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE where possible.

-- ── Content table ────────────────────────────────────────────────────────────
create table if not exists portfolio_content (
  section    text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table portfolio_content enable row level security;

drop policy if exists "portfolio_content_public_read" on portfolio_content;
create policy "portfolio_content_public_read"
  on portfolio_content for select
  to anon, authenticated
  using (true);

drop policy if exists "portfolio_content_auth_write" on portfolio_content;
create policy "portfolio_content_auth_write"
  on portfolio_content for insert
  to authenticated
  with check (true);

drop policy if exists "portfolio_content_auth_update" on portfolio_content;
create policy "portfolio_content_auth_update"
  on portfolio_content for update
  to authenticated
  using (true)
  with check (true);

-- ── Storage bucket for admin-uploaded images ────────────────────────────────
insert into storage.buckets (id, name, public)
values ('portfolio-assets', 'portfolio-assets', true)
on conflict (id) do nothing;

drop policy if exists "portfolio_assets_public_read" on storage.objects;
create policy "portfolio_assets_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'portfolio-assets');

drop policy if exists "portfolio_assets_auth_write" on storage.objects;
create policy "portfolio_assets_auth_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio-assets');
