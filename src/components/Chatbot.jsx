import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';
import { aiChat } from '@/lib/ai';
import { Bot, X, Send, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import './EnterpriseChatbot.css'; // Reuse the premium subsidiary chatbot styling classes!

const fallback = {
  'abito-santos': "Our President and Chief Executive Officer is Mr. Mark Anthony Abito-Santos. He leads Alpha Premier Group of Companies and its real estate operations. If you'd like more background, I can connect you with our office.",
  'mark anthony': "Our President and Chief Executive Officer is Mr. Mark Anthony Abito-Santos. He leads Alpha Premier Group of Companies and its real estate operations. If you'd like more background, I can connect you with our office.",
  abito: "Our President and Chief Executive Officer is Mr. Mark Anthony Abito-Santos. He leads Alpha Premier Group of Companies and its real estate operations. If you'd like more background, I can connect you with our office.",
  ceo: "Our President and Chief Executive Officer is Mr. Mark Anthony Abito-Santos. He leads Alpha Premier Group of Companies and its real estate operations. If you'd like more background, I can connect you with our office.",
  president: "Our President and Chief Executive Officer is Mr. Mark Anthony Abito-Santos. He leads Alpha Premier Group of Companies and its real estate operations. If you'd like more background, I can connect you with our office.",
  founder: "Our President and Chief Executive Officer is Mr. Mark Anthony Abito-Santos. He leads Alpha Premier Group of Companies and its real estate operations. If you'd like more background, I can connect you with our office.",
  leadership: "Our President and Chief Executive Officer is Mr. Mark Anthony Abito-Santos. He leads Alpha Premier Group of Companies and its real estate operations. If you'd like more background, I can connect you with our office.",
  hello: "Greetings! How may I assist you with Alpha Premier?",
  hi: "Greetings! How may I assist you with Alpha Premier?",
  realty: "Our realty arm, Alpha Premier Realty, offers residential, commercial, and industrial properties. Would you like a callback?",
  property: "Our realty arm, Alpha Premier Realty, offers residential, commercial, and industrial properties. Would you like a callback?",
  'virtual office': "Alpha Premier Virtual Office at Ortigas provides premium addresses and flexible workspaces.",
  career: "We have exciting career opportunities! Please visit our Careers page.",
  job: "We have exciting career opportunities! Please visit our Careers page.",
  contact: "You can reach Alpha Premier at 0915 888 9482 / 02 8 650 2540, or email contact@alphapremier.com. Our office is at Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City. You can also message us on Facebook: https://www.facebook.com/alphapremierRealty",
  phone: "You can reach us at 0915 888 9482 / 02 8 650 2540. Would you like to be connected with our team?",
  email: "You can email us at contact@alphapremier.com. Anything else I can help with?",
  address: "Our office is at Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City. Would you like directions or to schedule a visit?",
  located: "Our office is at Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City. Would you like directions or to schedule a visit?",
  facebook: "You can find us on Facebook at https://www.facebook.com/alphapremierRealty. Anything else I can help with?",
  fb: "You can find us on Facebook at https://www.facebook.com/alphapremierRealty. Anything else I can help with?",
  swiftclear: "Swift Clear provides professional cleaning and facility services. Check our subsidiaries section.",
  'dynamic tree': "Dynamic Tree offers modeling and talent management services.",
  'luxe-prime': "Luxe Prime focuses on luxury lifestyle and premium experiences.",
  'alta venture': "AltaVenture is our business solutions and corporate support arm.",
  construction: "Alpha Premier Construction handles construction and materials supply.",
  '88 prime': "88 Prime provides specialized professional services.",
  thank: "You're welcome! Anything else I can help with?",
};

let kbCache = null;
let kbCacheTime = 0;

function getKeywordReply(text) {
  const lower = text.toLowerCase();
  if (kbCache && Array.isArray(kbCache)) {
    for (const entry of kbCache) {
      const triggers = (entry.trigger || '').split(',').map(t => t.trim().toLowerCase());
      if (triggers.some(t => lower.includes(t))) return entry.answer;
    }
  }
  for (const [key, reply] of Object.entries(fallback)) {
    if (lower.includes(key)) return reply;
  }
  return "I'm sorry, I didn't understand. Please contact our team for detailed assistance.";
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [greeted, setGreeted] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [aiSettings, setAiSettings] = useState({
    ai_enabled: 'true',
    ai_chatbot_enabled: 'true',
  });

  const msgEndRef = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

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

  useEffect(() => {
    if (open && !greeted) {
      loadKB();
      const sid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      setSessionId(sid);
      setMessages([{
        sender: 'bot',
        text: "Greetings. I am Alpha Assistant, your corporate AI concierge for Alpha Premier Group. How may I assist you with properties, virtual offices, or careers today?",
      }]);
      setGreeted(true);
    }
  }, [open, greeted]);

  useEffect(() => {
    loadAiSettings(setAiSettings);
  }, []);

  const send = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || thinking) return;

    const userMsg = {
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setThinking(true);

    try {
      const result = await aiChat(query, history, { sessionId });
      if (result.content) {
        const reply = result.content;
        setHistory((prev) => [...prev, { role: 'user', content: query }, { role: 'assistant', content: reply }]);
        setMessages((prev) => [...prev, {
          sender: 'bot',
          text: reply,
        }]);
      } else {
        const contextLength = messages.length < 4 ? '' : messages.slice(-3, -1).map(m => m.text).join(' ');
        const reply = getKeywordReply(query + ' ' + contextLength);
        setMessages((prev) => [...prev, {
          sender: 'bot',
          text: reply,
        }]);
      }
    } catch (err) {
      console.error(err);
      const contextLength = messages.length < 4 ? '' : messages.slice(-3, -1).map(m => m.text).join(' ');
      const reply = getKeywordReply(query + ' ' + contextLength);
      setMessages((prev) => [...prev, {
        sender: 'bot',
        text: reply,
      }]);
    }
    setThinking(false);
  };

  const handleDownloadTranscript = () => {
    if (!messages.length) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const refId = `APG-INQ-${Date.now().toString().slice(-8)}`;
    const brandName = 'ALPHA PREMIER GROUP';
    const dateStr = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    // Dark background page
    doc.setFillColor(15, 15, 18);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Inner card border
    doc.setDrawColor(196, 154, 42);
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
    doc.setTextColor(196, 154, 42);
    doc.text(`REF: ${refId}`, pageWidth - margin - 8, y + 4, { align: 'right' });

    // Subtitle
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(196, 154, 42);
    doc.text('OFFICIAL AI CONCIERGE INQUIRY TRANSCRIPT', margin + 8, y);

    // Divider line
    y += 6;
    doc.setDrawColor(196, 154, 42);
    doc.setLineWidth(0.4);
    doc.line(margin + 8, y, pageWidth - margin - 8, y);

    y += 10;

    // Render Chat Messages
    messages.forEach((msg) => {
      const isUser = msg.sender === 'user';
      const senderLabel = isUser ? 'CLIENT INQUIRY' : 'ALPHA ASSISTANT';

      if (y > pageHeight - margin - 35) {
        doc.addPage();
        doc.setFillColor(15, 15, 18);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        doc.setDrawColor(196, 154, 42);
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
      } else {
        doc.setTextColor(196, 154, 42);
        doc.text(senderLabel, margin + 8, y);
      }
      y += 4;

      // Message text wrap
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const splitText = doc.splitTextToSize(msg.text, contentWidth - 24);
      const bubbleHeight = splitText.length * 4.6 + 6;

      if (isUser) {
        doc.setFillColor(196, 154, 42);
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
        doc.setTextColor(255, 255, 255);
        doc.text(splitText, pageWidth - margin - 12, y + 5, { align: 'right' });
      } else {
        doc.setFillColor(28, 28, 34);
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
    doc.text('Email: contact@alphapremier.com', pageWidth - margin - 8, footerY + 4, { align: 'right' });

    doc.save(`apg-inquiry-${refId}.pdf`);
  };

  const quickPrompts = [
    'Tell me about Virtual Office plans',
    'What properties are available in Ortigas?',
    'How can I schedule a consultation?',
    'What open job positions do you have?'
  ];

  const content = (
    <div 
      className="luxe-chatbot-wrapper" 
      style={{ 
        '--luxe-accent': '#E2B857',
        '--luxe-accent-rgb': '226, 184, 87',
      }}
    >
      {/* Floating 3D Glowing AI Logo Toggle Button */}
      {!open && (
        <button 
          className="luxe-chatbot-toggler floating-ai-button rotate-0 cursor-pointer"
          onClick={() => setOpen(true)}
          aria-label="Open Concierge Chat"
          title="Alpha Assistant"
        >
          <div className="luxe-toggler-3d-sheen" />
          <div className="luxe-toggler-inner-ring" />
          <div className="luxe-toggler-ping-glow" />
          <div className="relative z-10 flex items-center justify-center">
            <Bot className="w-7 h-7 text-white" />
          </div>
        </button>
      )}

      {/* Chat Window Container */}
      {open && (
        <div ref={chatRef} className="luxe-chatbot-container">
          {/* Header */}
          <div className="luxe-chatbot-header">
            <div className="luxe-chatbot-brand">
              <div className="luxe-avatar-header">
                <Bot className="w-4 h-4 text-current" />
              </div>
              <div className="luxe-brand-text">
                <h3>Alpha Assistant</h3>
                <span className="luxe-chatbot-status">
                  <span className="luxe-online-light" />
                  Online
                </span>
              </div>
            </div>
            <div className="luxe-header-actions">
              <button 
                className="luxe-chatbot-icon-btn" 
                onClick={handleDownloadTranscript}
                title="Download Chat Transcript"
                aria-label="Download Chat Transcript"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button className="luxe-chatbot-close" onClick={() => setOpen(false)} aria-label="Close Chat">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="luxe-chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`luxe-msg ${msg.sender === 'user' ? 'luxe-msg-user' : 'luxe-msg-bot'}`}>
                {msg.sender === 'bot' && (
                  <div className="luxe-avatar-bot">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="luxe-msg-bubble">
                  {msg.text}
                </div>
              </div>
            ))}

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

            <div ref={msgEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="luxe-quick-prompts">
            {quickPrompts.map((prompt, idx) => (
              <button 
                key={idx} 
                className="luxe-chip" 
                onClick={() => send(prompt)}
                disabled={thinking}
              >
                <span>{prompt}</span>
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="luxe-chatbot-input-area">
            <input
              type="text"
              placeholder="Ask Alpha Assistant..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              disabled={thinking}
            />
            <button 
              onClick={() => send()} 
              disabled={thinking || !input.trim()}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }

  return content;
}

async function loadKB() {
  const now = Date.now();
  if (kbCache && now - kbCacheTime < 300000) return kbCache;
  try {
    const { data } = await supabase.from("chatbot_kb").select("*").eq("active", true).order("priority", { ascending: false });
    if (data?.length) { kbCache = data; kbCacheTime = now; return data; }
  } catch {}
  return null;
}

async function loadAiSettings(setter) {
  try {
    const { data } = await supabase.from("site_settings").select("key,value").in("key", ["ai_enabled", "ai_chatbot_enabled"]);
    if (data?.length) {
      const map = {};
      data.forEach(s => { map[s.key] = s.value; });
      setter(prev => ({ ...prev, ...map }));
    }
  } catch {}
}
