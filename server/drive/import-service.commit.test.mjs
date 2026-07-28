import test from 'node:test';
import assert from 'node:assert/strict';
import { commitDriveImport } from './import-service.js';

class Query {
  constructor(db, table) { this.db = db; this.table = table; this.filters = []; this.operation = 'select'; }
  select() { this.selection = true; return this; }
  eq(field, value) { this.filters.push((row) => String(row[field]) === String(value)); return this; }
  is(field, value) { this.filters.push((row) => value === null ? row[field] == null : row[field] === value); return this; }
  order() { return this; }
  limit() { return this; }
  insert(values) { this.operation = 'insert'; this.payload = values; return this; }
  update(values) { this.operation = 'update'; this.payload = values; return this; }
  delete() { this.operation = 'delete'; return this; }
  maybeSingle() { return this.execute(true); }
  single() { return this.execute(true); }
  then(resolve, reject) { return this.execute(false).then(resolve, reject); }
  async execute(single) {
    const rows = this.db[this.table] || [];
    const matches = () => rows.filter((row) => this.filters.every((filter) => filter(row)));
    if (this.operation === 'insert') {
      const value = { ...this.payload };
      if (this.table === 'offerings') value.id = value.id || ++this.db.nextOfferingId;
      if (this.table === 'assets') value.id = value.id || `asset-${++this.db.nextAssetId}`;
      if (this.table === 'property_asset_relations') value.id = value.id || `relation-${++this.db.nextRelationId}`;
      rows.push(value);
      return { data: single ? value : [value], error: null };
    }
    if (this.operation === 'update') {
      const changed = matches(); changed.forEach((row) => Object.assign(row, this.payload));
      return { data: single ? changed[0] || null : changed, error: null };
    }
    if (this.operation === 'delete') {
      const kept = rows.filter((row) => !this.filters.every((filter) => filter(row)));
      this.db[this.table] = kept;
      return { data: null, error: null };
    }
    const found = matches();
    return { data: single ? found[0] || null : found, error: null };
  }
}

class FakeSupabase {
  constructor() {
    this.nextOfferingId = 0; this.nextAssetId = 0; this.nextRelationId = 0;
    this.offerings = []; this.assets = []; this.property_asset_relations = [];
    this.import_batches = []; this.import_file_mappings = []; this.activity_log = [];
    this.transaction_types = [{ id: 7, name: 'sale', label: 'For Sale' }];
    this.objects = new Map();
    this.storage = { from: (bucket) => ({
      upload: async (path, buffer) => { this.objects.set(`${bucket}/${path}`, Buffer.from(buffer)); return { data: { path }, error: null }; },
      download: async (path) => { const value = this.objects.get(`${bucket}/${path}`); return value ? { data: new Blob([value]), error: null } : { data: null, error: new Error('missing object') }; },
      remove: async (paths) => { paths.forEach((path) => this.objects.delete(`${bucket}/${path}`)); return { data: paths, error: null }; },
    }) };
  }
  from(table) { return new Query(this, table); }
}

function fakeDrive() {
  const image = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
  return {
    files: {
      get: async ({ fileId, alt }) => {
        if (alt === 'media') return { data: image };
        if (fileId === 'root_123456789') return { data: { id: fileId, name: 'Root', mimeType: 'application/vnd.google-apps.folder', trashed: false } };
        if (fileId === 'folder_123456789') return { data: { id: fileId, name: 'Unit 12A', mimeType: 'application/vnd.google-apps.folder', parents: ['root_123456789'], trashed: false } };
        return { data: { id: fileId, name: 'Unknown', mimeType: 'image/jpeg', size: '4', md5Checksum: null, modifiedTime: '2026-01-01T00:00:00Z' } };
      },
      list: async () => ({ data: { files: [
        { id: 'doc_123456789', name: 'Metadata', mimeType: 'application/vnd.google-apps.document', modifiedTime: '2026-01-01T00:00:00Z' },
        { id: 'image_123456789', name: 'cover.jpg', mimeType: 'image/jpeg', size: '4', modifiedTime: '2026-01-01T00:00:00Z' },
      ] } }),
      export: async () => ({ data: 'Title: Unit 12A\nStatus: Available\nProperty Type: Condominium\nTransaction Type: Sale\nLocation: Manila\nDescription: Ready.' }),
    },
  };
}

test('commit creates one draft and re-importing does not duplicate listing, asset, or relation', async () => {
  const supabase = new FakeSupabase();
  const args = { drive: fakeDrive(), supabase, rootFolderId: 'root_123456789', driveFolderId: 'folder_123456789', actorId: 'actor-123456789' };
  const first = await commitDriveImport(args);
  const second = await commitDriveImport(args);
  assert.equal(first.status, 'completed');
  assert.equal(second.status, 'completed');
  assert.equal(supabase.offerings.length, 1);
  assert.equal(supabase.offerings[0].listing_status, 'draft');
  assert.equal(supabase.offerings[0].is_published, false);
  assert.equal(supabase.assets.length, 1);
  assert.equal(supabase.property_asset_relations.length, 1);
  assert.equal(second.skipped, 1);
});

test('commit refuses to overwrite a published listing without explicit confirmation mode', async () => {
  const supabase = new FakeSupabase();
  supabase.offerings.push({ id: 9, title: 'Published', drive_folder_id: 'folder_123456789', listing_status: 'published', is_published: true, published_at: '2026-01-01T00:00:00Z' });
  await assert.rejects(
    commitDriveImport({ drive: fakeDrive(), supabase, rootFolderId: 'root_123456789', driveFolderId: 'folder_123456789', actorId: 'actor-123456789' }),
    (error) => error.code === 'published_update_confirmation_required',
  );
  assert.equal(supabase.import_batches.length, 0);
  assert.equal(supabase.offerings[0].listing_status, 'published');
});
