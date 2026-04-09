# Aisle (aisle-dev)

Wedding planning platform — Next.js 14 (App Router), Supabase, shadcn/ui, TanStack Query, Zustand.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill values (see Supabase dashboard)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docs in repo

- [ARCHITECTURE.md](./ARCHITECTURE.md) — directory layout and conventions  
- [docs/USER_STORIES.md](./docs/USER_STORIES.md) — MVP user stories and acceptance criteria  
- [docs/SCREENS.md](./docs/SCREENS.md) — screen inventory and layout notes  
- [docs/SETUP.md](./docs/SETUP.md) — local dev environment setup (Supabase, env, tooling)  

## Supabase

```bash
pnpm supabase login
pnpm supabase link --project-ref tkpnrutloxtgabvnjsib
pnpm db:push                 # apply migrations to the linked project
pnpm gen:types               # refresh types/supabase.ts (needs login / access token)
```

**Remote seed (dev DB only):** set `SUPABASE_DB_URL` to the direct Postgres URI, then  
`pnpm db:seed -- --db-url "$SUPABASE_DB_URL"`.

`pnpm db:diff` compares schema via a local shadow DB and needs Docker running.

## Scripts

| Command | Description |
|--------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript |
