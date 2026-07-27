-- E2E backend guards: make the policies required by the browser/API contract explicit.
-- This migration is additive/idempotent and does not drop data or buckets.

alter table if exists public.inquiries
  add column if not exists ticket text,
  add column if not exists phone text,
  add column if not exists source text default 'contact_form',
  add column if not exists property_id text,
  add column if not exists assigned_to uuid references public.profiles(id) on delete set null,
  add column if not exists notes text,
  add column if not exists lead_score integer default 0,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists inquiries_ticket_key on public.inquiries(ticket) where ticket is not null;
alter table if exists public.inquiries drop constraint if exists inquiries_status_check;
alter table if exists public.inquiries add constraint inquiries_status_check
  check (status in ('new', 'read', 'replied', 'contacted', 'qualified', 'won', 'lost', 'archived'));

alter table if exists public.chat_logs enable row level security;
drop policy if exists "chat_logs_admin_read" on public.chat_logs;
create policy "chat_logs_admin_read" on public.chat_logs
  for select to authenticated using (public.is_admin());

drop policy if exists "chatbot_kb_public_read" on public.chatbot_kb;
create policy "chatbot_kb_public_read" on public.chatbot_kb
  for select using (active = true);

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings
  for select using (true);

insert into storage.buckets (id, name, public)
values ('apg-public', 'apg-public', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('apg-private', 'apg-private', false)
on conflict (id) do nothing;
