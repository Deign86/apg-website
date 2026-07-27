import { exportGoogleDoc, GOOGLE_DOC_MIME } from './client.js';

const FIELD_LABELS = {
  title: ['title', 'property name', 'name'],
  listing_status: ['status', 'availability', 'availability status'],
  property_type: ['property type', 'type'],
  transaction_type: ['transaction type', 'transaction', 'tenure'],
  price: ['price'],
  location: ['location', 'address'],
  bedrooms: ['bedrooms', 'bedroom', 'br'],
  bathrooms: ['bathrooms', 'bathroom', 'bath'],
  floor_area: ['floor area', 'floor size', 'area'],
  lot_area: ['lot area', 'lot size'],
  description: ['description', 'overview'],
};

const ALL_LABELS = Object.values(FIELD_LABELS).flat();
const STATUS_ALIASES = new Map([
  ['available', 'Available'], ['active', 'Available'], ['published', 'Available'],
  ['for sale', 'FOR_SALE'], ['sale', 'FOR_SALE'], ['for lease', 'FOR_LEASE'],
  ['for rent', 'FOR_LEASE'], ['lease', 'FOR_LEASE'], ['rent', 'FOR_LEASE'],
  ['sold', 'Sold'], ['closed', 'Closed'], ['draft', 'Draft'], ['unavailable', 'Closed'],
]);

const TRANSACTION_ALIASES = new Map([
  ['sale', 'sale'], ['for sale', 'sale'],
  ['rent', 'rent'], ['for rent', 'rent'],
  ['lease', 'lease'], ['for lease', 'lease'],
]);

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanText(value) {
  return String(value || '').replace(/\u00a0/g, ' ').replace(/\r/g, '').trim();
}

function fieldMatcher(labels = ALL_LABELS) {
  const source = labels.slice().sort((a, b) => b.length - a.length).map(escapeRegExp).join('|');
  return new RegExp(`^\\s*(?:${source})\\s*(?::|-)\\s*(.*)$`, 'i');
}

function parseLines(text) {
  return cleanText(text).split('\n').map((line) => line.trimEnd());
}

function findField(lines, labels) {
  const matcher = fieldMatcher(labels);
  const index = lines.findIndex((line) => matcher.test(line));
  if (index < 0) return null;
  const match = lines[index].match(matcher);
  return { index, value: String(match?.[1] || '').trim() };
}

function valueOrNull(value) {
  const normalized = cleanText(value);
  return normalized || null;
}

export function normalizeStatus(value) {
  const normalized = cleanText(value).toLowerCase().replace(/[_-]+/g, ' ');
  return STATUS_ALIASES.get(normalized) || (normalized ? 'Draft' : null);
}

export function normalizeTransactionType(value) {
  const normalized = cleanText(value).toLowerCase().replace(/[_-]+/g, ' ');
  return TRANSACTION_ALIASES.get(normalized) || null;
}

export function parseInteger(value) {
  const normalized = cleanText(value);
  if (/-?\d+\.\d+/.test(normalized)) return null;
  const match = normalized.match(/^-?\d+/);
  if (!match) return null;
  const parsed = Number.parseInt(match[0], 10);
  return Number.isInteger(parsed) ? parsed : null;
}

export function parseDisplayNumber(value) {
  const normalized = cleanText(value).replace(/,/g, '');
  const match = normalized.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseDescriptionBlock(text) {
  const lines = parseLines(text);
  const found = findField(lines, FIELD_LABELS.description);
  if (!found) return null;
  const output = [];
  if (found.value) output.push(found.value);
  for (const line of lines.slice(found.index + 1)) {
    if (fieldMatcher(ALL_LABELS).test(line)) break;
    if (line.trim()) output.push(line.trim());
  }
  return valueOrNull(output.join('\n'));
}

export function parseListingMetadata(text) {
  const lines = parseLines(text);
  const read = (field) => valueOrNull(findField(lines, FIELD_LABELS[field])?.value);
  const warnings = [];
  const bedroomsRaw = read('bedrooms');
  const bathroomsRaw = read('bathrooms');
  const bedrooms = parseInteger(bedroomsRaw);
  const bathrooms = parseInteger(bathroomsRaw);
  if (bedroomsRaw && bedrooms == null) warnings.push('invalid_bedrooms');
  if (bathroomsRaw && bathrooms == null) warnings.push('invalid_bathrooms');
  const priceText = read('price');
  const availabilityStatus = normalizeStatus(read('listing_status'));
  const transactionRaw = read('transaction_type');
  const transactionType = normalizeTransactionType(transactionRaw) || normalizeTransactionType(availabilityStatus);
  if (transactionRaw && !transactionType) warnings.push('invalid_transaction_type');
  return {
    title: read('title'),
    status: availabilityStatus,
    availability_status: availabilityStatus,
    // Kept as a compatibility alias for existing callers; this is not the DB lifecycle.
    listing_status: availabilityStatus,
    property_type: read('property_type'),
    transaction_type: transactionType,
    price: parseDisplayNumber(priceText),
    price_text: priceText,
    location: read('location'),
    bedrooms,
    bathrooms,
    floor_area: read('floor_area'),
    lot_area: read('lot_area'),
    description: parseDescriptionBlock(text),
    warnings,
  };
}

export function validateListingMetadata(metadata) {
  const missing = [];
  if (!metadata?.title) missing.push('title');
  if (!metadata?.listing_status) missing.push('status');
  if (!metadata?.location && !metadata?.description) missing.push('location_or_description');
  return { publishable: missing.length === 0, missing };
}

export function mergeListingMetadata(existing, parsed, folderName) {
  const fallbackTitle = cleanText(folderName) || null;
  return {
    title: parsed.title || existing?.title || fallbackTitle,
    status: parsed.availability_status || parsed.status || existing?.status || null,
    listing_status: existing?.listing_status || 'draft',
    property_type: parsed.property_type || existing?.property_type || null,
    transaction_type: parsed.transaction_type || existing?.transaction_type || null,
    price: parsed.price ?? existing?.price ?? null,
    location: parsed.location || existing?.location || null,
    bedrooms: parsed.bedrooms ?? existing?.bedrooms ?? existing?.beds ?? null,
    bathrooms: parsed.bathrooms ?? existing?.bathrooms ?? existing?.baths ?? null,
    floor_area: parsed.floor_area || existing?.floor_area || null,
    lot_area: parsed.lot_area || existing?.lot_area || null,
    description: parsed.description || existing?.description || null,
  };
}

export async function extractDocMetadata(drive, fileId) {
  const text = await exportGoogleDoc(drive, fileId);
  return { text, metadata: parseListingMetadata(text), validation: validateListingMetadata(parseListingMetadata(text)) };
}

export { FIELD_LABELS, GOOGLE_DOC_MIME };
