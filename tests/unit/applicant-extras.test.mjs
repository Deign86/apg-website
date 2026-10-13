import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PHOTO_MAX_BYTES, PHOTO_MIN_PX, jobAsksPortfolio, jobRequiresPhoto, parsePortfolioLinks, photoDimensionError, photoFileError, portfolioLinksError,
} from '../../src/lib/applicantExtras.ts';

const applicantsPhp = fs.readFileSync(new URL('../../api/applicants.php', import.meta.url), 'utf8');

describe('applicantExtras (src/lib/applicantExtras.ts)', () => {
  it('reads the 0/1 opening flags from API rows', () => {
    assert.equal(jobRequiresPhoto({ require_photo: 1 }), true);
    assert.equal(jobRequiresPhoto({ require_photo: '1' }), true);
    assert.equal(jobRequiresPhoto({ require_photo: 0 }), false);
    assert.equal(jobRequiresPhoto(null), false);
    assert.equal(jobAsksPortfolio({ ask_portfolio: true }), true);
    assert.equal(jobAsksPortfolio({}), false);
  });

  it('accepts square photos (within 3%) of at least 600x600', () => {
    for (const [w, h] of [[600, 600], [612, 600], [1200, 1200], [2000, 1950]]) assert.equal(photoDimensionError(w, h), null, `${w}x${h}`);
  });

  it('rejects non-square and small photos with the size in the message', () => {
    assert.match(photoDimensionError(800, 600), /square 2x2 ID photo; this one is 800x600/);
    assert.match(photoDimensionError(600, 900), /square/);
    assert.match(photoDimensionError(300, 300), /at least 600x600 pixels; this one is 300x300/);
    assert.match(photoDimensionError(0, 0), /square/);
  });

  it('checks the photo type and size before decoding', async () => {
    const file = (name, type, size) => new File([new Uint8Array(size)], name, { type });
    assert.match(await photoFileError(file('cv.pdf', 'application/pdf', 10)), /JPG or PNG/);
    assert.match(await photoFileError(file('me.gif', 'image/gif', 10)), /JPG or PNG/);
    assert.match(await photoFileError(file('me.png', 'image/png', 0)), /empty/);
    assert.match(await photoFileError(file('me.jpg', 'image/jpeg', PHOTO_MAX_BYTES + 1)), /under 5MB/);
  });

  it('splits portfolio links on newlines, commas and spaces, dropping blanks and duplicates', () => {
    assert.deepEqual(parsePortfolioLinks(' https://a.com,https://b.com\n\nhttps://a.com  https://c.com '), ['https://a.com', 'https://b.com', 'https://c.com']);
    assert.deepEqual(parsePortfolioLinks('   '), []);
  });

  it('validates portfolio links: optional, http(s) only, at most 5', () => {
    assert.equal(portfolioLinksError(''), null);
    assert.equal(portfolioLinksError('https://github.com/me\nhttp://me.example.com/work'), null);
    assert.match(portfolioLinksError('ftp://files.example.com'), /Portfolio link "ftp:\/\/files\.example\.com"/);
    assert.match(portfolioLinksError('github.com/me'), /Portfolio link/);
    assert.match(portfolioLinksError(Array.from({ length: 6 }, (_, i) => `https://s${i}.example.com`).join('\n')), /at most 5/);
  });

  it('matches the server rules in api/applicants.php', () => {
    assert.equal(PHOTO_MIN_PX, 600);
    assert.match(applicantsPhp, /min\(\$width, \$height\) < 600/);
    assert.match(applicantsPhp, /abs\(\$width \/ \$height - 1\) > 0\.03/);
    assert.match(applicantsPhp, /5 \* 1024 \* 1024/);
    assert.match(applicantsPhp, /count\(\$portfolioLinks\) > 5/);
  });
});
