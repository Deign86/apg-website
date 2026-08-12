import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import { MessageSquare, X, Send, Bot, User, Sparkles, RefreshCw, Building } from 'lucide-react';

interface AlphaAssistantProps {
  onOpenInquire?: () => void;
}

export const AlphaAssistant: React.FC<AlphaAssistantProps> = ({ onOpenInquire }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Greetings. I am Alpha Assistant, your executive AI concierge for Alpha Premier Group of Companies. How may I assist you with property investment, virtual offices, or enterprise solutions today?',
      timestamp: 'Just now'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'Tell me about Virtual Office plans',
    'What properties are available in Ortigas?',
    'How can I schedule a consultation?',
    'What open job positions do you have?'
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({
        role: m.sender,
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, history })
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "Thank you for your message. An Alpha Premier representative will assist you shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Assistant error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: "I am currently updating our system. You can also reach our team directly at info@alphapremiergroup.com or (+63 2) 8888-1234.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating Button matching screenshot */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center bg-[#0B0D12] hover:bg-neutral-900 border border-[#D4AF37] shadow-2xl transition-all transform hover:scale-105 active:scale-95 rounded-xl overflow-hidden"
        >
          <div className="bg-[#D4AF37] p-2.5 text-neutral-950">
            <MessageSquare className="w-5 h-5 fill-neutral-950" />
          </div>
          <div className="px-3.5 py-2 text-left">
            <span className="block text-[10px] font-black tracking-[0.2em] text-[#D4AF37] uppercase">
              ALPHA ASSISTANT
            </span>
          </div>
        </button>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[520px] bg-[#0B0D12] border border-[#D4AF37] shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 rounded-2xl">
          
          {/* Header */}
          <div className="bg-black border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-neutral-950 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-wider text-[#D4AF37] uppercase flex items-center gap-1.5">
                  ALPHA ASSISTANT
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <p className="text-[10px] text-neutral-400">Executive AI Concierge</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setMessages([messages[0]])}
                className="p-1.5 text-neutral-400 hover:text-[#D4AF37] transition-colors"
                title="Reset Chat"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-black/90 text-xs text-neutral-200">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5 rounded-full">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3 leading-relaxed rounded-xl ${
                    msg.sender === 'user'
                      ? 'bg-[#D4AF37] text-neutral-950 font-medium'
                      : 'bg-[#0B0D12] border border-neutral-800 text-neutral-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-neutral-800' : 'text-neutral-500'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 bg-neutral-800 text-neutral-300 flex items-center justify-center shrink-0 mt-0.5 rounded-full">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-neutral-400 text-xs py-2 px-1">
                <Sparkles className="w-4 h-4 text-[#D4AF37] animate-spin" />
                <span>Alpha Assistant is processing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Pills */}
          <div className="bg-[#0B0D12] px-3 py-2 border-t border-neutral-800 overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 bg-black hover:bg-[#D4AF37]/20 border border-neutral-800 hover:border-[#D4AF37] text-[10px] text-neutral-300 hover:text-[#D4AF37] transition-all rounded-lg"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-black border-t border-neutral-800 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about properties, virtual offices..."
              className="flex-1 bg-[#0B0D12] border border-neutral-800 focus:border-[#D4AF37] px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none rounded-lg"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2 bg-[#D4AF37] hover:bg-[#FFF3D1] disabled:opacity-40 text-neutral-950 transition-colors rounded-lg"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
