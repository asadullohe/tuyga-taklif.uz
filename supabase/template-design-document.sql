alter table public.templates
  add column if not exists design_document jsonb;
