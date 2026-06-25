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
cp .env.example .env.local
npm run dev
```

Supabase credentials and Telegram bot token are required for production auth/data. Without Supabase variables, the app uses an in-memory demo store so the UI can be explored locally.

Supabase's newer dashboard keys are supported:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

Legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` still work. Server-side data writes require `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`; a publishable/anon key alone is only public access.

## Supabase setup

For a new Supabase project, run the SQL files in this order:

1. `supabase/schema.sql`
2. `supabase/template-design-document.sql`
3. `supabase/invitation-design-document.sql`
4. `supabase/template-editor-v2.sql`
5. `supabase/reminder-rsvps.sql`
6. `supabase/template-assets-storage.sql`
7. `supabase/invitation-assets-storage.sql`

`schema.sql` already includes the current tables used by the app. The additional files are idempotent upgrade/storage setup scripts, so they are safe to rerun.

## Production environment

Required production variables:

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.example
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
TELEGRAM_BOT_TOKEN=
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=
TELEGRAM_WEBHOOK_SECRET=
APP_SESSION_SECRET=
CRON_SECRET=
```

`APP_SESSION_SECRET` and `CRON_SECRET` must be set in production. The app intentionally fails session signing and RSVP reminder cron execution if these values are missing in production.

## Telegram setup

Set the bot webhook to the deployed API route and pass the same secret configured in `TELEGRAM_WEBHOOK_SECRET`:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -d "url=$NEXT_PUBLIC_APP_URL/api/telegram/webhook" \
  -d "secret_token=$TELEGRAM_WEBHOOK_SECRET"
```

`NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` is used to generate RSVP reminder deep links.

## Scheduled reminders

Netlify runs `netlify/functions/rsvp-reminders.js` every 5 minutes. The function calls `/api/reminders/rsvp` with `Authorization: Bearer $CRON_SECRET`.
