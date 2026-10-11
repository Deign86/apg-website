// Minimal SMTP catch-all for the test PHP servers: accepts any AUTH, stores each message as
// <dir>/<timestamp>-<n>.eml, delivers nothing. Started by stack.mjs only when MAIL_SINK_DIR is set.
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';

let counter = 0;

export function startSmtpSink(port, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const server = net.createServer((socket) => {
    let buffer = '';
    let inData = false;
    let authSteps = 0;
    let data = [];
    const say = (line) => socket.write(`${line}\r\n`);
    say('220 apg-test-sink ESMTP');
    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      let i;
      while ((i = buffer.indexOf('\r\n')) !== -1) {
        const line = buffer.slice(0, i);
        buffer = buffer.slice(i + 2);
        if (inData) {
          if (line === '.') {
            inData = false;
            const name = `${new Date().toISOString().replace(/[-:.TZ]/g, '')}-${process.pid}-${counter++}.eml`;
            fs.writeFileSync(path.join(dir, name), data.join('\r\n'));
            data = [];
            say('250 queued');
          } else {
            data.push(line.startsWith('..') ? line.slice(1) : line);
          }
          continue;
        }
        const cmd = line.toUpperCase();
        if (authSteps > 0) {
          authSteps -= 1;
          say(authSteps === 0 ? '235 ok' : '334 UGFzc3dvcmQ6');
        } else if (cmd.startsWith('EHLO') || cmd.startsWith('HELO')) {
          say('250-apg-test-sink');
          say('250 AUTH LOGIN PLAIN');
        } else if (cmd.startsWith('AUTH')) {
          authSteps = 2;
          say('334 VXNlcm5hbWU6');
        } else if (cmd === 'DATA') {
          inData = true;
          say('354 end with .');
        } else if (cmd === 'QUIT') {
          say('221 bye');
          socket.end();
        } else {
          say('250 ok');
        }
      }
    });
    socket.on('error', () => {});
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}
