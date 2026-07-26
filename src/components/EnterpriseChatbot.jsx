import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { Bot, X, Send, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { getEnterpriseConfig } from '../data/enterpriseConfig';
import './EnterpriseChatbot.css';

// Subsidiary Specific Responses
const RESPONSES = {
  'luxe-prime': {
    sublease: "Luxe Prime Realty offers a modern co-managed subleasing model that provides the flexibility of short and mid-term rentals while guaranteeing white-glove property care and tenant vetting.",
    subleasing: "Luxe Prime Realty offers a modern co-managed subleasing model that provides the flexibility of short and mid-term rentals while guaranteeing white-glove property care and tenant vetting.",
    admin: "Our End-to-End Property Administration oversees tenant vetting, lease management, maintenance dispatch, utility coordination, and financial reporting for seamless ownership.",
    administration: "Our End-to-End Property Administration oversees tenant vetting, lease management, maintenance dispatch, utility coordination, and financial reporting for seamless ownership.",
    property: "Luxe Prime manages exclusive luxury residential, commercial, and off-market portfolio properties across Metro Manila including BGC, Makati, and Ortigas.",
    portfolio: "Our private portfolio surfaces exclusive off-market listings before they reach the general market, offering unmatched prestige and investment yield.",
    contact: "You can reach Luxe Prime Concierge at 0915 888 9482 / 02 8 650 2540, or email contact@alphapremier.com. Office: Unit 3104, Tektite East Tower, Ortigas Center, Pasig City.",
    phone: "Contact our concierge team directly at 0915 888 9482 / 02 8 650 2540.",
    email: "Email Luxe Prime Realty directly at contact@alphapremier.com.",
    ceo: "Luxe Prime Realty operates under Alpha Premier Group of Companies, led by President and CEO Mr. Mark Anthony Abito-Santos.",
    leadership: "Luxe Prime Realty operates under Alpha Premier Group of Companies, led by President and CEO Mr. Mark Anthony Abito-Santos.",
  },
  'dynamic-tree': {
    talent: "Dynamic Tree manages premier commercial models, influencers, brand ambassadors, and event hosts for high-impact commercial campaigns.",
    model: "We represent top commercial and editorial models for fashion shoots, TV commercials, digital ads, and runway productions.",
    modeling: "We represent top commercial and editorial models for fashion shoots, TV commercials, digital ads, and runway productions.",
    casting: "Our casting team connects brands with models, influencers, and personalities who embody your brand's voice.",
    video: "Our video direction & production team handles end-to-end commercial video concepts, fashion films, and product launch trailers.",
    production: "From concept to final cut, Dynamic Tree crafts compelling visual content, fashion photography, and studio productions.",
    contact: "Reach Dynamic Tree Concierge at 0915 888 9482 / 02 8 650 2540 or email contact@alphapremier.com. Office: Unit 3104, Tektite East Tower, Ortigas Center, Pasig City.",
    phone: "Contact our Dynamic Tree talent team at 0915 888 9482 / 02 8 650 2540.",
    email: "Email Dynamic Tree directly at contact@alphapremier.com.",
    ceo: "Dynamic Tree is the modeling and talent arm of Alpha Premier Group, led by President and CEO Mr. Mark Anthony Abito-Santos.",
  }
};

const DEFAULT_PROMPTS = {
  'luxe-prime': [
    "Co-Managed Subleasing",
    "End-to-End Property Admin",
    "Private Portfolio",
    "Contact Concierge",
  ],
  'dynamic-tree': [
    "Talent & Modeling",
    "Video Production",
    "Casting Calls",
    "Contact Concierge",
  ]
};

function hexToRgb(hex) {
  if (!hex) return '196, 154, 42';
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

function getEnterpriseReply(slug, text) {
  const lower = text.toLowerCase();
  const dict = RESPONSES[slug] || RESPONSES['luxe-prime'];
  for (const [key, reply] of Object.entries(dict)) {
    if (lower.includes(key)) return reply;
  }
  return `Thank you for reaching out. Our concierge team has received your query and can assist you further via phone (0915 888 9482) or email (contact@alphapremier.com).`;
}

export default function EnterpriseChatbot() {
  const location = useLocation();
  const config = getEnterpriseConfig(location.pathname);
  const slug = config?.slug || 'luxe-prime';

  // Dynamic branding per subsidiary — crisp single-line title
  const botTitle = config ? `${config.name.replace(' Realty', '')} AI` : 'Enterprise AI';
  const accentColor = config?.accentColor || '#C49A2A';
  const accentRgb = hexToRgb(accentColor);
  const quickPrompts = DEFAULT_PROMPTS[slug] || DEFAULT_PROMPTS['luxe-prime'];

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [greeted, setGreeted] = useState(false);
  const [thinking, setThinking] = useState(false);

  const msgEndRef = useRef(null);
  const chatRef = useRef(null);

  // Close chatbot when user clicks outside the chatbot modal
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
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  useEffect(() => {
    if (open && !greeted) {
      const welcomeText = slug === 'dynamic-tree'
        ? `Welcome to Dynamic Tree. I am your AI Talent & Modeling Concierge. How may I assist you with casting, talent management, or campaign production today?`
        : `Welcome to ${config?.name || 'Luxe Prime Realty'}. I am your AI Luxury Concierge. How may I assist you with subleasing, property administration, or off-market listings today?`;
      
      setMessages([{ text: welcomeText, sender: 'bot' }]);
      setGreeted(true);
    }
  }, [open, greeted, config?.name, slug]);

  const handleSend = (customText) => {
    const txt = (typeof customText === 'string' ? customText : input).trim();
    if (!txt || thinking) return;

    setMessages((prev) => [...prev, { text: txt, sender: 'user' }]);
    if (typeof customText !== 'string') setInput('');
    setThinking(true);

    setTimeout(() => {
      const reply = getEnterpriseReply(slug, txt);
      setMessages((prev) => [...prev, { text: reply, sender: 'bot' }]);
      setThinking(false);
    }, 550);
  };

  const handleDownloadTranscript = () => {
    if (!messages.length) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const refId = `APG-INQ-${Date.now().toString().slice(-8)}`;
    const brandName = (config?.name || 'Alpha Premier Group').toUpperCase();
    const dateStr = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    const rgb = accentRgb.split(',').map((x) => parseInt(x.trim(), 10));
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
    doc.text('OFFICIAL AI CONCIERGE INQUIRY TRANSCRIPT', margin + 8, y);

    // Divider line
    y += 6;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(margin + 8, y, pageWidth - margin - 8, y);

    y += 10;

    // Render Chat Messages
    messages.forEach((msg) => {
      const isUser = msg.sender === 'user';
      const senderLabel = isUser ? 'CLIENT INQUIRY' : `${botTitle.toUpperCase()}`;

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
      } else {
        doc.setTextColor(r, g, b);
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

    // Directly save and trigger automatic PDF download without print dialogs!
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
        onClick={() => setOpen(!open)}
        aria-label="Open Concierge Chat"
        title={`${botTitle} Assistant`}
      >
        <div className="luxe-toggler-3d-sheen" />
        <div className="luxe-toggler-inner-ring" />
        <div className="luxe-toggler-ping-glow" />
        <div className="relative z-10 flex items-center justify-center">
          {open ? <X className="w-6 h-6 text-white" /> : <Bot className="w-7 h-7 text-white" />}
        </div>
      </button>

      {/* Chat Window Container */}
      {open && (
        <div ref={chatRef} className="luxe-chatbot-container">
          {/* Minimalist Elegant Header */}
          <div className="luxe-chatbot-header">
            <div className="luxe-chatbot-brand">
              <div className="luxe-avatar-header">
                <Bot className="w-4 h-4 text-current" />
              </div>
              <div className="luxe-brand-text">
                <h3>{botTitle}</h3>
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
                title="Download Chat Transcript (Proof of Inquiry)"
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
                onClick={() => handleSend(prompt)}
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
              placeholder={`Ask ${config?.name || 'Concierge'}...`}
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
        </div>
      )}
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(chatbotContent, document.body);
  }

  return chatbotContent;
}
