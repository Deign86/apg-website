import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import StatusPill from '@/components/admin/StatusPill';

const STATUS_TABS = [
  { id: 'waiting_for_agent', label: 'Waiting', icon: 'fa-clock' },
  { id: 'agent_active', label: 'Active', icon: 'fa-comments' },
  { id: 'closed', label: 'Closed', icon: 'fa-circle-check' },
  { id: 'all', label: 'All', icon: 'fa-list' },
];

function formatWaitTime(seconds) {
  if (!seconds || seconds < 0) return 'Just now';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m === 0) return `${s}s`;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function formatMessageTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function LiveChat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSessionId = searchParams.get('session') ? parseInt(searchParams.get('session'), 10) : null;

  const [sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState({ total: 0, waiting: 0, active: 0, closed: 0, bot: 0 });
  const [activeTab, setActiveTab] = useState('waiting_for_agent');
  const [searchQuery, setSearchQuery] = useState('');
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

  const messagesEndRef = useRef(null);
  const toast = useToast();

  // Scroll to bottom of message list on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch session list
  const fetchSessions = React.useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await fetch('/api/admin/chat.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setSessions(data.data || []);
        if (data.summary) setSummary(data.summary);

        // Auto-select first session if none selected and tab has items
        if (!selectedSessionId && data.data?.length > 0 && !isBackground) {
          const waiting = data.data.find(s => s.status === 'waiting_for_agent');
          const target = waiting || data.data[0];
          setSelectedSessionId(target.id);
        }
      }
    } catch {
      if (!isBackground) toast.error('Failed to load live chat sessions');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [selectedSessionId, toast]);

  // Fetch single session thread
  const fetchThread = React.useCallback(async (sessionId, isBackground = false) => {
    if (!sessionId) {
      setSelectedSession(null);
      setMessages([]);
      return;
    }

    try {
      if (!isBackground) setLoadingThread(true);
      const res = await fetch(`/api/admin/chat.php?session_id=${sessionId}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setSelectedSession(data.session);
        setMessages(data.messages || []);
      }
    } catch {
      if (!isBackground) toast.error('Failed to load message thread');
    } finally {
      if (!isBackground) setLoadingThread(false);
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // When selected session ID changes
  useEffect(() => {
    if (selectedSessionId) {
      setSearchParams({ session: selectedSessionId.toString() }, { replace: true });
      fetchThread(selectedSessionId);
    }
  }, [selectedSessionId, fetchThread, setSearchParams]);

  // Polling interval (every 3.5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSessions(true);
      if (selectedSessionId) {
        fetchThread(selectedSessionId, true);
      }
    }, 3500);

    return () => clearInterval(interval);
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
      }
    } catch {
      toast.error('Network error closing session');
    } finally {
      setClosing(false);
    }
  };

  // Filter sessions by active tab and search query
  const filteredSessions = useMemo(() => {
    let list = [...sessions];
    if (activeTab !== 'all') {
      list = list.filter(s => s.status === activeTab);
    }
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
  }, [sessions, activeTab, searchQuery]);

  return (
    <div>
      <Helmet>
        <title>Live Chat & Broker Dispatch | Alpha Premier Admin</title>
      </Helmet>

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1>Live Chat & Concierge Queue</h1>
          <p className="admin-muted">
            Direct real-time triage and live broker handoff across all Alpha Premier enterprises.
          </p>
        </div>
        <div className="admin-header-actions">
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={() => fetchSessions(false)}
            title="Refresh Queue"
          >
            <i className="fa-solid fa-rotate" /> Refresh
          </button>
        </div>
      </div>

      {/* Split-Pane Layout */}
      <div className="admin-chat-layout">
        {/* Left Pane: Queue & Filter */}
        <div className="admin-chat-sidebar-card">
          {/* Status Tabs */}
          <div className="admin-chat-tabs">
            {STATUS_TABS.map(tab => {
              let count = summary.total;
              if (tab.id === 'waiting_for_agent') count = summary.waiting;
              else if (tab.id === 'agent_active') count = summary.active;
              else if (tab.id === 'closed') count = summary.closed;

              return (
                <button
                  key={tab.id}
                  className={`admin-chat-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`fa-solid ${tab.icon}`} />
                  <span>{tab.label}</span>
                  <span className={`admin-chat-tab-count ${tab.id === 'waiting_for_agent' && count > 0 ? 'waiting' : ''}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--admin-border)' }}>
            <input
              type="text"
              placeholder="Search visitor or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-form-input"
              style={{ padding: '6px 10px', fontSize: '0.8rem', width: '100%' }}
            />
          </div>

          {/* Sessions List */}
          <div className="admin-chat-list">
            {loading && sessions.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#777' }}>
                <div className="admin-spinner" style={{ margin: '0 auto 8px' }} />
                <small>Loading conversations...</small>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>
                <i className="fa-regular fa-comment-dots" style={{ fontSize: '1.8rem', marginBottom: 8, display: 'block', opacity: 0.5 }} />
                No conversations in this view
              </div>
            ) : (
              filteredSessions.map((s) => {
                const isSelected = selectedSessionId === s.id;
                const isWaiting = s.status === 'waiting_for_agent';
                const hasVisitor = s.visitor_name || s.visitor_email;

                return (
                  <div
                    key={s.id}
                    className={`admin-chat-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedSessionId(s.id)}
                  >
                    <div className="admin-chat-item-header">
                      <span className="admin-chat-enterprise">{s.enterprise_slug}</span>
                      {isWaiting ? (
                        <span className="admin-chat-wait-time">
                          <i className="fa-solid fa-hourglass-half" /> {formatWaitTime(s.wait_seconds)}
                        </span>
                      ) : (
                        <StatusPill status={s.status} />
                      )}
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#eee', marginBottom: 2 }}>
                      {hasVisitor ? (s.visitor_name || s.visitor_email) : `Visitor #${s.id}`}
                    </div>

                    <div className="admin-chat-preview">
                      {s.last_message || 'Session started'}
                    </div>

                    <div className="admin-chat-item-footer">
                      <span>{s.assigned_admin_name ? `Agent: ${s.assigned_admin_name}` : 'Unassigned'}</span>
                      <span>{s.message_count || 0} msgs</span>
                    </div>
                  </div>
                );
              })
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
                      ({selectedSession.enterprise_slug})
                    </span>
                    <StatusPill status={selectedSession.status} />
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#999', marginTop: 2 }}>
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
                          <i className="fa-solid fa-bolt" /> {claiming ? 'Connecting...' : (selectedSession.status === 'waiting_for_agent' ? 'Claim & Connect' : '⚡ Connect & Take Over')}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 6, marginRight: 4, background: 'rgba(16, 185, 129, 0.12)', padding: '4px 8px', borderRadius: 4 }}>
                          <i className="fa-solid fa-circle-check" /> Live with {selectedSession.assigned_admin_name || 'Admin'}
                        </span>
                      )}
                      <button
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        style={{ color: 'var(--admin-red)' }}
                        onClick={() => setCloseConfirmOpen(true)}
                        title="Mark session as resolved and closed"
                      >
                        <i className="fa-solid fa-xmark" /> Close Chat
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Message History Scroll */}
              <div className="admin-chat-messages-scroll">
                {loadingThread && messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#777' }}>
                    <div className="admin-spinner" style={{ margin: '0 auto 8px' }} />
                    Loading conversation thread...
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.sender === 'admin';
                    const isBot = msg.sender === 'bot';

                    let senderLabel = 'Visitor';
                    if (isAdmin) senderLabel = msg.sender_admin_name || 'Admin Broker';
                    if (isBot) senderLabel = 'APG FAQ Bot';

                    return (
                      <div
                        key={msg.id}
                        className={`admin-chat-msg-row ${msg.sender}`}
                      >
                        <div className="admin-chat-msg-sender">
                          {senderLabel}
                        </div>
                        <div className="admin-chat-bubble">
                          {msg.body}
                        </div>
                        <div className="admin-chat-msg-time">
                          {formatMessageTime(msg.created_at)}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input Box */}
              {selectedSession.status !== 'closed' ? (
                <div className="admin-chat-input-box">
                  <textarea
                    rows={1}
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
                    <i className="fa-solid fa-paper-plane" /> {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              ) : (
                <div style={{ padding: 14, textAlign: 'center', background: 'var(--admin-surface-2)', borderTop: '1px solid var(--admin-border)', color: '#888', fontSize: '0.85rem' }}>
                  <i className="fa-solid fa-lock" style={{ marginRight: 6 }} /> This conversation is closed.
                </div>
              )}
            </>
          ) : (
            <div className="admin-chat-empty-state">
              <i className="fa-regular fa-comments" />
              <h3>Select a Conversation</h3>
              <p>Choose an active or waiting chat session from the queue on the left to start live messaging.</p>
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
