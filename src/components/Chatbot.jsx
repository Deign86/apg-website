import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { aiChat } from '@/lib/ai';
import './Chatbot.css';

const fallback = {
  // --- Leadership / CEO (catered reply even when the AI service is offline) ---
  // These run ONLY when /api/ai/chat is unavailable, guaranteeing a correct
  // answer about the company's President & CEO regardless of model/deploy state.
  'abito-santos': "Our President and Chief Executive Officer is Mr. Mark Anthony Abito-Santos. He leads Alpha Premier Group of Companies and its real estate operations. If you'd like more background, I can connect you with our office.",
  'mark anthony': "Our President and Chief Executive Officer is Mr. Mark Anthony Abito-Santos. He leads Alpha Premier Group of Companies and its real estate operations. If you'd like more background, I can connect you with our office.",
  abito: "Our President and Chief Executive Officer is Mr. Mark Anthony Abito-Santos. He leads Alpha Premier Group of Companies and its real estate operations. If you'd like more background, I can connect you with our office.",
  ceo: "Our President and Chief Executive Officer is Mr. Mark Anthony Abito-Santos. He leads Alpha Premier Group of Companies and its real estate operations. If you'd like more background, I can connect you with our office.",
  president: "Our President and Chief Executive Officer is Mr. Mark Anthony Abito-Santos. He leads Alpha Premier Group of Companies and its real estate operations. If you'd like more background, I can connect you with our office.",
  founder: "Our President and Chief Executive Officer is Mr. Mark Anthony Abito-Santos. He leads Alpha Premier Group of Companies and its real estate operations. If you'd like more background, I can connect you with our office.",
  leadership: "Our President and Chief Executive Officer is Mr. Mark Anthony Abito-Santos. He leads Alpha Premier Group of Companies and its real estate operations. If you'd like more background, I can connect you with our office.",
  // --- Existing keyword fallbacks ---
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
  'luxe prime': "Luxe Prime focuses on luxury lifestyle and premium experiences.",
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
  // AI feature flags loaded from the site_settings table (defaults: enabled).
  // This state MUST exist — the JSX below references aiSettings, and without
  // it the render throws `ReferenceError: aiSettings is not defined`, which
  // unmounts React and produces a blank/black screen on every page.
  const [aiSettings, setAiSettings] = useState({
    ai_enabled: 'true',
    ai_chatbot_enabled: 'true',
  });

  const msgEndRef = useRef(null);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && !greeted) {
      loadKB();
      const sid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      setSessionId(sid);
      setMessages([{ text: "Hello! I'm Alpha, your virtual assistant. How can I help you today?", sender: 'bot' }]);
      setGreeted(true);
    }
  }, [open, greeted]);
  // Load AI feature flags once on mount so the toggler + AI badge reflect
  // whatever the admin saved in site_settings (falls back to defaults).
  useEffect(() => {
    loadAiSettings(setAiSettings);
  }, []);


  const send = async () => {
    const txt = input.trim();
    if (!txt || thinking) return;
    setMessages((prev) => [...prev, { text: txt, sender: 'user' }]);
    setInput('');
    setThinking(true);

    const result = await aiChat(txt, history, { sessionId });
    if (result.content) {
      const reply = result.content;
      setHistory((prev) => [...prev, { role: 'user', content: txt }, { role: 'assistant', content: reply }]);
      setMessages((prev) => [...prev, { text: reply, sender: 'bot' }]);
    } else {
      const contextLength = messages.length < 4 ? '' : messages.slice(-3, -1).map(m => m.text).join(' ');
      const reply = getKeywordReply(txt + ' ' + contextLength);
      setMessages((prev) => [...prev, { text: reply, sender: 'bot' }]);
    }
    setThinking(false);
  };

  return (
    <>
      <button className="chatbot-toggler" onClick={() => setOpen(!open)} style={{ display: aiSettings.ai_enabled === 'false' ? 'none' : '' }}>
        <i className="fa-regular fa-comment"></i>
      </button>
      {open && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>Alpha Assistant {aiSettings.ai_chatbot_enabled !== 'false' && <span className="chatbot-ai-badge">AI</span>}</h3>
            <button className="chatbot-close" onClick={() => setOpen(false)}>&times;</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                <div className="msg-content">{msg.text}</div>
              </div>
            ))}
            {thinking && (
              <div className="message bot-message">
                <div className="msg-content">
                  <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: 6 }} />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={msgEndRef} />
          </div>
          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              disabled={thinking}
            />
            <button onClick={send} disabled={thinking}><i className="fa-regular fa-paper-plane"></i></button>
          </div>
        </div>
      )}
    </>
  );
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
