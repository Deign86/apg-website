import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bot, X, Send, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { aiChat } from '@/lib/ai';
import '../EnterpriseChatbot.css';

interface AlphaAssistantProps {
  onOpenInquire?: () => void;
}

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const DEFAULT_PROMPTS = [
  "Properties & Realty",
  "Virtual Office Ortigas",
  "Careers & Openings",
  "Contact Details",
];

const RESPONSES: Record<string, string> = {
  property: "Alpha Premier Realty specializes in commercial towers, strategic land acquisitions, luxury residential developments, and high-yield real estate portfolios in Ortigas, Makati, and BGC.",
  realty: "Alpha Premier Realty specializes in commercial towers, strategic land acquisitions, luxury residential developments, and high-yield real estate portfolios in Ortigas, Makati, and BGC.",
  virtual: "Alpha Premier Virtual Office at Ortigas Center provides prestigious SEC & DTI business addresses, mail handling, call forwarding, and flexible conference facilities.",
  office: "Alpha Premier Virtual Office at Ortigas Center provides prestigious SEC & DTI business addresses, mail handling, call forwarding, and flexible conference facilities.",
  career: "We offer career opportunities across our real estate, construction, BPO outsourcing, facility services, and trading divisions. Explore our Careers section to apply.",
  opening: "We offer career opportunities across our real estate, construction, BPO outsourcing, facility services, and trading divisions. Explore our Careers section to apply.",
  contact: "Reach Alpha Premier Group Concierge at 0915 888 9482 / (02) 8 650 2540, or email contact@alphapremier.com. Office: Unit 3104, Tektite East Tower, Ortigas Center, Pasig City.",
  phone: "Contact our executive concierge directly at 0915 888 9482 / (02) 8 650 2540.",
  email: "Email Alpha Premier Group directly at contact@alphapremier.com.",
  ceo: "Alpha Premier Group of Companies is led by President and CEO Mr. Mark Anthony Abito-Santos.",
};

function getAPGReply(text: string): string {
  const lower = text.toLowerCase();
  for (const [key, reply] of Object.entries(RESPONSES)) {
    if (lower.includes(key)) return reply;
  }
  return "Thank you for reaching out to Alpha Premier Group. Our team has received your inquiry and can assist you via phone (0915 888 9482) or email (contact@alphapremier.com).";
}

export const AlphaAssistant: React.FC<AlphaAssistantProps> = () => {
  const accentColor = '#D4AF37';
  const accentRgb = '212, 175, 55';

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [greeted, setGreeted] = useState(false);
  const [thinking, setThinking] = useState(false);

  const msgEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Close chatbot when user clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (chatRef.current && target && !chatRef.current.contains(target)) {
        if (!target.closest('.luxe-chatbot-toggler')) {
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
      const welcomeText = "Greetings. I am Alpha Assistant, your executive AI concierge for Alpha Premier Group of Companies. How may I assist you today?";
      setMessages([{ text: welcomeText, sender: 'bot' }]);
      setGreeted(true);
    }
  }, [open, greeted]);

  const handleSend = async (customText?: string) => {
    const txt = (typeof customText === 'string' ? customText : input).trim();
    if (!txt || thinking) return;

    setMessages((prev) => [...prev, { text: txt, sender: 'user' }]);
    if (typeof customText !== 'string') setInput('');
    setThinking(true);

    try {
      const res = await aiChat(txt);
      if (res && res.content && !res.fallback) {
        setMessages((prev) => [...prev, { text: res.content, sender: 'bot' }]);
      } else {
        const reply = getAPGReply(txt);
        setMessages((prev) => [...prev, { text: reply, sender: 'bot' }]);
      }
    } catch {
      const reply = getAPGReply(txt);
      setMessages((prev) => [...prev, { text: reply, sender: 'bot' }]);
    } finally {
      setThinking(false);
    }
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

    const r = 212;
    const g = 175;
    const b = 55;

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
    doc.text('OFFICIAL EXECUTIVE AI CONCIERGE TRANSCRIPT', margin + 8, y);

    // Divider line
    y += 6;
    doc.setDrawColor(r, g, b);
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
        doc.setTextColor(15, 15, 18);
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
    doc.text('Alpha Premier Group of Companies', margin + 8, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(161, 161, 170);
    doc.text('Unit 3104, Tektite East Tower, Ortigas Center, Pasig City', margin + 8, footerY + 4);

    doc.text('Phone: 0915 888 9482 / (02) 8 650 2540', pageWidth - margin - 8, footerY, { align: 'right' });
    doc.text('Email: contact@alphapremier.com', pageWidth - margin - 8, footerY + 4, { align: 'right' });

    doc.save(`apg-inquiry-${refId}.pdf`);
  };

  const chatbotContent = (
    <div 
      className="luxe-chatbot-wrapper" 
      style={{ 
        '--luxe-accent': accentColor,
        '--luxe-accent-rgb': accentRgb,
      } as React.CSSProperties}
    >
      {/* Floating 3D Glowing AI Logo Toggle Button */}
      <button 
        className={`luxe-chatbot-toggler floating-ai-button ${open ? 'is-active rotate-90' : 'rotate-0'}`}
        onClick={() => setOpen(!open)}
        aria-label="Open Concierge Chat"
        title="Alpha Assistant AI"
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
          {/* Header */}
          <div className="luxe-chatbot-header">
            <div className="luxe-chatbot-brand">
              <div className="luxe-avatar-header">
                <Bot className="w-4 h-4 text-current" />
              </div>
              <div className="luxe-brand-text">
                <h3>Alpha Assistant AI</h3>
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
            {DEFAULT_PROMPTS.map((prompt, idx) => (
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
              placeholder="Ask Alpha Assistant..."
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
};
