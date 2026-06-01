create extension if not exists "pgcrypto";

create type public.user_role as enum ('user', 'admin');
create type public.template_status as enum ('active', 'inactive');
create type public.invitation_status as enum ('draft', 'published');
create type public.rsvp_status as enum ('attending', 'not_attending');
create type public.analytics_event_type as enum ('opened', 'rsvp_submitted', 'share_clicked');

create table public.users (
  id uuid primary key default gen_random_uuid(),
  telegram_id text not null unique,
  first_name text not null,
  last_name text,
  username text,
  photo_url text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.templates (
  id text primary key,
  name text not null,
  category text not null default 'wedding',
  description text not null,
  preview_image_url text,
  template_schema jsonb not null,
  status public.template_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  template_id text not null references public.templates(id),
  slug text unique,
  form_data jsonb not null,
  status public.invitation_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  guest_name text not null,
  status public.rsvp_status not null,
  guest_count integer not null default 0 check (guest_count >= 0 and guest_count <= 10),
  created_at timestamptz not null default now()
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  event_type public.analytics_event_type not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.templates enable row level security;
alter table public.invitations enable row level security;
alter table public.rsvps enable row level security;
alter table public.analytics_events enable row level security;

-- The app writes through Next.js API routes using the service-role key.
-- Public policies below only expose active templates and published invitations.
create policy "active templates are public"
  on public.templates for select
  using (status = 'active');

create policy "published invitations are public"
  on public.invitations for select
  using (status = 'published' and slug is not null);

create policy "public rsvp insert for published invitation"
  on public.rsvps for insert
  with check (
    exists (
      select 1 from public.invitations
      where invitations.id = rsvps.invitation_id
      and invitations.status = 'published'
    )
  );

create policy "public analytics insert for published invitation"
  on public.analytics_events for insert
  with check (
    exists (
      select 1 from public.invitations
      where invitations.id = analytics_events.invitation_id
      and invitations.status = 'published'
    )
  );

with wedding_schema as (
  select '[
    {"name":"brideName","label":"Kelin ismi","type":"text","placeholder":"Zebo","required":true},
    {"name":"groomName","label":"Kuyov ismi","type":"text","placeholder":"Ali","required":true},
    {"name":"eventDate","label":"Sana","type":"date","required":true},
    {"name":"eventTime","label":"Vaqt","type":"time","required":true},
    {"name":"venueName","label":"To''yxona","type":"text","placeholder":"Navro''z Palace","required":true},
    {"name":"venueAddress","label":"Manzil","type":"textarea","placeholder":"Toshkent shahri, ...","required":true},
    {"name":"hostText","label":"Taklif matni","type":"textarea","required":true},
    {"name":"coverImageUrl","label":"Rasm URL","type":"url"},
    {"name":"musicUrl","label":"Musiqa URL","type":"url"}
  ]'::jsonb as schema
)
insert into public.templates (id, name, category, description, template_schema, status)
select template.id, template.name, 'wedding', template.description, wedding_schema.schema, 'active'
from wedding_schema,
(values
  ('classic-rose', 'Classic Rose', 'Floating heartlar va rose card bilan klassik romantik taklifnoma.'),
  ('modern-minimal', 'Modern Minimal', 'Oq bo''sh joy, nozik line-art va sokin zamonaviy kompozitsiya.'),
  ('royal-emerald', 'Royal Emerald', 'Zumrad fon, oltin seal va royal nikoh kayfiyati.'),
  ('golden-noor', 'Golden Noor', 'Noor nuri, arabesque naqsh va iliq oltin atmosfera.'),
  ('pearl-blush', 'Pearl Blush', 'Pearl rang, blush gradient va yumshoq luxury ko''rinish.'),
  ('midnight-starry', 'Midnight Starry', 'Tun osmoni, yulduz zarralari va cinematic entrance.'),
  ('garden-bloom', 'Garden Bloom', 'Gul bog''i, barg animatsiyasi va bahorona bayram kayfiyati.'),
  ('silk-lilac', 'Silk Lilac', 'Ipak fon, lilac aksent va elegant editorial uslub.'),
  ('desert-saffron', 'Desert Saffron', 'Saffron, qum to''lqinlari va sharqona iliq kompozitsiya.'),
  ('ocean-glass', 'Ocean Glass', 'Shisha effekt, dengiz ranglari va yengil shimmer animatsiya.')
) as template(id, name, description)
on conflict (id) do nothing;
