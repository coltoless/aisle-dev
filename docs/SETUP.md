# SETUP.md — Aisle Development Environment

This document covers everything needed to go from zero to a running local dev environment. Follow steps in order.

---

## Prerequisites

- Node.js 20+ (use `nvm` to manage versions: `nvm use 20`)
- npm 10+ or pnpm 9+ (this project uses **pnpm**)
- Git
- A Supabase account (free tier works): https://supabase.com
- An Anthropic API account: https://console.anthropic.com

---

## 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/aisle.git
cd aisle
pnpm install
```

---

## 2. Supabase Project Setup

### 2.1 Create a new Supabase project
1. Go to https://app.supabase.com → New Project
2. Name it `aisle-dev`
3. Set a strong database password (save it — you'll need it for migrations)
4. Choose the region closest to you
5. Wait for the project to initialize (~2 min)

### 2.2 Grab your credentials
From your Supabase project dashboard → **Settings → API**:
- Copy `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy `service_role` key → this is your `SUPABASE_SERVICE_ROLE_KEY` (⚠️ keep this secret — server-only)

### 2.3 Enable Google OAuth (optional for v1)
From Supabase dashboard → **Authentication → Providers → Google**:
1. Enable the Google provider
2. Create a Google OAuth app at https://console.cloud.google.com
3. Add your Client ID and Client Secret to Supabase
4. Add `http://localhost:3000/auth/callback` as an authorized redirect URI

---

## 3. Environment Variables

Create a `.env.local` file at the project root:

```bash
cp .env.example .env.local
```

Then fill in:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here   # NEVER expose to client

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...                           # NEVER expose to client

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Critical rules:**
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Only put non-sensitive values there.
- `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` must never appear in any client-side file.
- Never commit `.env.local` to git. It is already in `.gitignore`.

---

## 4. Database Setup

### 4.1 Install Supabase CLI

```bash
pnpm add -D supabase
```

### 4.2 Link your project

```bash
pnpm supabase login
pnpm supabase link --project-ref YOUR_PROJECT_REF
```

Your project ref is the subdomain of your Supabase URL (e.g., `abcdefghijklmnop` from `https://abcdefghijklmnop.supabase.co`).

### 4.3 Run migrations

```bash
pnpm supabase db push
```

This runs all migration files in `supabase/migrations/` against your remote database.

### 4.4 Seed default data (optional for development)

```bash
pnpm supabase db seed
```

This seeds a sample couple, wedding profile, and default checklist items for local testing.

### 4.5 Generate TypeScript types from your schema

Run this any time your database schema changes:

```bash
pnpm supabase gen types typescript --project-id YOUR_PROJECT_REF > types/supabase.ts
```

---

## 5. Install shadcn/ui Components

Initialize shadcn (run once after install):

```bash
pnpm dlx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Stone** (closest to our warm palette)
- CSS variables: **Yes**

Then install the components we use:

```bash
pnpm dlx shadcn@latest add button input label card dialog sheet tabs progress badge toast avatar separator
```

---

## 6. Run the Development Server

```bash
pnpm dev
```

App runs at http://localhost:3000

---

## 7. Project Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `pnpm dev` | Start Next.js in dev mode with hot reload |
| Build | `pnpm build` | Production build |
| Type check | `pnpm typecheck` | Run `tsc --noEmit` |
| Lint | `pnpm lint` | Run ESLint |
| Format | `pnpm format` | Run Prettier |
| DB push | `pnpm supabase db push` | Push schema changes to remote DB |
| Gen types | `pnpm supabase gen types typescript ...` | Regenerate DB types |
| DB studio | `pnpm supabase studio` | Open Supabase Studio locally |

---

## 8. Deployment (Vercel)

### 8.1 Connect repo to Vercel
1. Go to https://vercel.com → New Project
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Root directory: `/` (default)

### 8.2 Add environment variables
In Vercel project settings → **Environment Variables**, add all variables from your `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_APP_URL` (set to your Vercel production URL)

### 8.3 Update Supabase auth redirect URLs
In Supabase → **Authentication → URL Configuration**, add:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/auth/callback`

### 8.4 Deploy
Push to `main` — Vercel auto-deploys. Preview deployments are created for every PR.

---

## 9. Supabase Storage Setup

After running migrations, create the contracts storage bucket:

1. Go to Supabase dashboard → **Storage**
2. Create a new bucket named `contracts`
3. Set it to **Private** (not public)
4. Add this RLS policy via SQL editor:

```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own contracts"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id = 'contracts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own contracts
CREATE POLICY "Users can read their own contracts"
ON storage.objects FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'contracts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 10. Common Issues

**`Module not found: Can't resolve '@/components/ui/...'`**
→ You haven't run `shadcn init` yet. See Step 5.

**`AuthSessionMissingError` on API routes**
→ You're using the browser Supabase client in a server context. Use `lib/supabase/server.ts` in API routes and server components.

**`ANTHROPIC_API_KEY` shows as undefined in API route**
→ The key is in `.env.local` but the dev server wasn't restarted after adding it. Restart with `pnpm dev`.

**Supabase RLS blocking reads even when authenticated**
→ Check that your user has a matching row in the `couples` table. RLS policies join through `couples.user_id = auth.uid()`.

**`supabase db push` fails with migration conflicts**
→ Run `pnpm supabase db reset` (⚠️ wipes local/remote dev DB) and re-push all migrations from scratch.

---

## 11. Key File Locations Reference

| What | Where |
|------|-------|
| Default checklist items + budget categories | `lib/constants.ts` |
| AI system prompts + context builder | `lib/ai/prompts.ts` |
| AI tool definitions | `lib/ai/prompts.ts` → `AI_TOOLS` |
| Supabase browser client | `lib/supabase/client.ts` |
| Supabase server client | `lib/supabase/server.ts` |
| All TypeScript types | `types/index.ts` |
| Supabase generated types | `types/supabase.ts` |
| Database migrations | `supabase/migrations/` |
| AI buddy API route | `app/api/ai/buddy/route.ts` |
| Venue recs API route | `app/api/ai/venues/route.ts` |
| Zustand wedding store | `store/weddingStore.ts` |
