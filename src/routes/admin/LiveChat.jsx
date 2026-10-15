import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import StatusPill from '@/components/admin/StatusPill';
import PageHeader from '@/components/admin/PageHeader';
import ChatText from '@/components/ChatText';
import { ENTERPRISE_TABS } from '@/data/enterprises';
import {
  RefreshCw,
  Hourglass,
  Zap,
  CheckCircle2,
  X,
  Send,
  Lock,
  Clock,
  MessagesSquare,
  List,
  MessageCircle,
} from 'lucide-react';

const ENTERPRISE_NAMES = Object.fromEntries(ENTERPRISE_TABS.map(e => [e.slug, e.name]));

const STATUS_TABS = [
  { id: 'waiting_for_agent', label: 'Waiting', Icon: Clock },
  { id: 'agent_active', label: 'Active', Icon: MessagesSquare },
  { id: 'closed', label: 'Closed', Icon: CheckCircle2 },
  { id: 'all', label: 'All', Icon: List },
];

function formatWaitTime(seconds) {
  if (seconds == null || !Number.isFinite(Number(seconds)) || Number(seconds) < 0) return 'Just now';
  const totalSeconds = Math.floor(Number(seconds));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s}s`;
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

const MESSAGE_TIME = new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit' });

/** MySQL DATETIME (Asia/Manila, zone-less) -> "3:05 PM"; same convention as InquiriesManager when(). */
function formatMessageTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(String(dateStr).replace(' ', 'T') + '+08:00');
  return Number.isNaN(d.getTime()) ? '' : MESSAGE_TIME.format(d);
}

/** Closed conversations are read newest first, this many per request ("Load older" for the rest). */
const CLOSED_PAGE_SIZE = 50;

/** One queue row. Memoized: a poll re-renders only rows whose data changed (closed rows never do). */
const SessionItem = React.memo(function SessionItem({ session: s, isSelected, onSelect }) {
  const isWaiting = s.status === 'waiting_for_agent';
  const hasVisitor = s.visitor_name || s.visitor_email;

  return (
    <button
      type="button"
      aria-current={isSelected || undefined}
      className={`admin-chat-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(s.id)}
    >
      <span className="admin-chat-item-header">
        <span className="admin-chat-enterprise">{ENTERPRISE_NAMES[s.enterprise_slug] || s.enterprise_slug}</span>
        {isWaiting ? (
          <span className="admin-chat-wait-time tabular-nums">
            <Hourglass className="size-3.5" aria-hidden="true" /> Waiting {formatWaitTime(s.wait_seconds)}
          </span>
        ) : (
          <StatusPill status={s.status} />
        )}
      </span>

      <span className="admin-chat-item-name">
        {hasVisitor ? (s.visitor_name || s.visitor_email) : `Visitor #${s.id}`}
      </span>

      <span className="admin-chat-preview">
        {s.last_message || 'Session started'}
      </span>

      <span className="admin-chat-item-footer">
        <span>{s.assigned_admin_name ? `Agent: ${s.assigned_admin_name}` : 'Unassigned'}</span>
        <span>{s.message_count || 0} msgs</span>
      </span>
    </button>
  );
});

/** The thread's bubbles. Memoized: list polls and typing a reply don't re-render them. */
const MessageList = React.memo(function MessageList({ messages }) {
  return messages.map((msg) => {
    const isAdmin = msg.sender === 'admin';
    const isBot = msg.sender === 'bot';

    let senderLabel = 'Visitor';
    if (isAdmin) senderLabel = msg.sender_admin_name || 'Admin Broker';
    if (isBot) senderLabel = 'APG Assistant';

    return (
      <div
        key={msg.id}
        className={`admin-chat-msg-row ${msg.sender}`}
      >
        <div className="admin-chat-msg-sender">
          {senderLabel}
        </div>
        <div className="admin-chat-bubble">
          <ChatText text={msg.body} />
        </div>
        <div className="admin-chat-msg-time tabular-nums">
          {formatMessageTime(msg.created_at)}
        </div>
      </div>
    );
  });
});

export default function LiveChat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSessionId = searchParams.get('session') ? parseInt(searchParams.get('session'), 10) : null;

  // Open queue (waiting, active, bot): small, polled whole. Closed history: paged, kept between polls.
  const [sessions, setSessions] = useState([]);
  const [closed, setClosed] = useState({ query: null, rows: [], hasMore: false });
  const [loadingClosed, setLoadingClosed] = useState(false);
  const [summary, setSummary] = useState({ total: 0, waiting: 0, active: 0, closed: 0, bot: 0 });
  const [activeTab, setActiveTab] = useState('waiting_for_agent');
  const [searchQuery, setSearchQuery] = useState('');
  const [closedQuery, setClosedQuery] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState(initialSessionId);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const messagesScrollRef = useRef(null);
  const previousWaitingSessionIdsRef = useRef(null);
  const selectedIdRef = useRef(null);
  // Conversation whose messages are on screen, and its newest message id (the next poll's after_id).
  const threadRef = useRef({ id: null, lastId: 0 });
  const closedRequestRef = useRef(null);
  const toast = useToast();
  const showsClosed = activeTab === 'closed' || activeTab === 'all';

  // Keep the thread pinned to its newest message. Scroll the thread box itself:
  // scrollIntoView also scrolled the page, hiding the header on every poll.
  // Keyed on length so a 3.5s poll that returns the same thread doesn't yank the reader down.
  useEffect(() => {
    const box = messagesScrollRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages.length, selectedSessionId]);

  // Fetch the open queue; returns it (null on failure).
  const fetchSessions = React.useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await fetch('/api/admin/chat.php?status=open', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        const nextSessions = data.data || [];
        const waitingIds = new Set(
          nextSessions
            .filter(session => session.status === 'waiting_for_agent')
            .map(session => String(session.id))
        );
        const previousWaitingIds = previousWaitingSessionIdsRef.current;
        if (isBackground && previousWaitingIds) {
          for (const session of nextSessions) {
            const sessionId = String(session.id);
            if (session.status === 'waiting_for_agent' && !previousWaitingIds.has(sessionId)) {
              toast.info(`New chat waiting for an agent${session.visitor_name ? `: ${session.visitor_name}` : ''}`);
            }
          }
        }
        previousWaitingSessionIdsRef.current = waitingIds;
        setSessions(nextSessions);
        if (data.summary) setSummary(data.summary);

        // Auto-select the first waiting (else first open) session if none is selected
        if (nextSessions.length > 0 && !isBackground) {
          const waiting = nextSessions.find(s => s.status === 'waiting_for_agent');
          const target = waiting || nextSessions[0];
          setSelectedSessionId(prev => prev ?? target.id);
        }
        return nextSessions;
      }
    } catch {
      if (!isBackground) toast.error('Failed to load live chat sessions');
    } finally {
      if (!isBackground) setLoading(false);
    }
    return null;
  }, [toast]);

  // Closed history page: offset 0 refreshes the top (new closures, or a new search), offset > 0 appends older ones.
  const loadClosed = React.useCallback(async (offset) => {
    const query = closedQuery;
    closedRequestRef.current = query;
    setLoadingClosed(true);
    try {
      const params = new URLSearchParams({ status: 'closed', limit: String(CLOSED_PAGE_SIZE), offset: String(offset) });
      if (query) params.set('q', query);
      const res = await fetch(`/api/admin/chat.php?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (closedRequestRef.current !== query) return; // the search changed while this page loaded
      if (!data.success) throw new Error(data.error);
      const page = data.data || [];
      const full = page.length === CLOSED_PAGE_SIZE;
      setClosed(prev => {
        if (prev.query !== query) return { query, rows: page, hasMore: full };
        const have = new Set(prev.rows.map(s => s.id));
        if (offset > 0) return { query, rows: [...prev.rows, ...page.filter(s => !have.has(s.id))], hasMore: full };
        // No overlap with what is loaded: more than a page closed since, so start again from this page.
        if (full && !page.some(s => have.has(s.id))) return { query, rows: page, hasMore: true };
        const fresh = new Set(page.map(s => s.id));
        return { query, rows: [...page, ...prev.rows.filter(s => !fresh.has(s.id))], hasMore: prev.hasMore };
      });
    } catch {
      if (closedRequestRef.current === query) toast.error('Failed to load closed conversations');
    } finally {
      if (closedRequestRef.current === query) setLoadingClosed(false);
    }
  }, [closedQuery, toast]);

  // Fetch the thread: whole when a conversation opens; after that, background refreshes ask only for
  // the messages after the newest one held (after_id) and append them.
  const fetchThread = React.useCallback(async (sessionId, isBackground = false) => {
    if (!sessionId) {
      setSelectedSession(null);
      setMessages([]);
      return;
    }
    const incremental = isBackground && threadRef.current.id === sessionId;

    try {
      if (!isBackground) setLoadingThread(true);
      const afterId = incremental ? threadRef.current.lastId : 0;
      const res = await fetch(`/api/admin/chat.php?session_id=${sessionId}${afterId ? `&after_id=${afterId}` : ''}`, { credentials: 'include' });
      const data = await res.json();
      // Drop a late response for a conversation the admin has already left.
      if (!data.success || selectedIdRef.current !== sessionId) return;
      setSelectedSession(prev => (JSON.stringify(prev) === JSON.stringify(data.session) ? prev : data.session));
      const incoming = data.messages || [];
      if (!incremental) {
        threadRef.current = { id: sessionId, lastId: incoming.length ? Number(incoming[incoming.length - 1].id) : 0 };
        setMessages(incoming);
        return;
      }
      // Refreshes can overlap (reply/claim/close refresh too): append each message once.
      if (threadRef.current.id !== sessionId) return;
      const added = incoming.filter(m => Number(m.id) > threadRef.current.lastId);
      if (added.length) {
        threadRef.current = { id: sessionId, lastId: Number(added[added.length - 1].id) };
        setMessages(prev => [...prev, ...added]);
      }
    } catch {
      if (!isBackground) toast.error('Failed to load message thread');
    } finally {
      if (!isBackground) setLoadingThread(false);
    }
  }, [toast]);

  // Initial load. Nothing open: show the newest closed conversation, as the unfiltered list used to.
  useEffect(() => {
    fetchSessions().then(async (open) => {
      if (!open || open.length > 0) return;
      try {
        const res = await fetch('/api/admin/chat.php?status=closed&limit=1', { credentials: 'include' });
        const newest = (await res.json()).data?.[0];
        if (newest) setSelectedSessionId(prev => prev ?? newest.id);
      } catch {
        // The queue is empty either way.
      }
    });
  }, [fetchSessions]);

  // Search closed history on the server (debounced): it is only loaded a page at a time.
  useEffect(() => {
    const t = setTimeout(() => setClosedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Closed/All tabs: first page on open, and again when a chat closes (the count moves) or the search changes.
  useEffect(() => {
    if (showsClosed) loadClosed(0);
  }, [showsClosed, summary.closed, loadClosed]);

  // When selected session ID changes
  useEffect(() => {
    selectedIdRef.current = selectedSessionId;
    if (selectedSessionId) fetchThread(selectedSessionId);
  }, [selectedSessionId, fetchThread]);

  // Mirror the selection in ?session= (kept apart from the fetch: the URL update re-runs this effect).
  useEffect(() => {
    if (selectedSessionId) setSearchParams({ session: selectedSessionId.toString() }, { replace: true });
  }, [selectedSessionId, setSearchParams]);

  // Polling interval (every 3.5 seconds) while the tab is visible, and once as it comes back
  useEffect(() => {
    const tick = () => {
      if (document.hidden) return;
      fetchSessions(true);
      if (selectedSessionId) {
        fetchThread(selectedSessionId, true);
      }
    };
    const interval = setInterval(tick, 3500);
    document.addEventListener('visibilitychange', tick);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [selectedSessionId, fetchSessions, fetchThread]);

  // Send admin reply
  const handleSendReply = async () => {
    const text = replyText.trim();
    if (!text || !selectedSessionId || sending) return;

    try {
      setSending(true);
      const res = await fetch('/api/admin/chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'message',
          session_id: selectedSessionId,
          body: text,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReplyText('');
        fetchThread(selectedSessionId, true);
        fetchSessions(true);
      } else {
        toast.error(data.error || 'Failed to send reply');
      }
    } catch {
      toast.error('Network error sending message');
    } finally {
      setSending(false);
    }
  };

  // Claim chat session
  const handleClaim = async () => {
    if (!selectedSessionId || claiming) return;

    try {
      setClaiming(true);
      const res = await fetch('/api/admin/chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'claim',
          session_id: selectedSessionId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Session claimed! You are now live with the visitor.');
        fetchThread(selectedSessionId, true);
        fetchSessions(true);
      } else {
        toast.error(data.error || 'Failed to claim session');
      }
    } catch {
      toast.error('Network error claiming session');
    } finally {
      setClaiming(false);
    }
  };

  // Close chat session
  const handleCloseSession = async () => {
    if (!selectedSessionId || closing) return;

    try {
      setClosing(true);
      const res = await fetch('/api/admin/chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'close',
          session_id: selectedSessionId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Session resolved and closed');
        setCloseConfirmOpen(false);
        fetchThread(selectedSessionId, true);
        fetchSessions(true);
      } else {
        toast.error(data.error || 'Failed to close session');
        if (data.status === 'closed') {
          // Someone else already closed it: show the current state.
          setCloseConfirmOpen(false);
          fetchThread(selectedSessionId, true);
          fetchSessions(true);
        }
      }
    } catch {
      toast.error('Network error closing session');
    } finally {
      setClosing(false);
    }
  };

  // Filter sessions by active tab and search query (closed rows already match the server-side search)
  const filteredSessions = useMemo(() => {
    let list;
    if (activeTab === 'closed') list = closed.rows;
    else if (activeTab === 'all') {
      const openIds = new Set(sessions.map(s => s.id));
      list = [...sessions, ...closed.rows.filter(s => !openIds.has(s.id))];
    }
    else list = sessions.filter(s => s.status === activeTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s =>
        (s.enterprise_slug || '').toLowerCase().includes(q) ||
        (s.visitor_name || '').toLowerCase().includes(q) ||
        (s.visitor_email || '').toLowerCase().includes(q) ||
        (s.last_message || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [sessions, closed.rows, activeTab, searchQuery]);

  return (
    <div>
      <Helmet>
        <title>Live Chat & Broker Dispatch | Alpha Premier Admin</title>
      </Helmet>

      <PageHeader
        eyebrow="Engagement"
        title="Live Chat & Concierge Queue"
        description="Real-time triage and live broker handoff across all Alpha Premier enterprises."
        actions={
          <button className="admin-btn admin-btn-secondary" onClick={() => { fetchSessions(false); if (showsClosed) loadClosed(0); }}>
            <RefreshCw className="size-3.5" aria-hidden="true" /> Refresh
          </button>
        }
      />

      {/* Split-Pane Layout */}
      <div className="admin-chat-layout">
        {/* Left Pane: Queue & Filter */}
        <div className="admin-chat-sidebar-card">
          {/* Status Tabs */}
          <div className="admin-chat-tabs" role="group" aria-label="Filter conversations">
            {STATUS_TABS.map(tab => {
              let count = summary.total;
              if (tab.id === 'waiting_for_agent') count = summary.waiting;
              else if (tab.id === 'agent_active') count = summary.active;
              else if (tab.id === 'closed') count = summary.closed;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={isActive}
                  className={`admin-chat-tab-btn${isActive ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.Icon className="size-3.5" aria-hidden="true" />
                  <span>{tab.label}</span>
                  <span className={`admin-chat-tab-count tabular-nums ${tab.id === 'waiting_for_agent' && count > 0 ? 'waiting' : ''}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--admin-border)' }}>
            <input
              type="search"
              aria-label="Search conversations"
              placeholder="Search visitor or message"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-form-input"
              style={{ width: '100%' }}
            />
          </div>

          {/* Sessions List */}
          <div className="admin-chat-list">
            {filteredSessions.length === 0 && ((loading && sessions.length === 0) || (showsClosed && loadingClosed)) ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--admin-text-3)' }}>
                <div className="admin-spinner" style={{ margin: '0 auto 8px' }} />
                <small>Loading conversations...</small>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--admin-text-3)', fontSize: '0.85rem' }}>
                <MessageCircle className="mx-auto mb-2 size-7 opacity-50" aria-hidden="true" />
                No conversations in this view
              </div>
            ) : (
              filteredSessions.map((s) => (
                <SessionItem
                  key={s.id}
                  session={s}
                  isSelected={selectedSessionId === s.id}
                  onSelect={setSelectedSessionId}
                />
              ))
            )}
            {showsClosed && closed.hasMore && closed.query === closedQuery && filteredSessions.length > 0 && (
              <div style={{ padding: 12, textAlign: 'center' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={() => loadClosed(closed.rows.length)}
                  disabled={loadingClosed}
                >
                  {loadingClosed ? 'Loading...' : 'Load older conversations'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Active Thread */}
        <div className="admin-chat-main-card">
          {selectedSession ? (
            <>
              {/* Header */}
              <div className="admin-chat-main-header">
                <div className="admin-chat-main-info">
                  <h3>
                    <span>{selectedSession.visitor_name || `Visitor #${selectedSession.id}`}</span>
                    <span className="admin-chat-enterprise" style={{ fontSize: '0.8rem' }}>
                      {ENTERPRISE_NAMES[selectedSession.enterprise_slug] || selectedSession.enterprise_slug}
                    </span>
                    <StatusPill status={selectedSession.status} />
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-2)', marginTop: 2 }}>
                    {selectedSession.visitor_email && <span>Email: {selectedSession.visitor_email} &bull; </span>}
                    {selectedSession.visitor_phone && <span>Phone: {selectedSession.visitor_phone} &bull; </span>}
                    <span>Assigned: {selectedSession.assigned_admin_name || 'None'}</span>
                  </div>
                </div>

                <div className="admin-chat-main-actions">
                  {selectedSession.status !== 'closed' && (
                    <>
                      {selectedSession.status !== 'agent_active' ? (
                        <button
                          className="admin-btn admin-btn-primary admin-btn-sm"
                          onClick={handleClaim}
                          disabled={claiming}
                          title="Connect to visitor and take over the conversation"
                        >
                          <Zap className="size-3.5" aria-hidden="true" /> {claiming ? 'Connecting...' : (selectedSession.status === 'waiting_for_agent' ? 'Claim & Connect' : 'Connect & Take Over')}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--admin-green)', display: 'flex', alignItems: 'center', gap: 6, marginRight: 4, background: 'rgba(70, 184, 124, 0.12)', padding: '4px 8px', borderRadius: 4 }}>
                          <CheckCircle2 className="size-3.5" aria-hidden="true" /> Live with {selectedSession.assigned_admin_name || 'Admin'}
                        </span>
                      )}
                      <button
                        className="admin-btn admin-btn-ghost admin-btn-sm admin-btn-ghost-danger"
                        onClick={() => setCloseConfirmOpen(true)}
                        title="Mark session as resolved and closed"
                      >
                        <X className="size-3.5" aria-hidden="true" /> Close Chat
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Message History Scroll */}
              <div className="admin-chat-messages-scroll" ref={messagesScrollRef}>
                {loadingThread && messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--admin-text-3)' }}>
                    <div className="admin-spinner" style={{ margin: '0 auto 8px' }} />
                    Loading conversation thread...
                  </div>
                ) : (
                  <MessageList messages={messages} />
                )}
              </div>

              {/* Reply Input Box */}
              {selectedSession.status !== 'closed' ? (
                <div className="admin-chat-input-box">
                  <textarea
                    rows={1}
                    aria-label="Reply to visitor"
                    className="admin-chat-textarea"
                    placeholder="Type reply as representative... (Enter to send, Shift+Enter for new line)"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    disabled={sending}
                  />
                  <button
                    className="admin-btn admin-btn-primary admin-btn-sm"
                    onClick={handleSendReply}
                    disabled={sending || !replyText.trim()}
                    style={{ height: 44, padding: '0 20px' }}
                  >
                    <Send className="size-3.5" aria-hidden="true" /> {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              ) : (
                <div style={{ padding: 14, textAlign: 'center', background: 'var(--admin-surface-2)', borderTop: '1px solid var(--admin-border)', color: 'var(--admin-text-3)', fontSize: '0.85rem' }}>
                  <Lock className="mr-1.5 inline size-3.5" aria-hidden="true" /> This conversation is closed.
                </div>
              )}
            </>
          ) : (
            <div className="admin-chat-empty-state">
              <span className="admin-empty-state-icon">
                <MessagesSquare className="size-5" aria-hidden="true" />
              </span>
              <h3 className="text-balance">Select a Conversation</h3>
              <p className="text-pretty">Choose an active or waiting chat session from the queue on the left to start live messaging.</p>
            </div>
          )}
        </div>
      </div>

      {/* Close Session Confirmation Dialog */}
      <ConfirmDialog
        open={closeConfirmOpen}
        title="Close Conversation?"
        message="Are you sure you want to mark this live chat session as resolved and closed? The visitor will receive a resolution notice."
        confirmLabel={closing ? "Closing..." : "Yes, Close Session"}
        onConfirm={handleCloseSession}
        onCancel={() => setCloseConfirmOpen(false)}
        danger
      />
    </div>
  );
}
