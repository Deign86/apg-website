// Visitor chat (api/chat/start|message|poll.php) with the FAQ bot (Gemini off), live-agent handoff,
// and the admin console (api/admin/chat.php): claim, reply, close, and 409s on closed sessions.
import { before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Client, as, mailEnabled, waitForMail } from '../support/http.mjs';

const web = new Client();
let agent;
before(async () => { agent = await as('recruiter'); });

async function startChat(enterprise = 'corporate') {
  const res = await web.post('/api/chat/start.php', { json: { enterprise_slug: enterprise, visitor_name: 'QA Visitor' } });
  assert.equal(res.status, 200, res.text);
  return res.data.session;
}
const say = (token, message, extra = {}) => web.post('/api/chat/message.php', { json: { session_token: token, message, ...extra } });

describe('visitor chat + FAQ bot', () => {
  it('starts a session with a 32-hex token and restores it with its history', async () => {
    const session = await startChat('Swift Clear');
    assert.match(session.session_token, /^[0-9a-f]{32}$/);
    assert.equal(session.enterprise_slug, 'swiftclear');
    assert.equal(session.status, 'bot');
    await say(session.session_token, 'Do you do pest control?');
    const restored = await web.post('/api/chat/start.php', { json: { session_token: session.session_token, enterprise_slug: 'swiftclear' } });
    assert.equal(restored.data.session.id, session.id);
    assert.ok(restored.data.messages.length >= 2);
  });

  it('answers FAQs from live data: Virtual Office plans with database prices, contact numbers', async () => {
    const vo = (await web.get('/api/services.php?category=virtual-office')).data.data;
    const silver = vo.find((s) => /silver/i.test(s.title));
    const { session_token: token } = await startChat('virtual-office');
    const reply = await say(token, 'What virtual office packages do you offer?');
    assert.equal(reply.status, 200);
    assert.equal(reply.data.handoff, false);
    assert.ok(reply.data.reply.includes(silver.price), reply.data.reply);
    const phone = await say(token, 'What is your phone number?');
    assert.match(phone.data.reply, /\d{4} \d{3} \d{4}/);
  });

  it('validates messages', async () => {
    const { session_token: token } = await startChat();
    assert.equal((await say(token, '')).status, 400);
    assert.equal((await say(token, 'x'.repeat(2001))).status, 400);
    assert.equal((await say('', 'hi')).status, 400);
    assert.equal((await say('f'.repeat(32), 'hi')).status, 404);
    assert.ok((await web.post('/api/chat/message.php', { json: { session_token: [token], message: ['hi'] } })).status < 500);
    assert.equal((await web.get('/api/chat/poll.php')).status, 400);
    assert.equal((await web.get(`/api/chat/poll.php?session_token=${'0'.repeat(32)}`)).status, 404);
  });
});

describe('live agent handoff + admin console', () => {
  it('handoff -> claim -> reply -> close; closed sessions answer 409 to the console and 400 to the visitor', async () => {
    const session = await startChat('realty');
    const since = Date.now();
    const handoff = await say(session.session_token, 'I want to talk to a human agent please');
    assert.equal(handoff.status, 200);
    assert.equal(handoff.data.handoff, true);
    assert.equal(handoff.data.status, 'waiting_for_agent');
    if (mailEnabled) await waitForMail((m) => m.subject.startsWith('[Live chat]') && m.to.includes('inbox@apg.test'), { since });

    const queue = (await agent.get('/api/admin/chat.php?status=waiting_for_agent')).data;
    assert.ok(queue.data.some((s) => s.id === session.id));
    assert.equal(typeof queue.summary.waiting, 'number');

    const claim = await agent.post('/api/admin/chat.php', { json: { action: 'claim', session_id: session.id } });
    assert.equal(claim.status, 200, claim.text);
    assert.equal(claim.data.status, 'agent_active');
    const reply = await agent.post('/api/admin/chat.php', { json: { action: 'message', session_id: session.id, body: 'Hello from QA agent' } });
    assert.equal(reply.status, 200);
    const poll = (await web.get(`/api/chat/poll.php?session_token=${session.session_token}`)).data;
    assert.equal(poll.status, 'agent_active');
    assert.ok(poll.messages.some((m) => m.sender === 'admin' && m.body === 'Hello from QA agent'));
    const visitor = await say(session.session_token, 'thanks');
    assert.equal(visitor.data.reply, null, 'no bot reply while an agent is active');
    const thread = (await agent.get(`/api/admin/chat.php?session_id=${session.id}&after_id=${reply.data.message_id}`)).data;
    assert.deepEqual(thread.messages.map((m) => m.body), ['thanks']);

    assert.equal((await agent.post('/api/admin/chat.php', { json: { action: 'message', session_id: session.id, body: ' ' } })).status, 400);
    assert.equal((await agent.post('/api/admin/chat.php', { json: { action: 'message', session_id: session.id, body: 'x'.repeat(2001) } })).status, 400);
    assert.equal((await agent.post('/api/admin/chat.php', { json: { action: 'dance', session_id: session.id } })).status, 400);

    const close = await agent.post('/api/admin/chat.php', { json: { action: 'close', session_id: session.id } });
    assert.equal(close.status, 200);
    assert.equal(close.data.status, 'closed');
    for (const action of ['close', 'claim', 'message']) {
      const res = await agent.post('/api/admin/chat.php', { json: { action, session_id: session.id, body: 'late' } });
      assert.equal(res.status, 409, action);
    }
    const late = await say(session.session_token, 'hello?');
    assert.equal(late.status, 400);
    assert.equal(late.data.session_closed, true);
    const final = (await web.get(`/api/chat/poll.php?session_token=${session.session_token}`)).data;
    assert.equal(final.status, 'closed');
    assert.ok(final.closed_at);
  });

  it('console validates ids', async () => {
    assert.equal((await agent.post('/api/admin/chat.php', { json: { action: 'claim', session_id: 0 } })).status, 400);
    assert.equal((await agent.post('/api/admin/chat.php', { json: { action: 'claim', session_id: 2147483000 } })).status, 404);
    assert.equal((await agent.get('/api/admin/chat.php?session_id=2147483000')).status, 404);
    assert.ok((await agent.post('/api/admin/chat.php', { json: { action: ['claim'], session_id: 2147483000 } })).status < 500);
  });
});
