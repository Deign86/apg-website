const PROPERTY_TYPES = new Set([
  'warehouse',
  'commercial_spaces',
  'office_spaces',
  'condominium',
  'house',
  'virtual_office',
  'lot',
]);

function text(value) {
  return value == null ? '' : String(value).trim();
}

function cleanDocumentText(value) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
    .trim();
}

function linesOf(value) {
  return cleanDocumentText(value).split('\n').map(line => line.trim()).filter(Boolean);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function numericTokenPattern() {
  return '(?:\\d{1,3}(?:,\\d{3})+|\\d+(?:\\.\\d+)?)';
}

function numericTokens(value) {
  const pattern = new RegExp(`${numericTokenPattern()}(?:\\s*[-–]\\s*${numericTokenPattern()})?`, 'g');
  return [...String(value || '').matchAll(pattern)].map(match => match[0]);
}

function numberValue(value) {
  const raw = String(value || '').replace(/,/g, '').trim();
  const match = raw.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  let result = Number(match[0]);
  if (/\d\s*[kK]\b/.test(raw)) result *= 1000;
  if (/\d\s*[mM]\b/.test(raw)) result *= 1000000;
  return Number.isFinite(result) ? result : null;
}

function firstNumber(value) {
  return numberValue(numericTokens(value)[0]);
}

function labelRegex(labels) {
  return new RegExp(`^\\s*(?:${labels.map(escapeRegExp).join('|')})\\s*[:\\-]?\\s*(.*)$`, 'i');
}

function labeledLines(lines, labels) {
  const matcher = labelRegex(labels);
  return lines
    .map((line, index) => ({ line, index, match: line.match(matcher) }))
    .filter(item => item.match)
    .map(item => ({ ...item, value: item.match[1].trim() }));
}

function parseFolderName(folderName) {
  const raw = text(folderName).replace(/^[\s*_+]+/, '').replace(/[\s_]+$/, '').trim();
  if (!raw) return { raw, city: '', locationArea: '', areaSqm: null, extraAreas: [], normalizedTitle: '' };

  const firstComma = raw.indexOf(',');
  const city = firstComma === -1 ? '' : raw.slice(0, firstComma).trim();
  const remainder = firstComma === -1 ? raw : raw.slice(firstComma + 1).trim();
  const areaTokens = numericTokens(remainder);
  const areas = areaTokens.map(numberValue).filter(value => value != null);
  const locationArea = remainder
    .replace(new RegExp(areaTokens.map(escapeRegExp).join('|'), 'g'), ' ')
    .replace(/[(),;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const areaSqm = areas[0] ?? null;
  const normalizedTitle = [city, locationArea, areaSqm != null ? `${areaSqm} sqm` : '']
    .filter(Boolean)
    .join(', ') || raw;
  return {
    raw,
    city,
    locationArea,
    areaSqm,
    extraAreas: areas.slice(1),
    normalizedTitle,
  };
}

function canonical(value) {
  return text(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function classifyStatus(pathSegments, documentText = '') {
  const pathText = canonical(pathSegments.join(' '));
  const docText = canonical(documentText);
  if (pathText.includes('sold') || /\bsold\b/.test(docText)) return 'Sold';
  if (pathText.includes('lease') || pathText.includes('rent') || /\bfor lease\b|\bfor rent\b/.test(docText)) return 'FOR_LEASE';
  if (pathText.includes('sale') || /\bfor sale\b/.test(docText)) return 'FOR_SALE';
  if (pathText.includes('available')) return 'Available';
  if (pathText.includes('virtual')) return 'Available';
  return '';
}

function classifyPropertyType(pathSegments, folderName = '', documentText = '') {
  const segments = pathSegments.map(canonical);
  const root = segments[0] || '';
  const rest = segments.slice(1).join(' ');
  const all = `${segments.join(' ')} ${canonical(folderName)} ${canonical(documentText)}`;
  if (root.includes('virtual')) return 'virtual_office';
  if (root.includes('warehouse') || rest.includes('warehouse')) return 'warehouse';
  if (root.includes('office') || rest.includes('office')) return 'office_spaces';
  if (root.includes('commercial') || rest.includes('commercial')) return 'commercial_spaces';
  if (root === 'lot' || /\blot\b/.test(rest)) return 'lot';
  if (root.includes('condo') || root.includes('house and lot')) {
    if (/\bhouse\b|\bhouse and lot\b/.test(rest) && !/\bcondo\b|\bcondominium\b/.test(rest)) return 'house';
    if (/\blot\b/.test(rest)) return 'lot';
    if (/\bhouse\b|\bhouse and lot\b/.test(all) && !/\bcondo\b|\bcondominium\b/.test(rest)) return 'house';
    return 'condominium';
  }
  if (/\bvirtual office\b/.test(all)) return 'virtual_office';
  if (/\bwarehouse\b/.test(all)) return 'warehouse';
  if (/\boffice\b/.test(all)) return 'office_spaces';
  if (/\bcommercial\b/.test(all)) return 'commercial_spaces';
  if (/\blot\b/.test(all)) return 'lot';
  if (/\bcondo\b|\bcondominium\b/.test(all)) return 'condominium';
  if (/\bhouse\b|\bhouse and lot\b/.test(all)) return 'house';
  return '';
}

function documentTitle(lines) {
  const ignored = new Set(['tab 1', 'property highlights', 'amenities', 'contact details', 'terms and conditions', 'notes']);
  return lines.find(line => {
    const value = line.replace(/^[-•*]+\s*/, '').trim();
    return value && !ignored.has(canonical(value)) && !/^location\s*:/i.test(value);
  })?.replace(/^[-•*]+\s*/, '').trim() || '';
}

function extractEmail(documentText) {
  return documentText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
}

function extractPhone(documentText) {
  const matches = documentText.match(/(?:\+63|0)\s*\d(?:[\d\s-]{7,})\d/g) || [];
  const unique = [...new Set(matches.map(value => value.replace(/\s+/g, ' ').trim()))];
  return unique.join(' | ');
}

function parseArea(lines, labels, warnings) {
  const candidates = labeledLines(lines, labels)
    .map(item => firstNumber(item.value))
    .filter(value => value != null);
  const unique = [...new Set(candidates)];
  if (unique.length > 1) warnings.push(`ambiguous_${labels[0].toLowerCase().replace(/\s+/g, '_')}`);
  return unique[0] ?? null;
}

function parsePrice(lines, status, warnings) {
  const statusLabels = status === 'FOR_SALE'
    ? ['selling price', 'sale price', 'transfer price', 'asking price', 'total price', 'price']
    : ['monthly rent', 'rent', 'lease rate', 'rental rate', 'asking price', 'price'];
  const preferred = labeledLines(lines, statusLabels);
  const values = [];
  for (const item of preferred) {
    const numeric = numericTokens(item.value).map(numberValue).filter(value => value != null);
    values.push(...numeric);
    if (!numeric.length) {
      for (const next of lines.slice(item.index + 1, item.index + 7)) {
        if (/^(?:property highlights|amenities|contact|location|terms|notes)\b/i.test(next)) break;
        if (/\u20b1|\bphp\b/i.test(next)) values.push(...numericTokens(next).map(numberValue).filter(value => value != null));
      }
    }
  }
  if (!values.length) {
    for (const line of lines) {
      if (!/\u20b1|\bphp\b/i.test(line)) continue;
      if (/phone|contact number|commission/i.test(line)) continue;
      values.push(...numericTokens(line).map(numberValue).filter(value => value != null));
    }
  }
  const unique = [...new Set(values)];
  if (unique.length > 1) warnings.push('ambiguous_price');
  return unique.length === 1 ? { value: unique[0], unit: 'PHP' } : { value: null, unit: unique.length ? 'PHP' : '' };
}

function parseDocumentMetadata({ documentText = '', folderName = '', pathSegments = [] } = {}) {
  const normalizedText = cleanDocumentText(documentText);
  const lines = linesOf(normalizedText);
  const folder = parseFolderName(folderName);
  const warnings = [];
  const status = classifyStatus(pathSegments, normalizedText);
  const propertyType = classifyPropertyType(pathSegments, folderName, normalizedText);
  const price = parsePrice(lines, status, warnings);
  const floorArea = parseArea(lines, ['floor area', 'total floor area', 'floor size'], warnings) ?? parseArea(lines, ['total area'], warnings);
  const lotArea = parseArea(lines, ['lot area', 'land area', 'lot size'], warnings);
  const location = labeledLines(lines, ['location', 'address'])[0]?.value || folder.city || folder.locationArea;
  const explicitPublished = labeledLines(lines, ['published', 'publish'])[0]?.value;
  const title = documentTitle(lines) || folder.normalizedTitle || folder.raw;
  const bedrooms = parseArea(lines, ['bedrooms', 'bedroom', 'beds', 'bed'], warnings);
  const bathrooms = parseArea(lines, ['bathrooms', 'bathroom', 'baths', 'bath'], warnings);
  const garage = parseArea(lines, ['garage', 'garages', 'parking', 'parking slots', 'carport'], warnings);
  const published = explicitPublished ? ['true', 'yes', '1', 'published'].includes(canonical(explicitPublished)) : null;
  return {
    title,
    propertyType,
    status,
    published,
    location,
    price: price.value,
    priceUnit: price.unit || 'PHP',
    floorArea,
    lotArea,
    beds: bedrooms,
    baths: bathrooms,
    garage,
    description: normalizedText,
    email: extractEmail(normalizedText),
    phone: extractPhone(normalizedText),
    folderCity: folder.city,
    folderLocationArea: folder.locationArea,
    folderAreaSqm: folder.areaSqm,
    folderExtraAreas: folder.extraAreas,
    normalizedTitle: folder.normalizedTitle,
    parseWarnings: warnings,
    documentText: normalizedText,
  };
}

function deriveListingMetadata({ folderName, pathSegments = [], documentText = '' } = {}) {
  const parsed = parseDocumentMetadata({ folderName, pathSegments, documentText });
  const floorArea = parsed.floorArea ?? (parsed.propertyType === 'commercial_spaces' || parsed.propertyType === 'office_spaces' || parsed.propertyType === 'warehouse' ? parsed.folderAreaSqm : null);
  return {
    title: parsed.title,
    propertyType: PROPERTY_TYPES.has(parsed.propertyType) ? parsed.propertyType : '',
    status: parsed.status,
    published: parsed.published,
    location: parsed.location || parsed.folderCity || parsed.folderLocationArea,
    price: parsed.price,
    priceUnit: parsed.priceUnit || 'PHP',
    floorArea,
    lotArea: parsed.lotArea,
    beds: parsed.beds,
    baths: parsed.baths,
    garage: parsed.garage,
    description: parsed.description,
    email: parsed.email,
    phone: parsed.phone,
    parseWarnings: parsed.parseWarnings,
    sourceDocumentText: parsed.documentText,
    sourceFolderName: text(folderName),
    sourcePath: pathSegments.join('\\'),
  };
}

module.exports = {
  PROPERTY_TYPES,
  cleanDocumentText,
  parseFolderName,
  classifyStatus,
  classifyPropertyType,
  parseDocumentMetadata,
  deriveListingMetadata,
};
