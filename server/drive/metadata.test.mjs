import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeListingMetadata, normalizeStatus, parseDescriptionBlock, parseInteger, parseListingMetadata, validateListingMetadata } from './metadata.js';

test('parses structured listing metadata with multiline description', () => {
  const result = parseListingMetadata(`Title: The Grove Residences Unit 12A
status - Available
Property Type: Condominium
Price: PHP 8,500,000
Location: Quezon City, Metro Manila
BR: 2
Bathrooms: 2
Floor Area: 74 sqm
Lot Area:
Description:
Modern two-bedroom condominium near key commercial districts.
Includes one parking slot and access to building amenities.`);
  assert.equal(result.title, 'The Grove Residences Unit 12A');
  assert.equal(result.listing_status, 'Available');
  assert.equal(result.availability_status, 'Available');
  assert.equal(result.price, 8500000);
  assert.equal(result.bedrooms, 2);
  assert.equal(result.bathrooms, 2);
  assert.equal(result.lot_area, null);
  assert.match(result.description, /key commercial districts/);
  assert.match(result.description, /access to building amenities/);
  assert.deepEqual(validateListingMetadata(result), { publishable: true, missing: [] });
});

test('parses mixed-case labels and keeps invalid numeric fields as null with warnings', () => {
  const result = parseListingMetadata('pRoPeRtY nAmE: Sample\nSTATUS: For Lease\nLOCATION: Pasig\nBedroom: many\nBath: 1');
  assert.equal(result.listing_status, 'FOR_LEASE');
  assert.equal(result.availability_status, 'FOR_LEASE');
  assert.equal(result.transaction_type, 'lease');
  assert.equal(result.bedrooms, null);
  assert.deepEqual(result.warnings, ['invalid_bedrooms']);
  assert.equal(parseInteger('2 bedrooms'), 2);
  assert.equal(parseInteger('2.5'), null);
});

test('keeps Drive availability separate from the canonical listing lifecycle', () => {
  const result = parseListingMetadata(`Title: Rental Unit
Status: Available
Property Type: Condominium
Transaction Type - Rent
Price: Contact for price
Location: Manila`);
  assert.equal(result.availability_status, 'Available');
  assert.equal(result.status, 'Available');
  assert.equal(result.listing_status, 'Available');
  assert.equal(result.transaction_type, 'rent');
  assert.equal(result.price, null);
  assert.equal(result.price_text, 'Contact for price');
});

test('normalizes statuses and preserves existing values when Drive leaves fields blank', () => {
  assert.equal(normalizeStatus('FOR-SALE'), 'FOR_SALE');
  assert.equal(normalizeStatus('unknown'), 'Draft');
  assert.equal(parseDescriptionBlock('Description:\n\nStatus: Available'), null);
  const merged = mergeListingMetadata({ title: 'Existing', price: 100, description: 'Keep me' }, { listing_status: 'Available', price: null, description: null }, 'Folder');
  assert.deepEqual(merged, {
    title: 'Existing', status: null, listing_status: 'draft', property_type: null, transaction_type: null, price: 100, location: null,
    bedrooms: null, bathrooms: null, floor_area: null, lot_area: null, description: 'Keep me',
  });
});

test('requires title, status, and location or description for publication', () => {
  assert.deepEqual(validateListingMetadata({ title: 'Draft', listing_status: 'Draft' }), {
    publishable: false,
    missing: ['location_or_description'],
  });
});
