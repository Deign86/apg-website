-- Migration 0028: reconcile legacy Drive sync rows into canonical identity columns.
-- Safe to run after 0026/027 in either order; all updates are null-preserving.

do $$
begin
  if to_regclass('public.offering_drive_sync') is not null then
    update public.offerings as o
    set drive_folder_id = s.drive_folder_id,
        listing_status = coalesce(o.listing_status, o.status),
        bedrooms = coalesce(o.bedrooms, o.beds),
        bathrooms = coalesce(o.bathrooms, o.baths)
    from public.offering_drive_sync as s
    where o.id = s.offering_id
      and o.drive_folder_id is null;
  end if;
  if to_regclass('public.drive_asset_sync') is not null then
    update public.assets as a
    set drive_file_id = s.drive_file_id,
        drive_folder_id = o.drive_folder_id,
        drive_md5_checksum = coalesce(a.drive_md5_checksum, s.drive_md5_checksum),
        drive_modified_time = coalesce(a.drive_modified_time, s.drive_modified_at),
        checksum_sha256 = coalesce(a.checksum_sha256, s.checksum_sha256)
    from public.drive_asset_sync as s
    join public.offerings as o on o.id = s.offering_id
    where a.id = s.asset_id
      and a.drive_file_id is null;
  end if;
end $$;
