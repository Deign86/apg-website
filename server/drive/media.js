import crypto from 'node:crypto';
import path from 'node:path';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MEDIA_EXTENSIONS = new Set([...IMAGE_EXTENSIONS, '.pdf']);

export function extensionFor(fileName) {
  return path.extname(String(fileName || '')).toLowerCase();
}

export function isSupportedMedia(file) {
  return MEDIA_EXTENSIONS.has(extensionFor(file?.name));
}

export function isImage(file) {
  return IMAGE_EXTENSIONS.has(extensionFor(file?.name));
}

export function mediaType(file) {
  if (extensionFor(file?.name) === '.pdf') {
    return /floor|plan|fp-/i.test(String(file?.name || '')) ? 'floor_plan' : 'brochure';
  }
  return 'image';
}

export function mimeTypeFor(file) {
  const ext = extensionFor(file?.name);
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.pdf') return 'application/pdf';
  return file?.mimeType || 'application/octet-stream';
}

export function checksumFor(buffer, md5Checksum) {
  if (md5Checksum) return { md5: md5Checksum, sha256: null };
  return { md5: null, sha256: crypto.createHash('sha256').update(buffer).digest('hex') };
}

export function stableStoragePath(folderId, fileId, fileName) {
  const safeName = String(fileName || 'asset')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/-+\./g, '.')
    .replace(/^-|-$/g, '')
    .slice(0, 160) || 'asset';
  return `properties/${folderId}/${fileId}/${safeName}`;
}

export function stableOfferingStoragePath(offeringId, fileId, fileName) {
  const safeName = String(fileName || 'asset')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/-+\./g, '.')
    .replace(/^-|-$/g, '')
    .slice(0, 160) || 'asset';
  return `properties/${offeringId}/${fileId}/${safeName}`;
}

export function orderMedia(files) {
  return [...files].sort((left, right) => {
    const leftName = String(left.name || '').toLowerCase();
    const rightName = String(right.name || '').toLowerCase();
    const leftNumber = leftName.match(/(?:^|[^0-9])(\d{1,5})(?:[^0-9]|$)/)?.[1];
    const rightNumber = rightName.match(/(?:^|[^0-9])(\d{1,5})(?:[^0-9]|$)/)?.[1];
    if (leftNumber && rightNumber && Number(leftNumber) !== Number(rightNumber)) return Number(leftNumber) - Number(rightNumber);
    if (leftNumber && !rightNumber) return -1;
    if (!leftNumber && rightNumber) return 1;
    return leftName.localeCompare(rightName, undefined, { numeric: true });
  });
}

export function chooseCover(files, existingDriveFileId = null) {
  const images = files.filter(isImage);
  const explicit = images.find((file) => /^(cover|hero|featured)(?:[-_. ]|$)/i.test(String(file.name || '')));
  if (explicit) return explicit;
  const existing = images.find((file) => file.id === existingDriveFileId);
  return existing || orderMedia(images)[0] || null;
}

export { IMAGE_EXTENSIONS, MEDIA_EXTENSIONS };
