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
- [USER_STORIES.md](./USER_STORIES.md) — MVP user stories and acceptance criteria  

## Supabase

```bash
pnpm supabase login
pnpm supabase link --project-ref tkpnrutloxtgabvnjsib
```

## Scripts

| Command | Description |
|--------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript |
