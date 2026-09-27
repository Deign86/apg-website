const baseUrl = (process.env.CHAT_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
const adminCookie = process.env.ADMIN_COOKIE;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, { method = 'GET', body, cookie } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`${method} ${path} returned non--JSON response (HTTP ${response.status})`);
  }
  return { response, data };
}

async function run() {
  const start = await request('/api/chat/start.php', { method: 'POST', body: {} });
  if (start.data?.success === false && /database/i.test(start.data.error || '')) {
    console.log(`SKIP chat takeover E2E: database unavailable (${start.data.error})`);
    return;
  }

  assert(start.response.ok && start.data.success === true, `start failed: ${JSON.stringify(start.data)}`);
  const sessionToken = start.data.session?.session_token;
  assert(typeof sessionToken === 'string' && sessionToken.length > 0, 'start did not return session.session_token');
  assert(start.data.session.status === 'bot', `expected initial status bot, received ${start.data.session.status}`);
  console.log('PASS start creates a bot session');

  const firstVisitorMessage = await request('/api/chat/message.php', {
    method: 'POST',
    body: { session_token: sessionToken, message: 'zxqv blorf snargle 94731' },
  });
  assert(firstVisitorMessage.response.ok && firstVisitorMessage.data.success === true, `first visitor message failed: ${JSON.stringify(firstVisitorMessage.data)}`);
  assert(firstVisitorMessage.data.status === 'bot', `expected first unmatched message status bot, received ${firstVisitorMessage.data.status}`);
  assert(firstVisitorMessage.data.handoff === false, `expected first unmatched message handoff false, received ${JSON.stringify(firstVisitorMessage.data.handoff)}`);
  assert(typeof firstVisitorMessage.data.reply === 'string' && firstVisitorMessage.data.reply.length > 0 && firstVisitorMessage.data.reply.includes("didn't quite catch"), 'first unmatched message did not return the expected fallback reply');

  const secondVisitorMessage = await request('/api/chat/message.php', {
    method: 'POST',
    body: { session_token: sessionToken, message: 'qwxz plugh morp 58210' },
  });
  assert(secondVisitorMessage.response.ok && secondVisitorMessage.data.success === true, `second visitor message failed: ${JSON.stringify(secondVisitorMessage.data)}`);
  assert(secondVisitorMessage.data.status === 'waiting_for_agent', `expected second unmatched message status waiting_for_agent, received ${secondVisitorMessage.data.status}`);
  assert(secondVisitorMessage.data.handoff === true, `expected second unmatched message handoff true, received ${JSON.stringify(secondVisitorMessage.data.handoff)}`);
  assert(typeof secondVisitorMessage.data.reply === 'string' && secondVisitorMessage.data.reply.length > 0 && secondVisitorMessage.data.reply.includes('live representative'), 'second unmatched message did not return the expected handoff reply');
  console.log('PASS consecutive unmatched messages trigger handoff after the fallback response');

  const firstPoll = await request(`/api/chat/poll.php?session_token=${encodeURIComponent(sessionToken)}&after_id=0`);
  assert(firstPoll.response.ok && firstPoll.data.success === true, `initial poll failed: ${JSON.stringify(firstPoll.data)}`);
  assert(firstPoll.data.status === 'waiting_for_agent', `poll status did not show waiting_for_agent: ${firstPoll.data.status}`);
  assert(firstPoll.data.messages.some((message) => message.sender === 'visitor' && message.body === 'zxqv blorf snargle 94731'), 'poll did not return the visitor message');
  assert(firstPoll.data.messages.some((message) => message.sender === 'visitor' && message.body === 'qwxz plugh morp 58210'), 'poll did not return the second visitor message');
  assert(firstPoll.data.messages.some((message) => message.sender === 'bot'), 'poll did not return a bot message');
  let lastSeenMessageId = Math.max(0, ...firstPoll.data.messages.map((message) => Number(message.id) || 0));
  console.log('PASS poll exposes the visitor message and waiting state');

  if (!adminCookie) {
    console.log('SKIP admin claim/reply/close assertions: ADMIN_COOKIE is not set');
    return;
  }

  async function adminAction(action, values = {}) {
    return request('/api/admin/chat.php', {
      method: 'POST',
      cookie: adminCookie,
      body: { action, session_id: start.data.session.id, ...values },
    });
  }

  const claim = await adminAction('claim');
  assert(claim.response.ok && claim.data.success === true && claim.data.status === 'agent_active', `admin claim failed: ${JSON.stringify(claim.data)}`);

  const activeVisitorMessage = await request('/api/chat/message.php', {
    method: 'POST',
    body: { session_token: sessionToken, message: 'Please review my request' },
  });
  assert(activeVisitorMessage.response.ok && activeVisitorMessage.data.success === true, `visitor message during agent session failed: ${JSON.stringify(activeVisitorMessage.data)}`);
  assert(activeVisitorMessage.data.status === 'agent_active' && activeVisitorMessage.data.reply === null, 'visitor message during agent_active received a bot reply or wrong status');

  const adminReplyText = `E2E admin reply ${Date.now()}`;
  const adminReply = await adminAction('message', { body: adminReplyText });
  assert(adminReply.response.ok && adminReply.data.success === true && adminReply.data.status === 'agent_active', `admin reply failed: ${JSON.stringify(adminReply.data)}`);

  const activePoll = await request(`/api/chat/poll.php?session_token=${encodeURIComponent(sessionToken)}&after_id=${lastSeenMessageId}`);
  assert(activePoll.response.ok && activePoll.data.success === true, `poll after admin reply failed: ${JSON.stringify(activePoll.data)}`);
  assert(activePoll.data.status === 'agent_active', `expected agent_active in poll, received ${activePoll.data.status}`);
  assert(activePoll.data.messages.some((message) => message.sender === 'admin' && message.body === adminReplyText), 'visitor poll did not return the admin reply');
  lastSeenMessageId = Math.max(lastSeenMessageId, ...activePoll.data.messages.map((message) => Number(message.id) || 0));

  const close = await adminAction('close');
  assert(close.response.ok && close.data.success === true && close.data.status === 'closed', `admin close failed: ${JSON.stringify(close.data)}`);

  const afterClose = await request('/api/chat/message.php', {
    method: 'POST',
    body: { session_token: sessionToken, message: 'Message after close' },
  });
  assert(afterClose.data.success === false && afterClose.data.session_closed === true, `expected session_closed error after close: ${JSON.stringify(afterClose.data)}`);
  console.log('PASS admin claim, active visitor message, admin reply, close, and closed-session rejection');
}

run().catch((error) => {
  console.error(`FAIL chat takeover E2E: ${error.message}`);
  process.exitCode = 1;
});
