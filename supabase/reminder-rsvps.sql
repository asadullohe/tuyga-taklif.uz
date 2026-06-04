alter table public.rsvps
  add column if not exists reminder_enabled boolean not null default false,
  add column if not exists telegram_chat_id text,
  add column if not exists reminder_sent_at timestamptz,
  add column if not exists reminder_token text;

create unique index if not exists rsvps_reminder_token_key
  on public.rsvps (reminder_token)
  where reminder_token is not null;
