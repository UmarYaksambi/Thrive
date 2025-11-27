'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const topics = [
  { id: 1, name: 'React Fundamentals', mastery: 65 },
  { id: 2, name: 'State Management', mastery: 45 },
  { id: 3, name: 'Hooks & Effects', mastery: 80 },
  { id: 4, name: 'Performance', mastery: 30 },
  { id: 5, name: 'Testing', mastery: 50 },
];

const initialMessages = [
  {
    id: 1,
    sender: 'tutor',
    text: 'Hello! I\'m your AI tutor. Today we\'ll be learning about React. What would you like to focus on?',
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'user' as const,
        text: input,
      };
      setMessages([...messages, newMessage]);

      setTimeout(() => {
        const tutorMessage = {
          id: messages.length + 2,
          sender: 'tutor' as const,
          text: 'Great question! Let me explain that in detail. React uses a virtual DOM to efficiently update the UI. ' +
            'This means that when state changes, React doesn\'t directly manipulate the browser\'s DOM. Instead, ' +
            'it updates a virtual representation first, then reconciles the differences and applies minimal updates to the real DOM.',
        };
        setMessages((prev) => [...prev, tutorMessage]);
      }, 500);

      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar />
      <div className="ml-20">
        <Topbar />

        <main className="p-8 h-[calc(100vh-80px)] flex gap-6">
          <div className="flex-1 flex flex-col">
            <h2 className="text-3xl font-bold text-[#151313] mb-6">Unenthusiastic AI</h2>

            <div className="flex-1 bg-white rounded-3xl shadow-sm flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3',
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-md px-6 py-3 rounded-2xl',
                        message.sender === 'user'
                          ? 'bg-[#fccc42] text-[#151313]'
                          : 'bg-gray-100 text-[#151313]'
                      )}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 p-6">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 h-12 rounded-full border-2 border-gray-200 focus:border-[#fccc42] px-6"
                  />
                  <button
                    type="submit"
                    className="w-12 h-12 rounded-full bg-[#fccc42] flex items-center justify-center hover:bg-[#f4b91a] transition-colors"
                  >
                    <Send className="w-5 h-5 text-[#151313]" />
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
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={cn(
                    'p-4 rounded-2xl cursor-pointer transition-all',
                    selectedTopic === topic.id
                      ? 'bg-[#fccc42] text-[#151313]'
                      : 'bg-gray-50 hover:bg-gray-100 text-[#151313]'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">{topic.name}</span>
                    <span className="font-bold text-xs">
                      {topic.mastery}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#be94f5] transition-all"
                      style={{ width: `${topic.mastery}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-[#be94f5] text-white rounded-3xl p-4 text-center">
              <p className="text-xs font-semibold mb-2">Overall Mastery</p>
              <p className="text-3xl font-bold">54%</p>
              <p className="text-xs mt-2">Keep practicing to unlock more content!</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
