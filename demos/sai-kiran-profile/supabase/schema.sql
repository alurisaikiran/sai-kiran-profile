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

-- ── CRM contacts ────────────────────────────────────────────────────────────
-- Rows arrive two ways: the public contact form (source='contact_form') and
-- contacts extracted from connected Gmail (source='gmail').
-- Note: email is deliberately NOT unique. Each form submission is its own row
-- so no message is ever silently overwritten, and de-duplicating on write
-- would require granting anon UPDATE — which would let a stranger overwrite
-- an existing contact's details by guessing their email. Gmail extraction
-- de-duplicates explicitly on read instead.
create table if not exists contacts (
  id                uuid primary key default gen_random_uuid(),
  name              text not null default '',
  email             text not null,
  company           text,
  phone             text,
  message           text,
  source            text not null default 'contact_form'
                      check (source in ('contact_form', 'gmail')),
  status            text not null default 'new'
                      check (status in ('new', 'read', 'replied', 'archived')),
  notes             text,
  last_contacted_at timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists contacts_created_at_idx on contacts (created_at desc);
create index if not exists contacts_email_idx on contacts (email);

alter table contacts enable row level security;

-- Anonymous visitors may ONLY insert, and only as a contact-form submission —
-- they can't forge a gmail-sourced row. With RLS on and no select policy for
-- anon, the contact list is never publicly readable.
drop policy if exists "contacts_anon_insert" on contacts;
create policy "contacts_anon_insert"
  on contacts for insert
  to anon
  with check (source = 'contact_form');

drop policy if exists "contacts_auth_all" on contacts;
create policy "contacts_auth_all"
  on contacts for all
  to authenticated
  using (true)
  with check (true);

-- ── Third-party integrations (OAuth tokens) ─────────────────────────────────
-- These rows are credentials, so they get a tighter policy than the tables
-- above: no anon access at all, and each row is readable only by its owner.
create table if not exists integrations (
  id            text not null,
  user_id       uuid not null references auth.users (id) on delete cascade,
  email         text,
  access_token  text,
  refresh_token text,
  expires_at    timestamptz,
  scope         text,
  updated_at    timestamptz not null default now(),
  primary key (id, user_id)
);

alter table integrations enable row level security;

drop policy if exists "integrations_owner_all" on integrations;
create policy "integrations_owner_all"
  on integrations for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
