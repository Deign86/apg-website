// `npm run test:api`: boots the isolated stack (fresh test DB + PHP test servers), runs the node:test
// API suite against it, and always tears the stack down. Extra args are passed to `node --test`
// (e.g. `npm run test:api -- --test-name-pattern=inquir`).
import { spawn } from 'node:child_process';
import { startStack } from './support/stack.mjs';
import { ROOT } from './support/env.mjs';

const stop = await startStack();
let code = 1;
try {
  code = await new Promise((resolve) => {
    const child = spawn(process.execPath, [
      '--test', '--test-reporter=spec', '--test-concurrency=4', ...process.argv.slice(2), 'tests/api/**/*.test.mjs',
    ], { cwd: ROOT, stdio: 'inherit', env: process.env });
    child.on('exit', (c) => resolve(c ?? 1));
  });
} finally {
  await stop();
}
process.exit(code);
