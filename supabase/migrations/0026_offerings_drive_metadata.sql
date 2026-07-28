-- Migration 0026: controlled Drive intake and canonical listing lifecycle.
-- Additive/idempotent. Google Drive is an import/archive source only.

alter table if exists public.offerings
  add column if not exists listing_status text,
  add column if not exists bedrooms integer,
  add column if not exists bathrooms integer,
  add column if not exists parking_slots integer,
  add column if not exists drive_folder_id text,
  add column if not exists drive_doc_id text,
  add column if not exists drive_doc_modified_time timestamptz,
  add column if not exists imported_at timestamptz,
  add column if not exists imported_by uuid references public.profiles(id) on delete set null,
  add column if not exists published_at timestamptz,
  add column if not exists archived_at timestamptz;

update public.offerings
set listing_status = case
  when coalesce(deleted_at, archived_at) is not null then 'archived'
  when lower(coalesce(status, '')) in ('sold', 'closed', 'unavailable') then 'unavailable'
  when coalesce(is_published, false) then 'published'
  else 'draft'
end
where listing_status is null;

update public.offerings
set bedrooms = coalesce(bedrooms, beds),
    bathrooms = coalesce(bathrooms, baths),
    parking_slots = coalesce(parking_slots, garage)
where bedrooms is null or bathrooms is null or parking_slots is null;

alter table public.offerings
  alter column listing_status set default 'draft',
  alter column listing_status set not null;

alter table public.offerings drop constraint if exists offerings_listing_status_check;
alter table public.offerings add constraint offerings_listing_status_check
  check (listing_status in ('draft', 'for_review', 'published', 'unavailable', 'archived'));

create unique index if not exists offerings_drive_folder_id_key
  on public.offerings (drive_folder_id)
  where drive_folder_id is not null;
create index if not exists offerings_listing_status_idx
  on public.offerings (listing_status, created_at desc);
create index if not exists offerings_drive_doc_id_idx
  on public.offerings (drive_doc_id)
  where drive_doc_id is not null;

alter table if exists public.assets
  add column if not exists source_type text,
  add column if not exists drive_file_id text,
  add column if not exists drive_folder_id text,
  add column if not exists drive_md5_checksum text,
  add column if not exists drive_modified_time timestamptz,
  add column if not exists checksum_sha256 text;

update public.assets set source_type = case
  when drive_file_id is not null then 'drive_import'
  else 'direct_upload'
end where source_type is null;

alter table public.assets
  alter column source_type set default 'direct_upload',
  alter column source_type set not null;
alter table public.assets drop constraint if exists assets_source_type_check;
alter table public.assets add constraint assets_source_type_check
  check (source_type in ('drive_import', 'direct_upload'));

create unique index if not exists assets_drive_file_id_key
  on public.assets (drive_file_id)
  where drive_file_id is not null;
create index if not exists assets_drive_folder_id_idx
  on public.assets (drive_folder_id)
  where drive_folder_id is not null;
create index if not exists assets_checksum_sha256_idx
  on public.assets (checksum_sha256)
  where checksum_sha256 is not null;

alter table if exists public.import_batches
  add column if not exists source_type text,
  add column if not exists source_folder_id text,
  add column if not exists source_doc_id text,
  add column if not exists offering_id bigint references public.offerings(id) on delete set null,
  add column if not exists imported_by uuid references public.profiles(id) on delete set null;

update public.import_batches set source_type = 'drive_import' where source_type is null;
alter table public.import_batches alter column source_type set default 'drive_import';
alter table public.import_batches drop constraint if exists import_batches_source_type_check;
alter table public.import_batches add constraint import_batches_source_type_check
  check (source_type in ('drive_import', 'direct_upload'));

alter table if exists public.import_file_mappings
  add column if not exists source_drive_file_id text,
  add column if not exists source_modified_time timestamptz;
create index if not exists import_file_mappings_drive_file_idx
  on public.import_file_mappings (source_drive_file_id)
  where source_drive_file_id is not null;

insert into public.transaction_types (name, label)
values ('rent', 'For Rent')
on conflict (name) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('apg-public', 'apg-public', true, 10485760,
  '{image/jpeg,image/png,image/webp,image/avif,application/pdf}')
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = '{image/jpeg,image/png,image/webp,image/avif,application/pdf}';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('apg-private', 'apg-private', false, 26214400,
  '{image/jpeg,image/png,image/webp,application/pdf}')
on conflict (id) do update set
  public = false,
  file_size_limit = 26214400,
  allowed_mime_types = '{image/jpeg,image/png,image/webp,application/pdf}';

alter table public.offerings enable row level security;
alter table public.assets enable row level security;
alter table public.property_asset_relations enable row level security;
alter table public.import_batches enable row level security;
alter table public.import_file_mappings enable row level security;

drop policy if exists "public read offerings" on public.offerings;
drop policy if exists "offerings_public_read" on public.offerings;
create policy "offerings_public_read" on public.offerings for select
  using (listing_status = 'published' and is_published = true
    and deleted_at is null and archived_at is null);

drop policy if exists "staff read offerings" on public.offerings;
create policy "staff read offerings" on public.offerings for select
  to authenticated using (public.is_staff());
drop policy if exists "staff write offerings" on public.offerings;
create policy "staff insert draft offerings" on public.offerings for insert
  to authenticated
  with check (public.is_staff() and (public.is_admin()
    or (listing_status in ('draft', 'for_review') and coalesce(is_published, false) = false)));
create policy "staff update draft offerings" on public.offerings for update
  to authenticated
  using (public.is_admin() or (public.is_staff() and listing_status in ('draft', 'for_review')))
  with check (public.is_admin() or (public.is_staff()
    and listing_status in ('draft', 'for_review') and coalesce(is_published, false) = false));

drop policy if exists "public read public assets" on public.assets;
create policy "public read public assets" on public.assets for select
  using (is_public = true and ingestion_status = 'active' and exists (
    select 1 from public.property_asset_relations r
    join public.offerings o on o.id = r.offering_id
    where r.asset_id = assets.id and r.is_cover is not null
      and o.listing_status = 'published' and o.is_published = true
      and o.deleted_at is null and o.archived_at is null
  ));
drop policy if exists "staff manage assets" on public.assets;
drop policy if exists "staff read assets" on public.assets;
create policy "staff read assets" on public.assets for select
  to authenticated using (public.is_staff());
drop policy if exists "admin manage assets" on public.assets;
create policy "admin manage assets" on public.assets for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read relations for published offerings" on public.property_asset_relations;
create policy "public read relations for published offerings" on public.property_asset_relations for select
  using (exists (
    select 1 from public.offerings o where o.id = offering_id
      and o.listing_status = 'published' and o.is_published = true
      and o.deleted_at is null and o.archived_at is null
  ));
drop policy if exists "staff manage relations" on public.property_asset_relations;
drop policy if exists "staff read relations" on public.property_asset_relations;
create policy "staff read relations" on public.property_asset_relations for select
  to authenticated using (public.is_staff());
create policy "admin manage relations" on public.property_asset_relations for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "staff read mappings" on public.import_file_mappings;
drop policy if exists "staff write mappings" on public.import_file_mappings;
create policy "staff read mappings" on public.import_file_mappings for select
  to authenticated using (public.is_staff());
drop policy if exists "staff read import batches" on public.import_batches;
create policy "staff read import batches" on public.import_batches for select
  to authenticated using (public.is_staff());
drop policy if exists "admin write import batches" on public.import_batches;
create policy "admin write import batches" on public.import_batches for all
  to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin write mappings" on public.import_file_mappings for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "apg-public staff write" on storage.objects;
create policy "apg-public admin write" on storage.objects for insert
  to authenticated with check (bucket_id = 'apg-public' and public.is_admin());
drop policy if exists "apg-public staff update" on storage.objects;
create policy "apg-public admin update" on storage.objects for update
  to authenticated using (bucket_id = 'apg-public' and public.is_admin());
drop policy if exists "apg-public staff delete" on storage.objects;
create policy "apg-public admin delete" on storage.objects for delete
  to authenticated using (bucket_id = 'apg-public' and public.is_admin());
drop policy if exists "apg-private staff read" on storage.objects;
create policy "apg-private staff read" on storage.objects for select
  to authenticated using (bucket_id = 'apg-private' and public.is_staff());
drop policy if exists "apg-private staff write" on storage.objects;
create policy "apg-private staff write" on storage.objects for insert
  to authenticated with check (bucket_id = 'apg-private' and public.is_staff());
drop policy if exists "apg-private staff update" on storage.objects;
create policy "apg-private staff update" on storage.objects for update
  to authenticated using (bucket_id = 'apg-private' and public.is_staff());
drop policy if exists "apg-private staff delete" on storage.objects;
create policy "apg-private staff delete" on storage.objects for delete
  to authenticated using (bucket_id = 'apg-private' and public.is_staff());

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'offerings') then
      execute 'alter publication supabase_realtime add table public.offerings';
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'property_asset_relations') then
      execute 'alter publication supabase_realtime add table public.property_asset_relations';
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'assets') then
      execute 'alter publication supabase_realtime add table public.assets';
    end if;
  end if;
end $$;
