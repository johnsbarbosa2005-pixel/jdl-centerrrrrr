
import React, { useState, useRef, useEffect } from 'react';
import { getAIResponse } from '../services/gemini';
import { BotIcon, SendIcon } from './Icons';

export const AIChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Hi! I'm the JDL Center Room Assistant. Need help choosing a space or checking availability? Just ask!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: m.content }]
    }));

    const response = await getAIResponse(userMessage, history);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white rounded-none shadow-2xl w-80 sm:w-96 border-4 border-vsuBlack overflow-hidden mb-4 flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-vsuRed p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BotIcon size={20} />
              <span className="font-black uppercase tracking-tighter">Room Advisor AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-vsuBlack font-bold">✕</button>
          </div>
          
          <div ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-4 bg-white">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 text-sm font-bold ${
                  msg.role === 'user' 
                    ? 'bg-vsuBlack text-white' 
                    : 'bg-slate-100 text-vsuBlack border-l-4 border-vsuRed'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-3 animate-pulse border-l-4 border-vsuRed">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-vsuRed rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-vsuRed rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-vsuRed rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t-2 border-vsuBlack bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about rooms..."
              className="flex-1 bg-white border-2 border-vsuBlack px-4 py-2 text-sm focus:border-vsuRed outline-none font-bold"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="bg-vsuBlack p-2 text-white hover:bg-vsuRed transition-colors disabled:opacity-50"
            >
              <SendIcon size={18} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-vsuRed text-white p-4 rounded-none shadow-lg hover:scale-105 transition-transform flex items-center justify-center group"
      >
        <BotIcon size={28} className="group-hover:rotate-12 transition-transform" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap ml-0 group-hover:ml-2 font-black uppercase tracking-tight">
          Room Advisor
        </span>
      </button>
    </div>
  );
};
