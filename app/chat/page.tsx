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
  is_success?: boolean;
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
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingMastery, setIsCreatingMastery] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch mastery data
  const fetchMastery = async () => {
    try {
      const res = await fetch('/api/chat/mastery');
      if (res.ok) {
        const data = await res.json();
        setTopics(data.topics || []);
        setOverallMastery(data.overallMastery || 0);
      } else {
        console.error('Failed to fetch mastery:', res.status, await res.text());
      }
    } catch (e) { console.error('Fetch mastery error:', e); }
  };

  // Initial load
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
      } catch (error) { console.error('Fetch history error:', error); } 
      finally { setIsLoadingHistory(false); }
    }
    init();
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // --- FIX 1: Update sendMessage to accept an optional specific topic ---
  const sendMessage = async (text: string, options: { hidden?: boolean; topic?: string } = {}) => {
    if (!text.trim() || isSending) return;
    
    setIsSending(true);

    // Add user message to UI (unless hidden)
    if (!options.hidden) {
      const userMsg: Message = { 
        id: Date.now().toString(), 
        sender: 'user', 
        message_text: text 
      };
      setMessages((prev) => [...prev, userMsg]);
    }
    
    setIsThinking(true);

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text, 
          sessionId,
          // Use the explicit topic if passed, otherwise fall back to state
          activeTopic: options.topic || activeTopic 
        }),
      });

      if (!res.ok || !res.body) throw new Error('Stream Error');

      const newSessionId = res.headers.get('x-session-id');
      if (newSessionId) setSessionId(newSessionId);

      setIsThinking(false);
      const aiMsgId = (Date.now() + 1).toString();
      
      setMessages((prev) => [...prev, { 
        id: aiMsgId, 
        sender: 'tutor', 
        message_text: '' 
      }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = '';
      const processedTags = new Set<string>();

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        accumulatedText += chunkValue;

        // Parse special tags
        const confirmMatch = accumulatedText.match(/\[CONFIRM_MASTERY:\s*(.*?)\]/);
        const successMatch = accumulatedText.match(/\[LESSON_COMPLETE:\s*(.*?):\s*(.*?)\]/);

        // Clean display text
        let displayText = accumulatedText
          .replace(/\[CONFIRM_MASTERY:\s*.*?\]/g, '')
          .replace(/\[LESSON_COMPLETE:\s*.*?:.*?\]/g, '')
          .trim();
        
        // Handle lesson completion (only once per tag)
        if (successMatch) {
          const fullTag = successMatch[0];
          const topic = successMatch[1].trim();
          const subtopic = successMatch[2].trim();
          
          if (!processedTags.has(fullTag)) {
            processedTags.add(fullTag);
            await handleLessonComplete(topic, subtopic);
          }
        }

        // Update message in UI
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          const lastMsg = { ...newMessages[lastIndex] };
          
          if (lastMsg.sender === 'tutor') {
            lastMsg.message_text = displayText;
            
            if (confirmMatch && !lastMsg.is_confirmation) {
              lastMsg.is_confirmation = true;
              lastMsg.confirmation_topic = confirmMatch[1].trim();
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
      console.error('Send message error:', error);
      setIsThinking(false);
    } finally {
      setIsSending(false);
    }
  };

  // --- FIX 2: Explicitly pass the topic when resuming ---
  const handleResumeMastery = (topic: Topic) => {
    setActiveTopic(topic.topic_name);
    
    const nextSubtopic = topic.subtopics.find(s => !s.completed);
    
    if (nextSubtopic) {
      const message = `Let's continue learning ${topic.topic_name}. I'm ready for ${nextSubtopic.name}.`;
      // Pass { topic: topic.topic_name } so the backend knows context immediately
      sendMessage(message, { topic: topic.topic_name });
    } else {
      const message = `I've completed ${topic.topic_name}. What's next?`;
      sendMessage(message, { topic: topic.topic_name });
    }
  };

  // Update mastery when lesson is complete
  const handleLessonComplete = async (topicName: string, subtopicName: string) => {
    try {
      const res = await fetch('/api/chat/mastery/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicName, subtopicName })
      });
      
      if (res.ok) {
        await fetchMastery(); // Refresh sidebar
      } else {
        console.error('Failed to update mastery:', await res.text());
      }
    } catch (e) { 
      console.error('Update mastery error:', e); 
    }
  };

  // Delete a mastery track
  const handleDeleteTopic = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this mastery track? This cannot be undone.")) return;
    
    try {
      await fetch(`/api/chat/mastery/delete?id=${id}`, { method: 'DELETE' });
      await fetchMastery();
      
      const deletedTopic = topics.find(t => t.id === id);
      if (deletedTopic && activeTopic === deletedTopic.topic_name) {
        setActiveTopic(null);
      }
    } catch (e) {
      console.error('Delete topic error:', e);
    }
  };

  // --- FIX 3: Explicitly pass topic when creating new mastery ---
  const handleConfirmMastery = async (topicName: string, messageId: string) => {
    setIsCreatingMastery(messageId);
    try {
      const res = await fetch('/api/chat/mastery/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicName }),
      });
      
      if (res.ok) {
        await fetchMastery();
        
        // This state update is slow...
        setActiveTopic(topicName.toLowerCase());
        
        // Remove confirmation UI
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, is_confirmation: false } : m
        ));
        
        // ...so we explicitly pass the topic here too
        await sendMessage(`Yes, let's start learning ${topicName}!`, { 
          hidden: false, 
          topic: topicName.toLowerCase() 
        });
      } else if (res.status === 409) {
        alert('This topic already exists!');
      }
    } catch (e) { 
      console.error('Create mastery error:', e); 
    } finally { 
      setIsCreatingMastery(null); 
    }
  };
  
  // Deny mastery creation
  const handleDenyMastery = async (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, is_confirmation: false } : m
    ));
    await sendMessage("No thanks, just explain it normally.");
  };
  
  // Clear chat history
  const handleDeleteHistory = async () => {
    setIsDeleting(true);
    try {
      const url = sessionId 
        ? `/api/chat/history?sessionId=${sessionId}` 
        : '/api/chat/history';
      await fetch(url, { method: 'DELETE' });
      setMessages([]);
      setSessionId(null);
      setActiveTopic(null);
    } catch (e) {
      console.error('Delete history error:', e);
    } finally {
      setIsDeleteModalOpen(false);
      setIsDeleting(false);
    }
  };

  // Form submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input;
    setInput('');
    sendMessage(text);
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
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-[#151313]">Unenthusiastic AI</h2>
                {activeTopic && (
                  <p className="text-sm text-gray-500 mt-1">
                    Learning: <span className="font-semibold capitalize">{activeTopic}</span>
                  </p>
                )}
              </div>
              {messages.length > 0 && (
                <button 
                  onClick={() => setIsDeleteModalOpen(true)} 
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-full font-semibold hover:bg-red-200 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" /> Clear Chat
                </button>
              )}
            </div>
            
            <div className="flex-1 bg-white rounded-3xl shadow-sm flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-400 text-lg">Start a conversation or select a topic to learn</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={cn(
                        'flex flex-col gap-2',
                        message.sender === 'user' ? 'items-end' : 'items-start'
                      )}
                    >
                      {message.message_text && (
                        <div 
                          className={cn(
                            'max-w-md px-6 py-3 rounded-2xl shadow-sm transition-all',
                            message.sender === 'user' 
                              ? 'bg-[#fccc42] text-[#151313]' 
                              : 'bg-gray-100 text-[#151313]',
                            message.is_success && 'ring-2 ring-green-400 bg-green-50'
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {message.message_text}
                          </p>
                          {message.is_success && (
                            <div className="mt-2 flex items-center gap-2 text-green-600 font-bold text-xs">
                              <CheckCircle2 className="w-4 h-4" /> Progress Updated!
                            </div>
                          )}
                        </div>
                      )}
                      
                      {message.is_confirmation && message.confirmation_topic && (
                        <div className="bg-[#e5f6fd] border-2 border-[#a8d8ea] p-4 rounded-2xl max-w-md mt-1">
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
                              className="flex-1 bg-[#0077b6] text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#005f8f] disabled:opacity-50"
                            >
                              {isCreatingMastery === message.id ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                              ) : (
                                'Yes, create it'
                              )}
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
                  ))
                )}
                
                {isThinking && (
                  <div className="bg-gray-100 px-6 py-4 rounded-2xl w-fit">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                    </div>
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
                    className="flex-1 h-12 rounded-full border-2 border-gray-200 focus:border-[#fccc42] px-6" 
                  />
                  <button 
                    type="submit" 
                    disabled={isSending || !input.trim()}
                    className="w-12 h-12 rounded-full bg-[#fccc42] flex items-center justify-center hover:bg-[#f4b91a] disabled:opacity-50 transition-colors"
                  >
                    {isSending && !isThinking ? (
                      <Loader2 className="w-5 h-5 animate-spin"/>
                    ) : (
                      <Send className="w-5 h-5"/>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          {/* Mastery Sidebar */}
          <div className="w-80 flex flex-col">
            <h3 className="text-xl font-bold text-[#151313] mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Topics & Mastery
            </h3>
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-3 flex-1 overflow-y-auto">
              {topics.length === 0 ? (
                <div className="text-center text-gray-400 py-8 text-sm">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No mastery tracks yet.</p>
                  <p className="text-xs mt-2">Ask me to teach you something!</p>
                </div>
              ) : (
                topics.map((topic) => (
                  <div 
                    key={topic.id} 
                    onClick={() => handleResumeMastery(topic)}
                    className={cn(
                      'p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] group relative',
                      activeTopic === topic.topic_name
                        ? 'bg-[#fccc42] text-[#151313] shadow-md' 
                        : 'bg-gray-50 hover:bg-gray-100 text-[#151313]'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm capitalize">{topic.topic_name}</span>
                      <span className="font-bold text-xs">{topic.mastery_percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#be94f5] transition-all" 
                        style={{ width: `${topic.mastery_percentage}%` }} 
                      />
                    </div>
                    
                    <button 
                      onClick={(e) => handleDeleteTopic(e, topic.id)}
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            {topics.length > 0 && (
              <div className="mt-4 bg-[#be94f5] text-white rounded-3xl p-4 text-center">
                <p className="text-xs font-semibold mb-2">Overall Mastery</p>
                <p className="text-3xl font-bold">{overallMastery}%</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}