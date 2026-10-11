import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { RESUME_MAX_BYTES, RESUME_TOO_LARGE, resumeFileError } from '../../src/lib/resumeFile.ts';

const file = (name, size) => new File([new Uint8Array(size)], name);
const applicantsPhp = fs.readFileSync(new URL('../../api/applicants.php', import.meta.url), 'utf8');

describe('resumeFileError (src/lib/resumeFile.ts)', () => {
  it('accepts PDF, DOC and DOCX in any letter case', () => {
    for (const name of ['cv.pdf', 'cv.PDF', 'cv.doc', 'cv.Docx', 'my.final.cv.pdf']) {
      assert.equal(resumeFileError(file(name, 10)), null, name);
    }
  });

  it('rejects other extensions and names without one', () => {
    for (const name of ['cv.exe', 'cv.txt', 'cv.png', 'cv', 'cv.pdf.exe', '.pdf.zip']) {
      assert.match(resumeFileError(file(name, 10)) ?? '', /PDF, DOC, or DOCX/, name);
    }
  });

  it('rejects an empty file', () => {
    assert.match(resumeFileError(file('cv.pdf', 0)) ?? '', /empty/);
  });

  it('allows exactly 15 MB and rejects one byte more', () => {
    assert.equal(RESUME_MAX_BYTES, 15 * 1024 * 1024);
    assert.equal(resumeFileError(file('cv.pdf', RESUME_MAX_BYTES)), null);
    assert.equal(resumeFileError(file('cv.pdf', RESUME_MAX_BYTES + 1)), RESUME_TOO_LARGE);
  });

  it('matches the server: same 15 MB cap, and every client extension is allowed by api/applicants.php', () => {
    assert.match(applicantsPhp, /\$fileSize > 15 \* 1024 \* 1024/);
    const serverExts = JSON.parse(applicantsPhp.match(/\$allowedExts = (\[[^\]]+\])/)[1].replace(/'/g, '"'));
    for (const ext of ['pdf', 'doc', 'docx']) assert.ok(serverExts.includes(ext), ext);
  });
});
