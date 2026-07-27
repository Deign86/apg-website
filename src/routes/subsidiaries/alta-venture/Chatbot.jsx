import { useState, useRef, useEffect } from 'react';
import '../../../components/Chatbot.css';
import './av-chatbot.css';/*
 * Alta Venture chatbot — UI skeleton (no backend wired yet).
 *
 * Design clones APG's <Chatbot/>: same floating toggler, same panel
 * chrome, same input area. The greeting message identifies itself as
 * the AV assistant, and user input is acknowledged with a static
 * "we'll get back to you" placeholder reply rather than calling an AI
 * backend. This is a deliberate stub — when the AV chatbot context /
 * AI integration is ready, replace `placeholderReply()` with a real
 * aiChat() call (mirroring src/components/Chatbot.jsx) and remove this
 * comment.
 */

const GREETING = "Hi! I'm the Alta Venture assistant. How can I help you today?";

function placeholderReply(input) {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return "Could you share a bit more about what you're looking for?";
  if (/\b(service|services|what do you do|offer)\b/.test(trimmed))
    return "We offer Virtual CFO, Talent & HR, IT, Customer Experience, Back-Office, and Risk & Compliance outsourcing. Visit our Services page for full details.";
  if (/\b(price|cost|quote|how much)\b/.test(trimmed))
    return "Pricing is bespoke per engagement. Head to the Inquire page and send us a brief — we'll reply within one business day.";
  if (/\b(career|job|hire|apply)\b/.test(trimmed))
    return "We're hiring across Finance, People, CX, Tech, Operations, and Legal. Have a look at the Careers page for current openings.";
  if (/\b(contact|email|reach|talk|call)\b/.test(trimmed))
    return "You can reach us at hello@altaventureoutsourcing.com or +1 (800) ALTA-BIZ — or use the Inquire page to send a message right now.";
  return "Thanks for your message! A team member will follow up with you shortly. In the meantime, feel free to explore our Services or Careers pages.";
}

export default function AltaVentureChatbot() {
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
      setMessages([{ text: GREETING, sender: 'bot' }]);
      setGreeted(true);
    }
  }, [open, greeted]);

  const send = () => {
    const txt = input.trim();
    if (!txt || thinking) return;
    setMessages((prev) => [...prev, { text: txt, sender: 'user' }]);
    setInput('');
    setThinking(true);
    // Simulated thinking delay so the UX matches the APG chatbot feel.
    setTimeout(() => {
      const reply = placeholderReply(txt);
      setMessages((prev) => [...prev, { text: reply, sender: 'bot' }]);
      setThinking(false);
    }, 600);
  };

  return (
    <>
      <button
        className="chatbot-toggler av-chatbot-toggler"
        onClick={() => setOpen(!open)}
        aria-label="Open Alta Venture chat assistant"
      >
        <i className="fa-regular fa-comment"></i>
      </button>
      {open && (
        <div className="chatbot-container av-chatbot-container">
          <div className="chatbot-header av-chatbot-header">
            <h3>Alta Venture Assistant</h3>
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
            <button onClick={send} disabled={thinking} aria-label="Send message">
              <i className="fa-regular fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
