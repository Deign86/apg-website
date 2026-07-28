import test from 'node:test';
import assert from 'node:assert/strict';
import { checksumFor, chooseCover, mediaType, orderMedia, stableStoragePath } from './media.js';

test('supports images and classifies PDFs', () => {
  assert.equal(mediaType({ name: 'floor-plan.pdf' }), 'floor_plan');
  assert.equal(mediaType({ name: 'brochure.pdf' }), 'brochure');
  assert.equal(mediaType({ name: 'cover.webp' }), 'image');
});

test('orders numeric filenames and prefers explicit cover names', () => {
  const files = [{ id: '3', name: 'image-10.jpg' }, { id: '1', name: 'image-2.jpg' }, { id: '2', name: 'cover.jpg' }, { id: '4', name: 'floor-plan.pdf' }];
  assert.deepEqual(orderMedia(files).map((file) => file.name), ['image-2.jpg', 'image-10.jpg', 'cover.jpg', 'floor-plan.pdf']);
  assert.equal(chooseCover(files).id, '2');
});

test('uses stable source identity and checksums', () => {
  assert.equal(stableStoragePath('folder', 'file', 'A photo!.jpg'), 'properties/folder/file/A-photo.jpg');
  assert.equal(checksumFor(Buffer.from('hello'), 'drive-md5').md5, 'drive-md5');
  assert.match(checksumFor(Buffer.from('hello')).sha256, /^[a-f0-9]{64}$/);
});
