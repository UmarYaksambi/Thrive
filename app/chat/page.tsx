'use client';

import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { Input } from '@/components/ui/input';
import { Send, BookOpen, Loader2, Trash2, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

interface Message {
  id: string;
  sender: 'user' | 'tutor';
  message_text: string;
  is_confirmation?: boolean;
  confirmation_topic?: string;
}

interface Topic {
  id: string;
  topic_name: string;
  mastery_percentage: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [overallMastery, setOverallMastery] = useState(0);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  
  // UI States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingMastery, setIsCreatingMastery] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- 1. Fetch Data ---
  const fetchMastery = async () => {
    try {
      const res = await fetch('/api/chat/mastery');
      if (res.ok) {
        const data = await res.json();
        setTopics(data.topics || []);
        setOverallMastery(data.overallMastery || 0);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    async function init() {
      await fetchMastery();
      try {
        const historyRes = await fetch('/api/chat/history');
        if (historyRes.ok) {
          const data = await historyRes.json();
          setMessages(data);
          if (data.length > 0) setSessionId(data[0].session_id);
        }
      } catch (error) { console.error(error); } 
      finally { setIsLoadingHistory(false); }
    }
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // --- 2. Shared Send Message Logic ---
  // We extracted this so "Yes" and "No" buttons can also send messages
  const sendMessage = async (text: string, hidden: boolean = false) => {
    if (!text.trim() || isSending) return;
    setIsSending(true);

    // Only show the message in UI if it's NOT hidden
    if (!hidden) {
      const userMsg: Message = { id: Date.now().toString(), sender: 'user', message_text: text };
      setMessages((prev) => [...prev, userMsg]);
    }
    
    setIsThinking(true);

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId }),
      });

      if (!res.ok || !res.body) throw new Error('Stream Error');

      const newSessionId = res.headers.get('x-session-id');
      if (newSessionId) setSessionId(newSessionId);

      setIsThinking(false);
      const aiMsgId = (Date.now() + 1).toString();
      
      // Init AI Message
      setMessages((prev) => [...prev, { id: aiMsgId, sender: 'tutor', message_text: '' }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        accumulatedText += chunkValue;

        // Parse Tags
        const match = accumulatedText.match(/\[CONFIRM_MASTERY:\s*(.*?)\]/);
        let displayText = accumulatedText.replace(/\[CONFIRM_MASTERY:\s*.*?\]/, '').trim();
        
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          const lastMsg = { ...newMessages[lastIndex] };
          
          if (lastMsg.sender === 'tutor') {
            lastMsg.message_text = displayText;
            // Only set confirmation if found and NOT already set (prevents flicker)
            if (match && !lastMsg.is_confirmation) {
              lastMsg.is_confirmation = true;
              lastMsg.confirmation_topic = match[1];
            }
            newMessages[lastIndex] = lastMsg;
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error(error);
      setIsThinking(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input;
    setInput('');
    sendMessage(text);
  };

  // --- 3. Action Handlers ---

  const handleConfirmMastery = async (topicName: string, messageId: string) => {
    setIsCreatingMastery(messageId);
    
    try {
      // Step A: Create in DB
      const res = await fetch('/api/chat/mastery/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicName }),
      });

      if (res.ok) {
        // Step B: Update Sidebar
        await fetchMastery();
        
        // Step C: Remove the "Yes/No" buttons visually
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, is_confirmation: false } : m
        ));

        // Step D: Tell AI to proceed (Hidden message)
        // This triggers the "Regular manner" answer you wanted
        await sendMessage(`Yes, I have created the mastery track for ${topicName}. Please start teaching me.`, true);
      }
    } catch (error) {
      console.error('Error creating mastery:', error);
      alert('Failed to create mastery track. See console.');
    } finally {
      setIsCreatingMastery(null);
    }
  };

  const handleDenyMastery = async (messageId: string) => {
    // Step A: Remove buttons
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, is_confirmation: false } : m
    ));

    // Step B: Tell AI to proceed without mastery (Hidden message)
    await sendMessage("No, I don't want a mastery track. Just teach me normally.", true);
  };

  const handleDeleteHistory = async () => {
    setIsDeleting(true);
    try {
      const url = sessionId ? `/api/chat/history?sessionId=${sessionId}` : '/api/chat/history';
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        setMessages([]);
        setSessionId(null);
        setIsDeleteModalOpen(false);
      }
    } catch (error) { console.error(error); } 
    finally { setIsDeleting(false); }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar />
      <div className="ml-20">
        <Topbar />
        
        <ConfirmationModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteHistory}
          isLoading={isDeleting}
          title="Clear Chat History?"
          description="This will permanently delete the current conversation."
        />

        <main className="p-8 h-[calc(100vh-80px)] flex gap-6">
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-[#151313]">Unenthusiastic AI</h2>
              {messages.length > 0 && (
                <button 
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-full font-semibold hover:bg-red-200 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Chat
                </button>
              )}
            </div>
            
            <div className="flex-1 bg-white rounded-3xl shadow-sm flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
                {messages.map((message) => (
                  <div key={message.id} className={cn('flex flex-col gap-2', message.sender === 'user' ? 'items-end' : 'items-start')}>
                    
                    {/* Message Bubble */}
                    {message.message_text && (
                      <div className={cn(
                        'max-w-md px-6 py-3 rounded-2xl shadow-sm', 
                        message.sender === 'user' ? 'bg-[#fccc42] text-[#151313]' : 'bg-gray-100 text-[#151313]'
                      )}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.message_text}</p>
                      </div>
                    )}

                    {/* Confirmation UI */}
                    {message.is_confirmation && message.confirmation_topic && (
                      <div className="bg-[#e5f6fd] border-2 border-[#a8d8ea] p-4 rounded-2xl max-w-md animate-in slide-in-from-left-2 mt-1">
                        <div className="flex items-center gap-3 mb-3">
                          <PlusCircle className="w-5 h-5 text-[#0077b6]" />
                          <p className="text-sm font-bold text-[#0077b6]">
                            Start Mastery Track: {message.confirmation_topic}?
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConfirmMastery(message.confirmation_topic!, message.id)}
                            disabled={isCreatingMastery === message.id}
                            className="flex-1 bg-[#0077b6] hover:bg-[#023e8a] text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                          >
                            {isCreatingMastery === message.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, create it'}
                          </button>
                          <button 
                            onClick={() => handleDenyMastery(message.id)}
                            className="px-4 py-2 bg-white border border-[#a8d8ea] text-[#0077b6] rounded-lg text-sm font-bold hover:bg-gray-50"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isThinking && (
                  <div className="bg-gray-100 px-6 py-4 rounded-2xl flex items-center gap-1 w-fit">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>

              <div className="border-t border-gray-200 p-6">
                <form onSubmit={handleFormSubmit} className="flex gap-3">
                  <Input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Ask me anything..." 
                    disabled={isSending} 
                    className="flex-1 h-12 rounded-full border-2 border-gray-200 focus:border-[#fccc42] px-6 transition-all" 
                  />
                  <button 
                    type="submit" 
                    disabled={isSending || !input.trim()} 
                    className="w-12 h-12 rounded-full bg-[#fccc42] flex items-center justify-center hover:bg-[#f4b91a] transition-all disabled:opacity-50"
                  >
                    {isSending && !isThinking ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          <div className="w-80 flex flex-col">
            <h3 className="text-xl font-bold text-[#151313] mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Topics & Mastery
            </h3>
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-3 flex-1 overflow-y-auto">
              {topics.length === 0 ? (
                <div className="text-center text-gray-400 py-4 text-sm">No mastery data yet.</div>
              ) : (
                topics.map((topic) => (
                  <div key={topic.id} onClick={() => setSelectedTopicId(topic.id)} className={cn('p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02]', selectedTopicId === topic.id ? 'bg-[#fccc42] text-[#151313]' : 'bg-gray-50 hover:bg-gray-100 text-[#151313]')}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm capitalize">{topic.topic_name}</span>
                      <span className="font-bold text-xs">{topic.mastery_percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#be94f5] transition-all" style={{ width: `${topic.mastery_percentage}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 bg-[#be94f5] text-white rounded-3xl p-4 text-center">
              <p className="text-xs font-semibold mb-2">Overall Mastery</p>
              <p className="text-3xl font-bold">{overallMastery}%</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}