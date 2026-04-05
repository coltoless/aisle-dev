# Aisle — Application Architecture

This document defines the **directory layout** and layering conventions for the Next.js 14 App Router codebase.

## Top-level layout

```text
.
├── app/                    # Routes, layouts, route handlers
├── components/             # Shared UI (shadcn in components/ui)
├── hooks/                  # Client hooks (React Query, UI, feature hooks)
├── lib/                    # Pure utilities, Supabase, AI, API helpers
├── store/                  # Zustand stores
├── types/                  # Shared TypeScript types (domain + API)
├── public/                 # Static assets
├── supabase/               # Local Supabase config & SQL migrations
├── ARCHITECTURE.md
├── USER_STORIES.md
├── components.json         # shadcn/ui CLI config
└── package.json
```

## `app/`

| Path | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout, fonts, global providers |
| `app/page.tsx` | Marketing landing (or redirect) |
| `app/globals.css` | Tailwind + CSS variables (shadcn theme) |
| `app/(auth)/` | Login, signup, password reset |
| `app/(dashboard)/` | Authenticated shell: dashboard, checklist, budget, venues, vendors, contracts, settings |
| `app/onboarding/` | Multi-step onboarding flow |
| `app/api/**/route.ts` | Route handlers (AI, webhooks, uploads) |
| `auth/callback/route.ts` | Supabase OAuth callback (when added) |

## `components/`

| Path | Purpose |
|------|---------|
| `components/ui/` | shadcn primitives (button, dialog, …) |
| `components/layout/` | App shell, nav, buddy FAB |
| `components/dashboard/` | Dashboard-specific widgets |
| `components/onboarding/` | Onboarding steps |

## `lib/`

| Path | Purpose |
|------|---------|
| `lib/constants.ts` | Enums and display metadata for forms |
| `lib/utils.ts` | `cn()` and small helpers |
| `lib/api/responses.ts` | Typed JSON error helpers for APIs |
| `lib/ai/prompts.ts` | System prompts and tool definitions |
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/supabase/server.ts` | Server / RSC Supabase client |

## `store/`

Client-only Zustand stores (onboarding draft, UI state, etc.).

## `types/`

| File | Purpose |
|------|---------|
| `types/index.ts` | Domain types aligned with Supabase |
| `types/api.ts` | Request/response contracts for API routes |

## `supabase/`

| Path | Purpose |
|------|---------|
| `config.toml` | Local CLI configuration (`pnpm supabase init`) |
| `migrations/*.sql` | Schema migrations (source of truth) |

**Link to hosted project** (requires login): `pnpm supabase login`, then  
`pnpm supabase link --project-ref tkpnrutloxtgabvnjsib`.

## Conventions

- **Money:** store as integer **cents** in the database; format as USD in the UI.
- **Data fetching:** Supabase from server components or TanStack Query on the client; sensitive writes via API routes when needed.
- **AI:** streaming NDJSON from `/api/ai/buddy`; structured JSON for venues and contract review.
