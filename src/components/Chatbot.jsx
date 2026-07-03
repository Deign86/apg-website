import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import './Chatbot.css';

const fallback = {
  hello: "Greetings! How may I assist you with Alpha Premier?",
  hi: "Greetings! How may I assist you with Alpha Premier?",
  realty: "Our realty arm, Alpha Premier Realty, offers residential, commercial, and industrial properties. Would you like a callback?",
  property: "Our realty arm, Alpha Premier Realty, offers residential, commercial, and industrial properties. Would you like a callback?",
  'virtual office': "Alpha Premier Virtual Office at Ortigas provides premium addresses and flexible workspaces.",
  career: "We have exciting career opportunities! Please visit our Careers page.",
  job: "We have exciting career opportunities! Please visit our Careers page.",
  contact: "You can reach us via the Inquire button below or call +63 (2) 1234 5678.",
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

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [greeted, setGreeted] = useState(false);
  const msgEndRef = useRef(null);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && !greeted) {
      loadKB();
      setMessages([{ text: "Hello! I'm Alpha virtual assistant. How can I help you today?", sender: 'bot' }]);
      setGreeted(true);
    }
  }, [open, greeted]);

  const send = () => {
    const txt = input.trim();
    if (!txt) return;
    setMessages((prev) => [...prev, { text: txt, sender: 'user' }]);
    setInput('');
    setTimeout(() => {
      const reply = getReply(txt);
      setMessages((prev) => [...prev, { text: reply, sender: 'bot' }]);
    }, 400);
  };

  return (
    <>
      <button className="chatbot-toggler" onClick={() => setOpen(!open)}>
        <i className="fa-regular fa-comment"></i>
      </button>
      {open && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>Alpha Assistant</h3>
            <button className="chatbot-close" onClick={() => setOpen(false)}>&times;</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                <div className="msg-content">{msg.text}</div>
              </div>
            ))}
            <div ref={msgEndRef} />
          </div>
          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button onClick={send}><i className="fa-regular fa-paper-plane"></i></button>
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

function getReply(text) {
  const lower = text.toLowerCase();
  if (kbCache && Array.isArray(kbCache)) {
    for (const entry of kbCache) {
      const triggers = (entry.trigger || "").split(",").map(t => t.trim().toLowerCase());
      if (triggers.some(t => lower.includes(t))) return entry.answer;
    }
  }
  for (const [key, reply] of Object.entries(fallback)) {
    if (lower.includes(key)) return reply;
  }
  return "I\'m sorry, I didn\'t understand. Please contact our team for detailed assistance.";
}
