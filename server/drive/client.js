import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';
import { readServerConfig } from '../config.js';

const FOLDER_MIME = 'application/vnd.google-apps.folder';
const GOOGLE_DOC_MIME = 'application/vnd.google-apps.document';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

function readCredentialValue(raw) {
  if (!raw) return null;
  const candidate = raw.trim();
  if (candidate.startsWith('{')) return JSON.parse(candidate);
  const filePath = path.resolve(process.cwd(), candidate);
  if (!fs.existsSync(filePath)) throw new Error(`Google credential file not found: ${filePath}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function getGoogleCredentials(config) {
  if (config.driveCredentialJson) return readCredentialValue(config.driveCredentialJson);
  if (config.driveCredentialFile) return readCredentialValue(config.driveCredentialFile);
  if (config.driveServiceAccountEmail && config.drivePrivateKey) {
    return { client_email: config.driveServiceAccountEmail, private_key: config.drivePrivateKey };
  }
  const error = new Error('Google Drive credentials are not configured');
  error.code = 'CONFIG_MISSING';
  throw error;
}

export function createDriveClient(env = process.env, overrideRootFolderId = null) {
  const config = readServerConfig(env);
  if (overrideRootFolderId) config.driveRootFolderId = String(overrideRootFolderId).trim();
  if (!config.driveRootFolderId) {
    const error = new Error('Missing server configuration: GOOGLE_DRIVE_FOLDER_ID');
    error.code = 'CONFIG_MISSING';
    throw error;
  }
  if (!config.driveCredentialJson && !config.driveCredentialFile && !(config.driveServiceAccountEmail && config.drivePrivateKey)) {
    const error = new Error('Missing server configuration: GOOGLE_CREDENTIALS');
    error.code = 'CONFIG_MISSING';
    throw error;
  }
  const credentials = getGoogleCredentials(config);
  if (!credentials?.client_email || !credentials?.private_key) {
    const error = new Error('Google service-account credentials are incomplete');
    error.code = 'CONFIG_MISSING';
    throw error;
  }
  const auth = new google.auth.GoogleAuth({
    credentials: { ...credentials, private_key: String(credentials.private_key).replace(/\\n/g, '\n') },
    scopes: [DRIVE_SCOPE],
  });
  return { drive: google.drive({ version: 'v3', auth }), config };
}

export async function getDriveFile(drive, fileId) {
  const response = await drive.files.get({
    fileId,
    fields: 'id,name,mimeType,modifiedTime,size,md5Checksum,trashed,parents,webViewLink',
    supportsAllDrives: true,
  });
  return response.data;
}

export async function listDriveChildren(drive, parentId) {
  const files = [];
  let pageToken;
  do {
    const response = await drive.files.list({
      q: `'${parentId}' in parents and trashed = false`,
      fields: 'nextPageToken,files(id,name,mimeType,modifiedTime,size,md5Checksum,parents,webViewLink)',
      pageSize: 1000,
      pageToken,
      orderBy: 'folder,name',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    files.push(...(response.data.files || []));
    pageToken = response.data.nextPageToken || undefined;
  } while (pageToken);
  return files;
}

export async function listDriveTree(drive, folderId, relativePath = '') {
  const files = [];
  for (const file of await listDriveChildren(drive, folderId)) {
    const filePath = relativePath ? `${relativePath}/${file.name}` : file.name;
    if (file.mimeType === FOLDER_MIME) {
      files.push(...await listDriveTree(drive, file.id, filePath));
    } else {
      files.push({ ...file, relativePath: filePath, sourceFolderId: folderId });
    }
  }
  return files;
}

export async function exportGoogleDoc(drive, fileId) {
  const response = await drive.files.export(
    { fileId, mimeType: 'text/plain' },
    { responseType: 'text' },
  );
  return String(response.data || '');
}

export async function downloadDriveFile(drive, fileId) {
  const response = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'arraybuffer' },
  );
  return Buffer.from(response.data);
}

export { FOLDER_MIME, GOOGLE_DOC_MIME, DRIVE_SCOPE };
