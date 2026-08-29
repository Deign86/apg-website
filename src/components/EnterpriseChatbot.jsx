import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { Bot, X, Send, Download, UserCheck, Headset, Lock, RotateCcw } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { getEnterpriseConfig, DEFAULT_ENTERPRISE_CONFIG } from '../data/enterpriseConfig';
import {
  startChatSession,
  sendChatMessage,
  pollChatSession,
  getSavedSessionToken,
  saveSessionToken,
} from '@/lib/ai';
import './EnterpriseChatbot.css';

function hexToRgb(hex) {
  if (!hex) return '196, 154, 42';
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

export default function EnterpriseChatbot({ onOpenInquire: _onOpenInquire }) {
  const location = useLocation();
  const config = getEnterpriseConfig(location.pathname) || DEFAULT_ENTERPRISE_CONFIG;
  const slug = config?.slug || 'apg-main';

  // Dynamic enterprise branding
  const botTitle = config?.botTitle || `${(config?.name || 'Alpha Premier').replace(' Realty', '')} AI`;
  const accentColor = config?.accentColor || '#C5A059';
  const accentRgb = hexToRgb(accentColor);
  const quickPrompts = config?.quickPrompts || DEFAULT_ENTERPRISE_CONFIG.quickPrompts;

  const [open, setOpen] = useState(false);
  const [sessionToken, setSessionToken] = useState(() => getSavedSessionToken());
  const [chatStatus, setChatStatus] = useState('bot'); // 'bot' | 'waiting_for_agent' | 'agent_active' | 'closed'
  const [assignedAdmin, setAssignedAdmin] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);

  const msgEndRef = useRef(null);
  const chatRef = useRef(null);
  const lastMsgIdRef = useRef(0);

  // Close chatbot when user clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        if (!event.target.closest('.luxe-chatbot-toggler')) {
          setOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  // Eagerly restore existing session or initialize on open
  useEffect(() => {
    if (!sessionInitialized && (open || sessionToken)) {
      const initChat = async () => {
        const res = await startChatSession(slug, sessionToken);
        if (res.success && res.session) {
          setSessionToken(res.session.session_token);
          setChatStatus(res.session.status || 'bot');
          setAssignedAdmin(res.session.assigned_admin_name || null);

          if (res.messages && res.messages.length > 0) {
            const formatted = res.messages.map(m => ({
              id: m.id,
              text: m.body,
              sender: m.sender,
              senderName: m.sender === 'admin' ? (res.session.assigned_admin_name || 'Admin Broker') : null,
              createdAt: m.created_at,
            }));
            setMessages(formatted);
            const maxId = Math.max(...res.messages.map(m => m.id));
            lastMsgIdRef.current = maxId;
          } else {
            // First time welcome greeting
            const welcomeText = `Welcome to ${config?.name || 'Alpha Premier Group'}. How may I assist you today?`;
            setMessages([{ id: 0, text: welcomeText, sender: 'bot' }]);
          }
          setSessionInitialized(true);
        }
      };

      initChat();
    }
  }, [open, sessionInitialized, slug, sessionToken, config?.name]);

  // Live interval polling (every 3s when open, 5s in background)
  useEffect(() => {
    if (!sessionToken || chatStatus === 'closed') return;

    const pollInterval = open ? 3000 : 5000;
    const interval = setInterval(async () => {
      const res = await pollChatSession(sessionToken, lastMsgIdRef.current);
      if (res.success) {
        if (res.status && res.status !== chatStatus) {
          setChatStatus(res.status);
        }
        if (res.assigned_admin_name) {
          setAssignedAdmin(res.assigned_admin_name);
        }

        if (res.messages && res.messages.length > 0) {
          const newMsgs = res.messages.map(m => ({
            id: m.id,
            text: m.body,
            sender: m.sender,
            senderName: m.sender_admin_name || res.assigned_admin_name || 'Admin Broker',
            createdAt: m.created_at,
          }));

          setMessages(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const fresh = newMsgs.filter(m => !existingIds.has(m.id));
            if (!open && fresh.length > 0) {
              const adminCount = fresh.filter(m => m.sender === 'admin').length;
              if (adminCount > 0) {
                setUnreadCount(c => c + adminCount);
              }
            }
            return fresh.length > 0 ? [...prev, ...fresh] : prev;
          });

          const maxId = Math.max(...res.messages.map(m => m.id));
          if (maxId > lastMsgIdRef.current) {
            lastMsgIdRef.current = maxId;
          }
        }
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [open, sessionToken, chatStatus]);

  // Send message
  const handleSend = async (customText, isExplicitHandoff = false) => {
    const txt = (customText ? String(customText) : input).trim();
    if ((!txt && !isExplicitHandoff) || thinking) return;

    // Optimistically append visitor message
    if (txt) {
      setMessages(prev => [...prev, { id: Math.floor(Math.random() * 1000000), text: txt, sender: 'user' }]);
    }
    if (!customText) setInput('');
    setThinking(true);

    try {
      let currentToken = sessionToken;
      if (!currentToken) {
        const startRes = await startChatSession(slug);
        if (startRes.success && startRes.session) {
          currentToken = startRes.session.session_token;
          setSessionToken(currentToken);
        }
      }

      const res = await sendChatMessage(currentToken, txt, slug, isExplicitHandoff);
      if (res.success) {
        if (res.status) {
          setChatStatus(res.status);
        }
        if (res.reply) {
          setMessages(prev => [
            ...prev,
            { id: Date.now() + 1, text: res.reply, sender: 'bot' },
          ]);
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            text: "Thank you for your message. If you need immediate assistance, please call our concierge at 0915 888 9482 or email contact@alphapremiergroup.com.",
            sender: 'bot',
          },
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Our team has received your inquiry. Reach our concierge directly at 0915 888 9482 / contact@alphapremiergroup.com.",
          sender: 'bot',
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  // Explicit live agent handoff button
  const handleRequestLiveAgent = () => {
    handleSend("I would like to speak with a live broker or representative.", true);
  };

  // Start fresh chat session
  const handleStartNewChat = async () => {
    saveSessionToken(null);
    setSessionToken(null);
    setChatStatus('bot');
    setAssignedAdmin(null);
    setMessages([]);
    setSessionInitialized(false);
    lastMsgIdRef.current = 0;

    const res = await startChatSession(slug);
    if (res.success && res.session) {
      setSessionToken(res.session.session_token);
      setChatStatus('bot');
      const welcomeText = `Welcome to ${config?.name || 'Alpha Premier Group'}. How may I assist you today?`;
      setMessages([{ id: 0, text: welcomeText, sender: 'bot' }]);
      setSessionInitialized(true);
    }
  };

  // Generate & download PDF transcript
  const handleDownloadTranscript = () => {
    if (!messages.length) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const refId = `APG-${Date.now().toString().slice(-8)}`;
    const brandName = (config?.name || 'Alpha Premier Group').toUpperCase();
    const dateStr = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    const rgb = accentRgb.split(',').map(x => parseInt(x.trim(), 10));
    const r = rgb[0] || 196;
    const g = rgb[1] || 154;
    const b = rgb[2] || 42;

    // Dark background page
    doc.setFillColor(15, 15, 18);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Inner card border
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin, margin, contentWidth, pageHeight - margin * 2, 4, 4, 'D');

    let y = margin + 12;

    // Brand Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(brandName, margin + 8, y);

    // Date & REF ID
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(161, 161, 170);
    doc.text(`Date: ${dateStr}`, pageWidth - margin - 8, y - 2, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(r, g, b);
    doc.text(`REF: ${refId}`, pageWidth - margin - 8, y + 4, { align: 'right' });

    // Subtitle
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(r, g, b);
    doc.text('OFFICIAL CONCIERGE & LIVE BROKER INQUIRY TRANSCRIPT', margin + 8, y);

    // Divider line
    y += 6;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(margin + 8, y, pageWidth - margin - 8, y);

    y += 10;

    // Render Chat Messages
    messages.forEach((msg) => {
      const isUser = msg.sender === 'user';
      const isAdmin = msg.sender === 'admin';
      let senderLabel = isUser ? 'CLIENT INQUIRY' : (isAdmin ? `BROKER: ${msg.senderName || 'REPRESENTATIVE'}` : `${botTitle.toUpperCase()}`);

      if (y > pageHeight - margin - 35) {
        doc.addPage();
        doc.setFillColor(15, 15, 18);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        doc.setDrawColor(r, g, b);
        doc.setLineWidth(0.8);
        doc.roundedRect(margin, margin, contentWidth, pageHeight - margin * 2, 4, 4, 'D');
        y = margin + 15;
      }

      // Sender Label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      if (isUser) {
        doc.setTextColor(96, 165, 250);
        doc.text(senderLabel, pageWidth - margin - 8, y, { align: 'right' });
      } else if (isAdmin) {
        doc.setTextColor(r, g, b);
        doc.text(senderLabel, margin + 8, y);
      } else {
        doc.setTextColor(161, 161, 170);
        doc.text(senderLabel, margin + 8, y);
      }
      y += 4;

      // Message text wrap
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const splitText = doc.splitTextToSize(msg.text, contentWidth - 24);
      const bubbleHeight = splitText.length * 4.6 + 6;

      if (isUser) {
        doc.setFillColor(r, g, b);
        const maxBubbleWidth = contentWidth - 30;
        doc.roundedRect(
          pageWidth - margin - 8 - maxBubbleWidth,
          y,
          maxBubbleWidth,
          bubbleHeight,
          3,
          3,
          'F'
        );
        doc.setTextColor(15, 15, 18);
        doc.text(splitText, pageWidth - margin - 12, y + 5, { align: 'right' });
      } else {
        doc.setFillColor(isAdmin ? 35 : 28, isAdmin ? 35 : 28, isAdmin ? 42 : 34);
        doc.roundedRect(margin + 8, y, contentWidth - 16, bubbleHeight, 3, 3, 'F');
        doc.setTextColor(228, 228, 231);
        doc.text(splitText, margin + 12, y + 5);
      }

      y += bubbleHeight + 7;
    });

    // Footer Block
    const footerY = pageHeight - margin - 14;
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.2);
    doc.line(margin + 8, footerY - 4, pageWidth - margin - 8, footerY - 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('Alpha Premier Group Concierge', margin + 8, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(161, 161, 170);
    doc.text('Unit 3104, Tektite East Tower, Ortigas Center, Pasig City', margin + 8, footerY + 4);

    doc.text('Phone: 0915 888 9482 / 02 8 650 2540', pageWidth - margin - 8, footerY, { align: 'right' });
    doc.text('Email: contact@alphapremiergroup.com', pageWidth - margin - 8, footerY + 4, { align: 'right' });

    doc.save(`${slug}-inquiry-${refId}.pdf`);
  };

  const chatbotContent = (
    <div
      className="luxe-chatbot-wrapper"
      style={{
        '--luxe-accent': accentColor,
        '--luxe-accent-rgb': accentRgb,
      }}
    >
      {/* Floating 3D Glowing AI Logo Toggle Button */}
      <button
        className={`luxe-chatbot-toggler floating-ai-button ${open ? 'is-active rotate-90' : 'rotate-0'}`}
        onClick={() => {
          setOpen(!open);
          if (!open) setUnreadCount(0);
        }}
        aria-label="Open Concierge Chat"
        title={unreadCount > 0 ? `${unreadCount} new message from broker` : `${botTitle} Assistant`}
      >
        <div className="luxe-toggler-3d-sheen" />
        <div className="luxe-toggler-inner-ring" />
        <div className="luxe-toggler-ping-glow" />
        {unreadCount > 0 && !open && (
          <span className="luxe-unread-badge">{unreadCount}</span>
        )}
        <div className="relative z-10 flex items-center justify-center">
          {open ? <X className="w-6 h-6 text-white" /> : <Bot className="w-7 h-7 text-white" />}
        </div>
      </button>

      {/* Chat Window Container */}
      {open && (
        <div ref={chatRef} className="luxe-chatbot-container">
          {/* Header */}
          <div className="luxe-chatbot-header">
            <div className="luxe-chatbot-brand">
              <div className="luxe-avatar-header">
                {chatStatus === 'agent_active' ? (
                  <UserCheck className="w-4 h-4 text-current" />
                ) : (
                  <Bot className="w-4 h-4 text-current" />
                )}
              </div>
              <div className="luxe-brand-text">
                <h3>{chatStatus === 'agent_active' ? (assignedAdmin || 'Live Representative') : botTitle}</h3>
                <span className="luxe-chatbot-status">
                  <span className="luxe-online-light" />
                  {chatStatus === 'agent_active'
                    ? 'Broker Live'
                    : chatStatus === 'waiting_for_agent'
                    ? 'Connecting to broker...'
                    : chatStatus === 'closed'
                    ? 'Session Resolved'
                    : 'Concierge Online'}
                </span>
              </div>
            </div>
            <div className="luxe-header-actions">
              <button
                className="luxe-chatbot-icon-btn"
                onClick={handleDownloadTranscript}
                title="Download Chat Transcript (Proof of Inquiry)"
                aria-label="Download Chat Transcript"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                className="luxe-chatbot-close"
                onClick={() => setOpen(false)}
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dynamic Status Banner */}
          {chatStatus === 'waiting_for_agent' && (
            <div className="luxe-status-banner waiting">
              <span>
                <span className="luxe-status-pulse" /> Connecting you to a live broker...
              </span>
              <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>Notified</span>
            </div>
          )}

          {chatStatus === 'agent_active' && (
            <div className="luxe-status-banner active">
              <span>
                <span className="luxe-status-pulse" /> Live agent active: {assignedAdmin || 'Executive Broker'}
              </span>
            </div>
          )}

          {chatStatus === 'closed' && (
            <div className="luxe-status-banner closed">
              <span>
                <Lock className="w-3 h-3 inline mr-1" /> Conversation resolved & closed
              </span>
            </div>
          )}

          {/* Messages Area */}
          <div className="luxe-chatbot-messages">
            {messages.map((msg, i) => {
              const isUser = msg.sender === 'user';
              const isAdmin = msg.sender === 'admin';

              if (isAdmin) {
                return (
                  <div key={msg.id || i} className="luxe-msg luxe-msg-admin">
                    <div className="luxe-avatar-admin" title="Alpha Premier Broker">
                      AP
                    </div>
                    <div className="luxe-msg-admin-wrapper">
                      <span className="luxe-msg-admin-tag">
                        {msg.senderName || assignedAdmin || 'Alpha Broker'}
                      </span>
                      <div className="luxe-msg-bubble">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id || i}
                  className={`luxe-msg ${isUser ? 'luxe-msg-user' : 'luxe-msg-bot'}`}
                >
                  {!isUser && (
                    <div className="luxe-avatar-bot">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="luxe-msg-bubble">
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {thinking && (
              <div className="luxe-msg luxe-msg-bot">
                <div className="luxe-avatar-bot">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="luxe-msg-bubble luxe-thinking">
                  <div className="luxe-typing-wave">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            {/* Closed state notice card */}
            {chatStatus === 'closed' && (
              <div className="luxe-closed-notice">
                <strong>Inquiry Resolved</strong>
                <p style={{ margin: '4px 0' }}>
                  For immediate follow-ups: 0915 888 9482 / contact@alphapremiergroup.com
                </p>
                <button className="luxe-new-chat-btn" onClick={handleStartNewChat}>
                  <RotateCcw className="w-3 h-3 inline mr-1" /> Start New Inquiry
                </button>
              </div>
            )}

            <div ref={msgEndRef} />
          </div>

          {/* Quick Prompt Chips (Visible during bot state) */}
          {chatStatus === 'bot' && (
            <div className="luxe-quick-prompts">
              {/* Always-present Talk to Live Agent Button */}
              <button
                className="luxe-chip luxe-chip-handoff"
                onClick={handleRequestLiveAgent}
                disabled={thinking}
                title="Connect directly to a live human broker"
              >
                <Headset className="w-3 h-3 inline mr-1" />
                <span>Talk to Live Agent</span>
              </button>

              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  className="luxe-chip"
                  onClick={() => handleSend(prompt)}
                  disabled={thinking}
                >
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input Area (stays open during bot, waiting, and agent_active) */}
          {chatStatus !== 'closed' ? (
            <div className="luxe-chatbot-input-area">
              <input
                type="text"
                placeholder={
                  chatStatus === 'waiting_for_agent'
                    ? "Add details for the broker..."
                    : chatStatus === 'agent_active'
                    ? `Reply to ${assignedAdmin || 'representative'}...`
                    : `Ask ${config?.name || 'Concierge'}...`
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={thinking}
              />
              <button
                onClick={() => handleSend()}
                disabled={thinking || !input.trim()}
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div style={{ padding: 10, textAlign: 'center', background: 'rgba(22, 22, 26, 0.95)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button className="luxe-new-chat-btn" onClick={handleStartNewChat}>
                Start New Chat
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (globalThis.document?.body) {
    return createPortal(chatbotContent, document.body);
  }

  return chatbotContent;
}
