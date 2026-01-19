'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, HelpCircle, GripHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ bottom: 24, right: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  
  // Chat State
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I can help you with your courses. What are you working on?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Dragging Logic ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      // Calculate new position based on window coordinates
      // Note: This simple logic sets bottom/right based on mouse position
      // In a real app, you might use transform: translate
      const newBottom = window.innerHeight - e.clientY - 25;
      const newRight = window.innerWidth - e.clientX - 25;
      setPosition({ bottom: Math.max(0, newBottom), right: Math.max(0, newRight) });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, newMsg] })
      });
      const data = await res.json();
      setMessages(prev => [...prev, data]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      ref={dragRef}
      className="fixed z-50 flex flex-col items-end"
      style={{ bottom: `${position.bottom}px`, right: `${position.right}px` }}
    >
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-[#151313] p-4 flex items-center justify-between text-white cursor-move"
             onMouseDown={() => setIsDragging(true)}
          >
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
               <span className="font-bold">Course Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 bg-gray-50 space-y-3">
             {messages.map((m, i) => (
               <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                    m.role === 'user' 
                    ? 'bg-[#151313] text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                  }`}>
                    {m.content}
                  </div>
               </div>
             ))}
             {isLoading && <div className="text-xs text-gray-400 ml-2">Thinking...</div>}
             <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#fccc42]"
              placeholder="Ask about your courses..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage}
              disabled={isLoading}
              className="p-2 bg-[#ff5734] text-white rounded-full hover:bg-[#e64d2d] disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* LEVITATING BUBBLE */}
      <button 
        onMouseDown={(e) => {
           // Only drag if not clicking to open (handled by click)
           // We use a small timeout to distinguish click vs drag if needed, 
           // but keeping it simple: MouseDown starts drag logic in useEffect
           setIsDragging(true); 
        }}
        onClick={(e) => {
           if(!isDragging) setIsOpen(!isOpen);
        }}
        className={cn(
          "w-16 h-16 rounded-full bg-[#151313] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-move active:cursor-grabbing",
          isOpen ? "bg-[#ff5734]" : "bg-[#151313]"
        )}
      >
        {isOpen ? <X size={28} /> : <HelpCircle size={32} />}
      </button>
    </div>
  );
}