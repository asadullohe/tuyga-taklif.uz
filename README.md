# tuyga-taklif.uz

MVP for creating wedding invitations from templates.

## Stack

- Next.js App Router + TypeScript
- TailwindCSS + shadcn/ui style primitives
- React Hook Form + Zod
- TanStack Query
- Supabase
- Telegram Login Widget + Telegram Mini App auth

## Local setup

```bash
npm install
cp .env.local .env.local
npm run dev
```

Supabase credentials and Telegram bot token are required for production auth/data. Without Supabase variables, the app uses an in-memory demo store so the UI can be explored locally.

Supabase's newer dashboard keys are supported:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

Legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` still work. Server-side data writes require `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`; a publishable/anon key alone is only public access.
