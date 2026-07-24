# Sai Kiran Aluri — Portfolio

Next.js (App Router + TypeScript) portfolio site with a Supabase-backed admin CMS.

## Structure

```
src/
  app/
    page.tsx              Public site (Server Component, reads live content)
    layout.tsx            Root layout, global CSS, SEO metadata, JSON-LD
    admin/                Admin CMS (login, dashboard)
    api/
      auth/               login, logout, forgot-password, reset-password
      admin/              content GET/PUT, image upload
  components/             Public site sections (.tsx)
    admin/fields.tsx      Reusable admin form widgets
  hooks/                  Client-side hooks
  lib/
    content-types.ts      Section type definitions
    content.ts            getSiteContent() — Supabase read with static fallback
    supabase.ts           Supabase clients
    auth.ts               Cookie-based session helpers
  styles/                 CSS (design tokens, base, components, layout, sections)
data/portfolio.json       Seed content + fallback when Supabase is empty
supabase/schema.sql       Table, RLS policies, storage bucket
scripts/seed-content.mjs  One-off content migration
```

## Setup

1. Copy `.env.example` to `.env.local` and fill in your Supabase URL and anon key
   (Supabase dashboard → Project Settings → API).
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Create your admin user: Supabase dashboard → Authentication → Users.
4. Add `http://localhost:3000/admin/login` and your production `/admin/login` URL
   to Authentication → URL Configuration → Redirect URLs (needed for password reset).
5. Seed content: `npm run seed -- <admin-email> <password>`

## Develop

```bash
npm install
npm run dev
```

Public site at `http://localhost:3000`, admin at `http://localhost:3000/admin`.

## Deploy

Deploys to Vercel with no extra config. Set `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project's environment variables.
