import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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

  // Dynamic branding per subsidiary
  const botTitle = config ? `${config.name} Concierge` : 'Enterprise Concierge';
  const accentColor = config?.accentColor || '#C49A2A';
  const quickPrompts = DEFAULT_PROMPTS[slug] || DEFAULT_PROMPTS['luxe-prime'];
  const badgeLabel = slug === 'dynamic-tree' ? 'DYNAMIC AI' : 'LUXE AI';

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

  return (
    <div className="luxe-chatbot-wrapper" style={{ '--luxe-accent': accentColor }}>
      {/* Floating Toggle Button */}
      <button 
        className="luxe-chatbot-toggler" 
        onClick={() => setOpen(!open)}
        aria-label="Open Concierge Chat"
        title={`${botTitle} Assistant`}
      >
        {open ? <i className="fa-solid fa-xmark"></i> : <i className="fa-solid fa-sparkles"></i>}
      </button>

      {/* Chat Window Container */}
      {open && (
        <div className="luxe-chatbot-container">
          {/* Header */}
          <div className="luxe-chatbot-header">
            <div className="luxe-chatbot-brand">
              <i className="fa-solid fa-crown luxe-header-icon"></i>
              <div>
                <h3>{botTitle}</h3>
                <span className="luxe-chatbot-status">Online • White-Glove Support</span>
              </div>
            </div>
            <div className="luxe-header-actions">
              <span className="luxe-ai-badge">{badgeLabel}</span>
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
                  <span>Consulting Assistant...</span>
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
                {prompt}
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
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
