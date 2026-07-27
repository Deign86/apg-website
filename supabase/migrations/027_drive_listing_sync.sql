-- Migration 027: canonical APR Drive listing reconciliation state

create table if not exists public.offering_drive_sync (
  offering_id bigint primary key references public.offerings(id) on delete cascade,
  listing_key text not null unique,
  drive_folder_id text not null unique,
  source_values jsonb not null default '{}'::jsonb,
  source_row_hash text,
  field_locks text[] not null default '{}',
  source_status text not null default 'active'
    check (source_status in ('active', 'missing', 'invalid')),
  last_error text,
  last_seen_batch_id text references public.import_batches(id) on delete set null,
  last_synced_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_offering_drive_sync_status
  on public.offering_drive_sync(source_status);

create table if not exists public.drive_asset_sync (
  drive_file_id text primary key,
  offering_id bigint not null references public.offerings(id) on delete cascade,
  asset_id uuid references public.assets(id) on delete set null,
  relative_path text not null,
  checksum_sha256 text,
  drive_md5_checksum text,
  drive_modified_at timestamptz,
  display_order int not null default 0,
  is_active boolean not null default true,
  last_seen_batch_id text references public.import_batches(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_drive_asset_sync_offering
  on public.drive_asset_sync(offering_id, display_order);
create index if not exists idx_drive_asset_sync_active
  on public.drive_asset_sync(is_active) where is_active = true;

alter table public.offering_drive_sync enable row level security;
alter table public.drive_asset_sync enable row level security;

drop policy if exists "staff manage offering drive sync" on public.offering_drive_sync;
create policy "staff manage offering drive sync"
  on public.offering_drive_sync for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "staff manage drive asset sync" on public.drive_asset_sync;
create policy "staff manage drive asset sync"
  on public.drive_asset_sync for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop trigger if exists set_updated_at on public.offering_drive_sync;
create trigger set_updated_at
  before update on public.offering_drive_sync
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.drive_asset_sync;
create trigger set_updated_at
  before update on public.drive_asset_sync
  for each row execute function public.handle_updated_at();
