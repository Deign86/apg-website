import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildCronCommand, classifyLog } from '../../tools/hostinger-release-deploy.mjs';

describe('buildCronCommand', () => {
  it('uses the curl-and-bash form Hostinger accepts, under 255 characters', () => {
    const cmd = buildCronCommand('deploy-2026-10-26-123');
    assert.equal(
      cmd,
      'curl -fsSL -o /home/u501100418/hostinger-update.sh https://github.com/Deign86/apg-website/releases/download/deploy-2026-10-26-123/hostinger-update.sh && /bin/bash /home/u501100418/hostinger-update.sh deploy-2026-10-26-123',
    );
    assert.ok(cmd.length <= 255);
    assert.doesNotMatch(cmd, /[%|<>]/);
    assert.doesNotMatch(cmd, /raw\.githubusercontent/);
  });

  it('rejects tags that could break the crontab line', () => {
    assert.throws(() => buildCronCommand('bad tag'));
    assert.throws(() => buildCronCommand('tag%1'));
    assert.throws(() => buildCronCommand('a'.repeat(200)), /255/);
  });
});

describe('classifyLog', () => {
  const tag = 'deploy-2026-10-26-123';
  it('is pending while the log belongs to an earlier deploy', () => {
    assert.deepEqual(classifyLog('== deploy-2026-10-20-1 start\n== deploy-2026-10-20-1 done\n', tag), { state: 'pending' });
    assert.deepEqual(classifyLog('', tag), { state: 'pending' });
  });
  it('is done when the script logged its done line, keeping non-fatal warnings', () => {
    const log = `== ${tag} start Mon\nbackup: releases/db-pre-${tag}.sql.gz (1M)\n== ${tag} done Mon\n`;
    assert.deepEqual(classifyLog(log, tag), { state: 'done', warnings: [] });
    const warned = `== ${tag} start\ndb backup failed; data fixes skipped: php x\n== ${tag} done\n`;
    assert.equal(classifyLog(warned, tag).state, 'done');
    assert.equal(classifyLog(warned, tag).warnings.length, 1);
  });
  it('treats a re-run of an already deployed tag as done', () => {
    assert.equal(classifyLog(`== ${tag} start\nalready deployed\n`, tag).state, 'done');
  });
  it('fails when the script exited before its done line', () => {
    assert.equal(classifyLog(`== ${tag} start\ncurl: (22) The requested URL returned error: 404\n`, tag).state, 'failed');
  });
});
