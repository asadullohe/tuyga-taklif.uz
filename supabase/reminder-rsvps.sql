alter table public.rsvps
  add column if not exists reminder_enabled boolean not null default false,
  add column if not exists telegram_chat_id text,
  add column if not exists reminder_sent_at timestamptz;
