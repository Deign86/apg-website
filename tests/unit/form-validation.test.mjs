import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { emailError, nameError, phoneError, textError, urlError } from '../../src/lib/formValidation.ts';

const validationPhpUrl = new URL('../../api/lib/Validation.php', import.meta.url);

describe('nameError (src/lib/formValidation.ts)', () => {
  it('accepts real names, including accents, ñ, apostrophes, hyphens and periods', () => {
    for (const name of ['Juan Dela Cruz', 'José Ñiño', 'Ma. Teresa Santos', "O'Brien", 'O’Neil', 'Mary-Ann St. Claire', 'Lê Văn', '  Ana  ', 'Al']) {
      assert.equal(nameError(name), null, name);
    }
  });

  it('rejects empty, too short, too long, symbols/digits and names without 2 letters', () => {
    assert.equal(nameError(''), 'Name is required.');
    assert.equal(nameError('   '), 'Name is required.');
    assert.equal(nameError('A'), 'Name must be at least 2 characters.');
    assert.equal(nameError('a'.repeat(101)), 'Name must be 100 characters or fewer.');
    assert.equal(nameError('a'.repeat(100)), null);
    for (const name of ['Juan 2', 'E2E Tester', 'juan@site', 'Juan_Cruz', '<b>Juan</b>', 'Juan, Jr']) {
      assert.equal(nameError(name), 'Name can only contain letters, spaces, periods, apostrophes and hyphens.', name);
    }
    assert.equal(nameError('..'), 'Name must contain at least 2 letters.');
    assert.equal(nameError('a.'), 'Name must contain at least 2 letters.');
  });
});

describe('emailError (src/lib/formValidation.ts)', () => {
  it('accepts practical addresses (trimmed)', () => {
    for (const email of ['juan@example.com', 'first.last+tag@sub.example.ph', '  ana@apg.com.ph  ', 'x@y.co']) {
      assert.equal(emailError(email), null, email);
    }
  });

  it('rejects empty, overlong and malformed addresses', () => {
    assert.equal(emailError(''), 'Email is required.');
    assert.equal(emailError(`${'a'.repeat(245)}@example.com`), 'Email must be 254 characters or fewer.');
    for (const email of ['juan', 'juan@', '@example.com', 'juan@example', 'juan@example.c', 'ju an@example.com', 'a@b@example.com', 'juan@example.123', 'juan@.com', 'juan@example..com']) {
      assert.equal(emailError(email), 'Enter a valid email address, e.g. name@example.com.', email);
    }
  });
});

describe('phoneError (src/lib/formValidation.ts)', () => {
  it('accepts Philippine mobile and landline formats', () => {
    for (const phone of ['0917 555 0101', '+63 917 555 0101', '(02) 8650 2540', '8 650 2540', '09175550101', '+639175550101', '0917-555-0101', '02.8650.2540']) {
      assert.equal(phoneError(phone), null, phone);
    }
  });

  it('is required unless told otherwise', () => {
    assert.equal(phoneError(''), 'Phone number is required.');
    assert.equal(phoneError('  '), 'Phone number is required.');
    assert.equal(phoneError('', false), null);
    assert.equal(phoneError('123', false), 'Phone number must have 7 to 15 digits.');
  });

  it('rejects letters, a + after the start, and too few or too many digits', () => {
    for (const phone of ['0917abc5555', 'call me', '0917 555 0101 ext', '0917#5550101']) {
      assert.equal(phoneError(phone), 'Phone number can only contain digits, spaces, +, (, ), - and periods.', phone);
    }
    assert.equal(phoneError('63+917 555 0101'), 'A + is only allowed at the start of the phone number.');
    assert.equal(phoneError('++63 917 555 0101'), 'A + is only allowed at the start of the phone number.');
    assert.equal(phoneError('555 010'), 'Phone number must have 7 to 15 digits.');
    assert.equal(phoneError('1234567890123456'), 'Phone number must have 7 to 15 digits.');
    assert.equal(phoneError('123456789012345'), null);
  });
});

describe('textError (src/lib/formValidation.ts)', () => {
  it('enforces required, min and max with the field label', () => {
    const message = (v) => textError(v, { label: 'Message', required: true, min: 10, max: 5000 });
    assert.equal(message(''), 'Message is required.');
    assert.equal(message('   '), 'Message is required.');
    assert.equal(message('too short'), 'Message must be at least 10 characters.');
    assert.equal(message('  long enough  '), null);
    assert.equal(message('x'.repeat(5000)), null);
    assert.equal(message('x'.repeat(5001)), 'Message must be 5000 characters or fewer.');
  });

  it('lets an optional field stay empty but still checks what is typed', () => {
    assert.equal(textError('', { label: 'Subject', max: 200 }), null);
    assert.equal(textError('x'.repeat(201), { label: 'Subject', max: 200 }), 'Subject must be 200 characters or fewer.');
    assert.equal(textError('hi', { label: 'Notes', min: 10 }), 'Notes must be at least 10 characters.');
    assert.equal(textError('Commercial Office', { label: 'Facility type', required: true }), null);
  });
});

describe('urlError (src/lib/formValidation.ts)', () => {
  it('accepts http(s) URLs with a dotted host', () => {
    for (const url of ['https://example.com', 'http://www.apg.com.ph/path?q=1', '  https://portfolio.example.org/me  ']) {
      assert.equal(urlError(url), null, url);
    }
  });

  it('is optional unless required, and rejects other schemes, bare hosts, junk and overlong values', () => {
    assert.equal(urlError(''), null);
    assert.equal(urlError('', true), 'URL is required.');
    for (const url of ['example.com', 'ftp://example.com', 'javascript:alert(1)', 'http://localhost', 'not a url', 'https://']) {
      assert.equal(urlError(url), 'Enter a valid URL starting with http:// or https://.', url);
    }
    assert.equal(urlError(`https://example.com/${'a'.repeat(490)}`), 'URL must be 500 characters or fewer.');
  });
});

describe('server mirror (api/lib/Validation.php)', () => {
  const php = fs.readFileSync(validationPhpUrl, 'utf8');

  it('uses the same fixed messages as the client', () => {
    const ts = fs.readFileSync(new URL('../../src/lib/formValidation.ts', import.meta.url), 'utf8');
    const fixed = [...ts.matchAll(/'([^'$]+\.)'/g)].map((m) => m[1]);
    assert.ok(fixed.length >= 10, 'found the client messages');
    for (const message of fixed) {
      if (message.startsWith('Email') || message.startsWith('Enter a valid email')) continue; // email is checked with filter_var
      assert.ok(php.includes(message), `Validation.php is missing: ${message}`);
    }
  });

  const probe = spawnSync('php', ['-v'], { encoding: 'utf8' });
  it('returns the same result as the client for the same input', { skip: probe.status !== 0 && 'php CLI not available' }, () => {
    const cases = {
      name: ['Juan Dela Cruz', 'José Ñiño', 'O’Brien', 'A', 'E2E Tester', '..', '  Ana  ', 'a'.repeat(101)],
      phone: ['0917 555 0101', '+63 917 555 0101', '(02) 8650 2540', '8 650 2540', '0917abc', '63+917 5550101', '123', '', '1234567890123456'],
      url: ['https://example.com/x', 'ftp://a.b', 'http://localhost', 'not a url', '', 'http://exa mple.com'],
      text: ['', '  short ', 'long enough text', 'x'.repeat(5001)],
    };
    const script = `<?php require ${JSON.stringify(fileURLToPath(validationPhpUrl))};
      $c = json_decode(stream_get_contents(fopen('php://stdin', 'r')), true);
      echo json_encode([
        'name' => array_map('validationNameError', $c['name']),
        'phone' => array_map(fn($v) => validationPhoneError($v), $c['phone']),
        'url' => array_map(fn($v) => validationUrlError($v), $c['url']),
        'text' => array_map(fn($v) => validationTextError($v, 'Message', true, 10, 5000), $c['text']),
      ], JSON_UNESCAPED_UNICODE);`;
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'apg-validation-'));
    const file = path.join(dir, 'probe.php');
    fs.writeFileSync(file, script);
    try {
      const run = spawnSync('php', [file], { input: JSON.stringify(cases), encoding: 'utf8' });
      assert.equal(run.status, 0, run.stderr);
      assert.deepEqual(JSON.parse(run.stdout), {
        name: cases.name.map(nameError),
        phone: cases.phone.map((v) => phoneError(v)),
        url: cases.url.map((v) => urlError(v)),
        text: cases.text.map((v) => textError(v, { label: 'Message', required: true, min: 10, max: 5000 })),
      });
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
