'use client';

import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { BookOpen, FileText, Play, Newspaper, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const libraryContent = [
  {
    id: '1',
    type: 'video',
    title: 'React.js Advanced Patterns',
    creator: 'Vercel Academy',
    difficulty: 'Advanced',
    language: 'English',
    tags: ['React', 'JavaScript', 'Web Development'],
    thumbnail: '#be94f5',
  },
  {
    id: '2',
    type: 'article',
    title: 'Understanding Async/Await in JavaScript',
    creator: 'MDN Web Docs',
    difficulty: 'Intermediate',
    language: 'English',
    tags: ['JavaScript', 'Programming', 'Best Practices'],
    thumbnail: '#fccc42',
  },
  {
    id: '3',
    type: 'pdf',
    title: 'UI/UX Design Principles',
    creator: 'Design Systems Guild',
    difficulty: 'Beginner',
    language: 'English',
    tags: ['Design', 'UX', 'UI'],
    thumbnail: '#a8d8ea',
  },
  {
    id: '4',
    type: 'video',
    title: 'Public Speaking Masterclass',
    creator: 'Communication Pro',
    difficulty: 'Intermediate',
    language: 'English',
    tags: ['Communication', 'Leadership', 'Presentation'],
    thumbnail: '#be94f5',
  },
  {
    id: '5',
    type: 'blog',
    title: 'The Future of Web Development',
    creator: 'Tech Weekly',
    difficulty: 'Intermediate',
    language: 'English',
    tags: ['Web Development', 'Technology', 'Future'],
    thumbnail: '#fccc42',
  },
  {
    id: '6',
    type: 'article',
    title: 'Data Science Fundamentals',
    creator: 'Analytics Hub',
    difficulty: 'Beginner',
    language: 'English',
    tags: ['Data Science', 'Python', 'Analytics'],
    thumbnail: '#a8d8ea',
  },
];

const getContentIcon = (type: string) => {
  switch (type) {
    case 'video':
      return Play;
    case 'pdf':
      return FileText;
    case 'article':
    case 'blog':
      return Newspaper;
    default:
      return BookOpen;
  }
};

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar />
      <div className="ml-20">
        <Topbar />

        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-[#151313] mb-6">Open Digital Library</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search resources..."
                  className="pl-12 h-12 rounded-full border-2 border-gray-200 focus:border-[#fccc42] bg-white"
                />
              </div>

              <select className="px-4 h-12 rounded-full border-2 border-gray-200 focus:border-[#fccc42] bg-white font-semibold text-[#151313]">
                <option>All Languages</option>
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>Hindi</option>
              </select>

              <select className="px-4 h-12 rounded-full border-2 border-gray-200 focus:border-[#fccc42] bg-white font-semibold text-[#151313]">
                <option>All Difficulties</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <div className="flex gap-2 mb-8 flex-wrap">
              {['All', 'Videos', 'Articles', 'PDFs', 'Blogs'].map((filter) => (
                <button
                  key={filter}
                  className={cn(
                    'px-6 py-2 rounded-full font-semibold transition-colors',
                    filter === 'All'
                      ? 'bg-[#151313] text-white'
                      : 'bg-white border-2 border-gray-200 text-[#151313] hover:border-[#fccc42]'
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {libraryContent.map((item) => {
              const Icon = getContentIcon(item.type);
              return (
                <div
                  key={item.id}
                  className="learnify-card bg-white overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <div
                    className="h-40 flex items-center justify-center relative"
                    style={{ backgroundColor: item.thumbnail }}
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-[#151313]/5 text-[#151313] text-xs font-bold rounded-full">
                        {item.type}
                      </span>
                      <span
                        className={cn(
                          'text-xs font-semibold px-3 py-1 rounded-full',
                          item.difficulty === 'Beginner'
                            ? 'bg-[#a8d8ea] text-[#151313]'
                            : item.difficulty === 'Intermediate'
                            ? 'bg-[#fccc42] text-[#151313]'
                            : 'bg-[#be94f5] text-white'
                        )}
                      >
                        {item.difficulty}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#151313] mb-2 line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4">{item.creator}</p>

                    <div className="flex flex-wrap gap-2">
                      {item.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
