import test from 'node:test';
import assert from 'node:assert/strict';
import { handleContact, handleCareerApply } from './contact-handler.js';
import { readServerConfig } from './config.js';
import { HttpError } from './http.js';

test('readServerConfig defaults companyEmail to thealphapremiergroup@gmail.com', () => {
  const config = readServerConfig({});
  assert.equal(config.companyEmail, 'thealphapremiergroup@gmail.com');
});

test('handleContact validates required fields', async () => {
  const res = await handleContact({});
  assert.equal(res.status, 400);
  assert.equal(res.data.success, false);
});

test('handleContact succeeds with valid payload', async () => {
  const mockInserted = [];
  const mockSupabase = {
    from: (table) => ({
      insert: async (row) => {
        mockInserted.push({ table, row });
        return { error: null };
      }
    })
  };

  const res = await handleContact(
    { name: 'John Doe', email: 'john@example.com', message: 'Hello APG' },
    { supabase: mockSupabase, config: { resendApiKey: null, companyEmail: 'thealphapremiergroup@gmail.com' } }
  );

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(res.data.ticket.startsWith('APR-'));
  assert.equal(mockInserted.length, 1);
  assert.equal(mockInserted[0].row.name, 'John Doe');
});

test('handleCareerApply validates required fields', async () => {
  const res = await handleCareerApply({});
  assert.equal(res.status, 400);
  assert.equal(res.data.success, false);
});

test('handleCareerApply succeeds and saves to inquiries', async () => {
  const mockInserted = [];
  const mockUploaded = [];
  const mockSupabase = {
    from: (table) => ({
      insert: async (row) => {
        mockInserted.push({ table, row });
        return { error: null };
      }
    }),
    storage: {
      from: (bucket) => ({
        upload: async (path, buffer, options) => {
          mockUploaded.push({ bucket, path, buffer, options });
          return { error: null };
        }
      })
    }
  };

  const res = await handleCareerApply(
    {
      name: 'Maria Santos',
      email: 'maria@example.com',
      phone: '09171234567',
      role: 'Property Consultant',
      coverLetter: 'Experienced real estate advisor.',
      resumeBase64: 'data:application/pdf;base64,JVBERi0xLjQK',
      resumeFileName: 'resume.pdf',
      resumeMime: 'application/pdf'
    },
    { supabase: mockSupabase, config: { resendApiKey: null, companyEmail: 'thealphapremiergroup@gmail.com' } }
  );

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(res.data.ticket.startsWith('APR-'));
  assert.equal(mockUploaded.length, 1);
  assert.equal(mockUploaded[0].bucket, 'applicant-resumes');
  assert.equal(mockInserted.length, 1);
  assert.equal(mockInserted[0].row.source, 'career_application');
  assert.equal(mockInserted[0].row.name, 'Maria Santos');
});

test('HttpError sets status and code correctly', () => {
  const err = new HttpError('Test error', 404, 'not_found');
  assert.equal(err.message, 'Test error');
  assert.equal(err.status, 404);
  assert.equal(err.code, 'not_found');
});
