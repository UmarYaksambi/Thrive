'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import {
  BookOpen,
  FileText,
  Play,
  Newspaper,
  Search,
  Upload,
  X,
  Loader2,
  ExternalLink,
  Hash,
  Globe,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type LibraryItem = {
  id: string;
  title: string;
  creator: string;
  type: 'video' | 'article' | 'pdf' | 'blog';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  tags: string[];
  thumbnail_color: string;
  resource_url: string;
};

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

const getDifficultyColor = (diff: string) => {
  switch (diff) {
    case 'Beginner':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Intermediate':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Advanced':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState('All Languages');
  const [selectedDiff, setSelectedDiff] = useState('All Difficulties');
  const [selectedType, setSelectedType] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchLibraryItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedLang !== 'All Languages') params.append('lang', selectedLang);
      if (selectedDiff !== 'All Difficulties') params.append('diff', selectedDiff);
      if (selectedType !== 'All') params.append('type', selectedType);

      const res = await fetch(`/api/library?${params.toString()}`);
      const data = await res.json();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchLibraryItems, 400);
    return () => clearTimeout(t);
  }, [searchQuery, selectedLang, selectedDiff, selectedType]);

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#151313]">
      <Sidebar />
      <div className="ml-20">
        <Topbar />

        <main className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-4xl font-bold">Library</h2>
              <p className="text-gray-500 mt-1">
                Explore open-source resources or contribute your own.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[#151313] text-white px-5 py-2.5 rounded-xl font-semibold hover:scale-105 transition"
            >
              <Upload className="w-4 h-4" />
              Contribute
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 mb-8 space-y-4">
            {/* SEARCH + DROPDOWNS (FIXED) */}
            <div className="flex flex-col md:flex-row gap-3 items-center">
              {/* Search */}
              <div className="relative w-full md:w-[60%]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by title, creator, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-gray-50 border-gray-200"
                />
              </div>

              {/* Dropdowns */}
              <div className="flex gap-3 w-full md:w-auto">
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="h-10 w-full md:w-48 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm font-medium"
                >
                  <option>All Languages</option>
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>Hindi</option>
                </select>

                <select
                  value={selectedDiff}
                  onChange={(e) => setSelectedDiff(e.target.value)}
                  className="h-10 w-full md:w-48 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm font-medium"
                >
                  <option>All Difficulties</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            {/* Type pills */}
            <div className="flex gap-2 overflow-x-auto">
              {['All', 'Videos', 'Articles', 'PDFs', 'Blogs'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedType(filter)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm font-semibold',
                    selectedType === filter
                      ? 'bg-[#151313] text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const Icon = getContentIcon(item.type);
                return (
                  <a
                    key={item.id}
                    href={item.resource_url}
                    target="_blank"
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition"
                  >
                    <div
                      className="h-32 flex items-center justify-center relative"
                      style={{ backgroundColor: item.thumbnail_color }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                      <ExternalLink className="absolute top-3 right-3 w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2 text-xs">
                        <span className={cn('px-2 py-0.5 rounded border', getDifficultyColor(item.difficulty))}>
                          {item.difficulty}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Globe className="w-3 h-3" />
                          {item.language}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-500 mb-3">by {item.creator}</p>

                      <div className="flex flex-wrap gap-1">
                        {item.tags?.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-[10px] bg-gray-50 border rounded flex items-center gap-1"
                          >
                            <Hash className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
