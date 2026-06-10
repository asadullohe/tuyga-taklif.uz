alter table public.invitations
  add column if not exists design_document jsonb;
