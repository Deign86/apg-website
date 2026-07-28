import test from 'node:test';
import assert from 'node:assert/strict';
import { extractDriveFolderId, previewDriveImport } from './import-service.js';

test('extracts a Drive folder id from supported URL shapes and rejects unsafe input', () => {
  assert.equal(extractDriveFolderId('folder_123456789'), 'folder_123456789');
  assert.equal(extractDriveFolderId('https://drive.google.com/drive/folders/folder_123456789?usp=sharing'), 'folder_123456789');
  assert.throws(() => extractDriveFolderId('https://example.com/folders/folder_123456789'), /valid Google Drive folder/);
  assert.throws(() => extractDriveFolderId('not a folder'), /valid Google Drive folder/);
});

function fakeSupabase(existing = null) {
  const writes = [];
  const client = {
    from(table) {
      return {
        select() { return this; },
        eq() { return this; },
        maybeSingle: async () => ({ data: existing, error: null }),
        then(resolve) { return Promise.resolve({ data: [], error: null }).then(resolve); },
        insert(values) { writes.push(['insert', table, values]); return Promise.resolve({ data: null, error: new Error('preview wrote data') }); },
        update(values) { writes.push(['update', table, values]); return Promise.resolve({ data: null, error: new Error('preview wrote data') }); },
      };
    },
    _writes: writes,
  };
  return client;
}

test('previews one metadata Doc without writes and returns deterministic manifest', async () => {
  const supabase = fakeSupabase();
  const drive = {
    files: {
      get: async ({ fileId }) => ({ data: fileId === 'folder_123456789'
        ? { id: fileId, name: 'Unit 12A', mimeType: 'application/vnd.google-apps.folder', parents: ['root_123456789'], trashed: false, webViewLink: 'https://drive.google.com/drive/folders/folder_123456789' }
        : { id: fileId, name: 'APR LISTING', mimeType: 'application/vnd.google-apps.folder', trashed: false } }),
      list: async ({ q }) => {
        if (q.includes('folder_123456789')) return { data: { files: [
          { id: 'doc_123456789', name: 'Metadata', mimeType: 'application/vnd.google-apps.document', modifiedTime: '2026-01-01T00:00:00Z' },
          { id: 'image_123456789', name: 'image-10.jpg', mimeType: 'image/jpeg', size: '10', modifiedTime: '2026-01-01T00:00:00Z' },
          { id: 'image_223456789', name: 'cover.jpg', mimeType: 'image/jpeg', size: '20', modifiedTime: '2026-01-01T00:00:00Z' },
        ] } };
        return { data: { files: [] } };
      },
      export: async () => ({ data: 'Title: Unit 12A\nStatus: Available\nProperty Type: Condominium\nLocation: Manila\nDescription: Ready.' }),
    },
  };
  const result = await previewDriveImport({ drive, supabase, rootFolderId: 'root_123456789', driveFolderUrlOrId: 'folder_123456789' });
  assert.equal(result.operation, 'create_draft');
  assert.equal(result.metadata.title, 'Unit 12A');
  assert.deepEqual(result.mediaManifest.map((file) => file.name), ['image-10.jpg', 'cover.jpg']);
  assert.equal(result.proposedCoverFileId, 'image_223456789');
  assert.deepEqual(supabase._writes, []);
});

test('preview rejects a folder with multiple metadata Docs', async () => {
  const drive = {
    files: {
      get: async ({ fileId }) => ({ data: { id: fileId, name: 'Folder', mimeType: fileId.startsWith('root') ? 'application/vnd.google-apps.folder' : 'application/vnd.google-apps.folder', parents: fileId.startsWith('root') ? [] : ['root_123456789'], trashed: false } }),
      list: async () => ({ data: { files: [
        { id: 'doc_123456789', name: 'A', mimeType: 'application/vnd.google-apps.document' },
        { id: 'doc_223456789', name: 'B', mimeType: 'application/vnd.google-apps.document' },
      ] } }),
    },
  };
  const result = await previewDriveImport({ drive, supabase: fakeSupabase(), rootFolderId: 'root_123456789', driveFolderUrlOrId: 'folder_123456789' });
  assert.equal(result.validation.ok, false);
  assert.ok(result.validation.errors.includes('multiple_metadata_documents'));
});

test('preview reports a missing metadata Doc as a commit-blocking error', async () => {
  const drive = {
    files: {
      get: async ({ fileId }) => ({ data: { id: fileId, name: 'Folder', mimeType: 'application/vnd.google-apps.folder', parents: fileId.startsWith('root') ? [] : ['root_123456789'], trashed: false } }),
      list: async () => ({ data: { files: [] } }),
    },
  };
  const result = await previewDriveImport({ drive, supabase: fakeSupabase(), rootFolderId: 'root_123456789', driveFolderUrlOrId: 'folder_123456789' });
  assert.ok(result.validation.errors.includes('missing_metadata_document'));
});
