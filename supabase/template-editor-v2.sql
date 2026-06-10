alter table public.templates
  add column if not exists revision integer not null default 1;

create table if not exists public.template_revisions (
  id uuid primary key default gen_random_uuid(),
  template_id text not null references public.templates(id) on delete cascade,
  revision integer not null,
  design_document jsonb not null,
  created_at timestamptz not null default now(),
  unique (template_id, revision)
);

alter table public.template_revisions enable row level security;

create table if not exists public.template_assets (
  storage_path text primary key,
  name text not null,
  category text not null default 'image',
  tags text[] not null default '{}',
  mime_type text not null,
  size_bytes bigint not null default 0,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.template_assets enable row level security;
