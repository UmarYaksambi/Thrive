'use client';

import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { Input } from '@/components/ui/input';
import { Send, BookOpen, Loader2, Trash2, PlusCircle, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

interface Message {
  id: string;
  sender: 'user' | 'tutor';
  message_text: string;
  is_confirmation?: boolean;
  confirmation_topic?: string;
  is_success?: boolean; // For "Level Up" messages
}

interface Subtopic {
  name: string;
  completed: boolean;
}

interface Topic {
  id: string;
  topic_name: string;
  mastery_percentage: number;
  subtopics: Subtopic[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [overallMastery, setOverallMastery] = useState(0);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // UI States
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  
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

  // --- 2. Shared Send Message ---
  const sendMessage = async (text: string, hidden: boolean = false) => {
    if (!text.trim() || isSending) return;
    setIsSending(true);

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
      
      setMessages((prev) => [...prev, { id: aiMsgId, sender: 'tutor', message_text: '' }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = '';
      
      // NEW: Track tags processed in this specific response to prevent duplicates
      const processedTags = new Set<string>();

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        accumulatedText += chunkValue;

        // --- PARSING TAGS ---
        const confirmMatch = accumulatedText.match(/\[CONFIRM_MASTERY:\s*(.*?)\]/);
        const successMatch = accumulatedText.match(/\[LESSON_COMPLETE:\s*(.*?):\s*(.*?)\]/);

        // Clean Text for Display
        let displayText = accumulatedText
          .replace(/\[CONFIRM_MASTERY:\s*.*?\]/, '')
          .replace(/\[LESSON_COMPLETE:\s*.*?:.*?\]/, '')
          .trim();
        
        // NEW: Handle Success Tag EXACTLY ONCE
        if (successMatch) {
            const fullTag = successMatch[0];
            const topic = successMatch[1].trim();
            const subtopic = successMatch[2].trim();
            
            // Only call API if we haven't processed this specific tag yet
            if (!processedTags.has(fullTag)) {
                processedTags.add(fullTag); // Mark as processed
                handleLessonComplete(topic, subtopic);
            }
        }

        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          const lastMsg = { ...newMessages[lastIndex] };
          
          if (lastMsg.sender === 'tutor') {
            lastMsg.message_text = displayText;
            
            if (confirmMatch && !lastMsg.is_confirmation) {
              lastMsg.is_confirmation = true;
              lastMsg.confirmation_topic = confirmMatch[1];
            }
            
            if (successMatch && !lastMsg.is_success) {
               lastMsg.is_success = true; 
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

  // --- 3. Mastery Logic ---

  // Triggered when clicking sidebar topic
  const handleResumeMastery = (topic: Topic) => {
    setSelectedTopicId(topic.id);
    
    // Find next uncompleted subtopic
    const nextSubtopic = topic.subtopics.find(s => !s.completed);
    
    if (nextSubtopic) {
        const prompt = `System: User is resuming mastery for '${topic.topic_name}'. 
        Current progress: ${topic.mastery_percentage}%. 
        The next subtopic is: '${nextSubtopic.name}'. 
        Please explain this concept simply, then ask the user to explain it back to verify understanding.`;
        
        sendMessage(prompt, true); // Hidden message
    } else {
        sendMessage(`System: User selected '${topic.topic_name}' but it is 100% complete. Congratulate them or offer advanced topics.`, true);
    }
  };

  const handleLessonComplete = async (topicName: string, subtopicName: string) => {
    try {
        await fetch('/api/chat/mastery/update', {
            method: 'POST',
            body: JSON.stringify({ topicName, subtopicName })
        });
        await fetchMastery(); // Refresh sidebar
    } catch (e) { console.error(e); }
  };

  const handleDeleteTopic = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent clicking the parent div
    if (!confirm("Delete this mastery track?")) return;
    
    await fetch(`/api/chat/mastery/delete?id=${id}`, { method: 'DELETE' });
    await fetchMastery();
  };

  // ... (handleConfirmMastery, handleDenyMastery, handleDeleteHistory, handleFormSubmit same as before) ...
  // [Copy from previous response or keep existing]
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input;
    setInput('');
    sendMessage(text);
  };
  
  const handleConfirmMastery = async (topicName: string, messageId: string) => {
    setIsCreatingMastery(messageId);
    try {
      const res = await fetch('/api/chat/mastery/create', {
        method: 'POST',
        body: JSON.stringify({ topic: topicName }),
      });
      if (res.ok) {
        await fetchMastery();
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_confirmation: false } : m));
        await sendMessage(`Yes, created ${topicName} track. Let's start!`, true);
      }
    } catch (e) { console.error(e); } finally { setIsCreatingMastery(null); }
  };
  
  const handleDenyMastery = async (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_confirmation: false } : m));
    await sendMessage("No, teach normally.", true);
  };
  
  const handleDeleteHistory = async () => {
    setIsDeleting(true);
    const url = sessionId ? `/api/chat/history?sessionId=${sessionId}` : '/api/chat/history';
    await fetch(url, { method: 'DELETE' });
    setMessages([]); setSessionId(null); setIsDeleteModalOpen(false); setIsDeleting(false);
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
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-[#151313]">Unenthusiastic AI</h2>
              {messages.length > 0 && (
                <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-full font-semibold hover:bg-red-200 transition-colors text-sm">
                  <Trash2 className="w-4 h-4" /> Clear Chat
                </button>
              )}
            </div>
            
            {/* Chat Area */}
            <div className="flex-1 bg-white rounded-3xl shadow-sm flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
                {messages.map((message) => (
                  <div key={message.id} className={cn('flex flex-col gap-2', message.sender === 'user' ? 'items-end' : 'items-start')}>
                    {/* Bubble */}
                    {message.message_text && (
                      <div className={cn('max-w-md px-6 py-3 rounded-2xl shadow-sm transition-all', message.sender === 'user' ? 'bg-[#fccc42] text-[#151313]' : 'bg-gray-100 text-[#151313]', message.is_success && 'ring-2 ring-green-400 bg-green-50')}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.message_text}</p>
                        {message.is_success && (
                            <div className="mt-2 flex items-center gap-2 text-green-600 font-bold text-xs">
                                <CheckCircle2 className="w-4 h-4" /> Progress Updated!
                            </div>
                        )}
                      </div>
                    )}
                    {/* Confirmation (Yes/No) */}
                    {message.is_confirmation && message.confirmation_topic && (
                      <div className="bg-[#e5f6fd] border-2 border-[#a8d8ea] p-4 rounded-2xl max-w-md mt-1">
                        <div className="flex items-center gap-3 mb-3">
                          <PlusCircle className="w-5 h-5 text-[#0077b6]" />
                          <p className="text-sm font-bold text-[#0077b6]">Start Mastery Track: {message.confirmation_topic}?</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleConfirmMastery(message.confirmation_topic!, message.id)} disabled={isCreatingMastery === message.id} className="flex-1 bg-[#0077b6] text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                            {isCreatingMastery === message.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, create it'}
                          </button>
                          <button onClick={() => handleDenyMastery(message.id)} className="px-4 py-2 bg-white border border-[#a8d8ea] text-[#0077b6] rounded-lg text-sm font-bold">No</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isThinking && <div className="bg-gray-100 px-6 py-4 rounded-2xl w-fit"><div className="flex gap-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div></div></div>}
                <div ref={messagesEndRef} className="h-4" />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-6">
                <form onSubmit={handleFormSubmit} className="flex gap-3">
                  <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything..." disabled={isSending} className="flex-1 h-12 rounded-full border-2 border-gray-200 focus:border-[#fccc42] px-6" />
                  <button type="submit" disabled={isSending || !input.trim()} className="w-12 h-12 rounded-full bg-[#fccc42] flex items-center justify-center hover:bg-[#f4b91a] disabled:opacity-50">
                    {isSending && !isThinking ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-80 flex flex-col">
            <h3 className="text-xl font-bold text-[#151313] mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Topics & Mastery
            </h3>
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-3 flex-1 overflow-y-auto">
              {topics.length === 0 ? (
                <div className="text-center text-gray-400 py-4 text-sm">No mastery data yet.</div>
              ) : (
                topics.map((topic) => (
                  <div key={topic.id} onClick={() => handleResumeMastery(topic)} className={cn('p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] group relative', selectedTopicId === topic.id ? 'bg-[#fccc42] text-[#151313]' : 'bg-gray-50 hover:bg-gray-100 text-[#151313]')}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm capitalize">{topic.topic_name}</span>
                      <span className="font-bold text-xs">{topic.mastery_percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#be94f5] transition-all" style={{ width: `${topic.mastery_percentage}%` }} />
                    </div>
                    {/* Delete Button */}
                    <button onClick={(e) => handleDeleteTopic(e, topic.id)} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500">
                        <X className="w-4 h-4" />
                    </button>
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