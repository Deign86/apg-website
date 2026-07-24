import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getEnterpriseConfig } from '../data/enterpriseConfig';
import './EnterpriseChatbot.css';

// Luxe Prime Standalone UI Fallback Responses
const LUXE_RESPONSES = {
  sublease: "Luxe Prime Realty offers a modern co-managed subleasing model that provides the flexibility of short and mid-term rentals while guaranteeing white-glove property care and tenant vetting.",
  subleasing: "Luxe Prime Realty offers a modern co-managed subleasing model that provides the flexibility of short and mid-term rentals while guaranteeing white-glove property care and tenant vetting.",
  admin: "Our End-to-End Property Administration oversees tenant vetting, lease management, maintenance dispatch, utility coordination, and financial reporting for seamless ownership.",
  administration: "Our End-to-End Property Administration oversees tenant vetting, lease management, maintenance dispatch, utility coordination, and financial reporting for seamless ownership.",
  property: "Luxe Prime manages exclusive luxury residential, commercial, and off-market portfolio properties across Metro Manila including BGC, Makati, and Ortigas.",
  portfolio: "Our private portfolio surfaces exclusive off-market listings before they reach the general market, offering unmatched prestige and investment yield.",
  contact: "You can reach Luxe Prime Concierge at 0915 888 9482 / 02 8 650 2540, or email contact@alphapremier.com. Our office is located at Unit 3104, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City.",
  phone: "Contact our concierge team directly at 0915 888 9482 / 02 8 650 2540.",
  email: "Email Luxe Prime Realty directly at contact@alphapremier.com.",
  ceo: "Luxe Prime Realty operates under Alpha Premier Group of Companies, led by President and CEO Mr. Mark Anthony Abito-Santos.",
  leadership: "Luxe Prime Realty operates under Alpha Premier Group of Companies, led by President and CEO Mr. Mark Anthony Abito-Santos.",
  hello: "Greetings! Welcome to Luxe Prime Realty. How may I assist you with your luxury property or sublease inquiry today?",
  hi: "Greetings! Welcome to Luxe Prime Realty. How may I assist you with your luxury property or sublease inquiry today?",
};

function getLuxeUiReply(text) {
  const lower = text.toLowerCase();
  for (const [key, reply] of Object.entries(LUXE_RESPONSES)) {
    if (lower.includes(key)) return reply;
  }
  return "Thank you for reaching out to Luxe Prime Realty. Our concierge team has received your query and can assist you further via phone (0915 888 9482) or email (contact@alphapremier.com).";
}

const QUICK_PROMPTS = [
  "Co-Managed Subleasing",
  "End-to-End Property Admin",
  "Private Portfolio",
  "Contact Concierge",
];

export default function EnterpriseChatbot() {
  const location = useLocation();
  const config = getEnterpriseConfig(location.pathname);

  // Personalized branding (defaults to Luxe Prime Realty)
  const botTitle = config ? `${config.name} Concierge` : 'Luxe Prime Concierge';
  const accentColor = config?.accentColor || '#C49A2A';

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [greeted, setGreeted] = useState(false);
  const [thinking, setThinking] = useState(false);

  const msgEndRef = useRef(null);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  useEffect(() => {
    if (open && !greeted) {
      setMessages([
        { 
          text: `Welcome to ${config?.name || 'Luxe Prime Realty'}. I am your AI Luxury Concierge. How may I assist you with subleasing, property administration, or off-market listings today?`, 
          sender: 'bot' 
        }
      ]);
      setGreeted(true);
    }
  }, [open, greeted, config?.name]);

  const handleSend = (customText) => {
    const txt = (typeof customText === 'string' ? customText : input).trim();
    if (!txt || thinking) return;

    // 1. Add user message to UI
    setMessages((prev) => [...prev, { text: txt, sender: 'user' }]);
    if (typeof customText !== 'string') setInput('');
    setThinking(true);

    // 2. Simulate AI concierge response UI delay
    setTimeout(() => {
      const reply = getLuxeUiReply(txt);
      setMessages((prev) => [...prev, { text: reply, sender: 'bot' }]);
      setThinking(false);
    }, 600);
  };

  return (
    <div className="luxe-chatbot-wrapper" style={{ '--luxe-accent': accentColor }}>
      {/* Floating Toggle Button */}
      <button 
        className="luxe-chatbot-toggler" 
        onClick={() => setOpen(!open)}
        aria-label="Open Luxury Concierge Chat"
        title="Luxe Concierge Assistant"
      >
        {open ? <i className="fa-solid fa-xmark"></i> : <i className="fa-solid fa-crown"></i>}
      </button>

      {/* Chat Window Container */}
      {open && (
        <div className="luxe-chatbot-container">
          {/* Header */}
          <div className="luxe-chatbot-header">
            <div className="luxe-chatbot-brand">
              <i className="fa-solid fa-gem luxe-header-icon"></i>
              <div>
                <h3>{botTitle}</h3>
                <span className="luxe-chatbot-status">Online • White-Glove Support</span>
              </div>
            </div>
            <div className="luxe-header-actions">
              <span className="luxe-ai-badge">LUXE AI</span>
              <button className="luxe-chatbot-close" onClick={() => setOpen(false)} aria-label="Close Chat">
                &times;
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="luxe-chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`luxe-msg ${msg.sender === 'user' ? 'luxe-msg-user' : 'luxe-msg-bot'}`}>
                {msg.sender === 'bot' && (
                  <div className="luxe-avatar-bot">
                    <i className="fa-solid fa-crown"></i>
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
                  <i className="fa-solid fa-crown"></i>
                </div>
                <div className="luxe-msg-bubble luxe-thinking">
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>Consulting Luxe Assistant...</span>
                </div>
              </div>
            )}

            <div ref={msgEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="luxe-quick-prompts">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button 
                key={idx} 
                className="luxe-chip" 
                onClick={() => handleSend(prompt)}
                disabled={thinking}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="luxe-chatbot-input-area">
            <input
              type="text"
              placeholder="Ask Luxe Concierge..."
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
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
