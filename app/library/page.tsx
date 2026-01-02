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

// --- Types ---
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

// --- Helpers ---
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
  // State: Data
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // State: Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState('All Languages');
  const [selectedDiff, setSelectedDiff] = useState('All Difficulties');
  const [selectedType, setSelectedType] = useState('All');

  // State: Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // --- Fetch Data ---
  const fetchLibraryItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedLang !== 'All Languages') params.append('lang', selectedLang);
      if (selectedDiff !== 'All Difficulties') params.append('diff', selectedDiff);
      if (selectedType !== 'All') params.append('type', selectedType);

      const res = await fetch(`/api/library?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce Search
  useEffect(() => {
    const t = setTimeout(fetchLibraryItems, 400);
    return () => clearTimeout(t);
  }, [searchQuery, selectedLang, selectedDiff, selectedType]);

  // --- Handle Upload ---
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // POST to our Next.js API route
      const res = await fetch('/api/library', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      // Success
      setIsModalOpen(false);
      fetchLibraryItems(); // Refresh the grid
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Failed to upload resource. Please check the console.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#151313]">
      <Sidebar />
      <div className="ml-20">
        <Topbar />

        <main className="p-8 max-w-7xl mx-auto">
          {/* --- Header --- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-4xl font-bold tracking-tight">Library</h2>
              <p className="text-gray-500 mt-2 font-medium">
                Explore open-source resources or contribute your own.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[#151313] text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-gray-200 hover:scale-105 hover:shadow-xl transition-all"
            >
              <Upload className="w-4 h-4" />
              Contribute
            </button>
          </div>

          {/* --- Filters Area --- */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-3 items-center">
              {/* Search Bar */}
              <div className="relative w-full md:w-[60%]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by title, creator, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                />
              </div>

              {/* Dropdowns */}
              <div className="flex gap-3 w-full md:w-auto">
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="h-10 w-full md:w-48 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#fccc42]/50"
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
                  className="h-10 w-full md:w-48 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#fccc42]/50"
                >
                  <option>All Difficulties</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            {/* Type Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {['All', 'Videos', 'Articles', 'PDFs', 'Blogs'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedType(filter)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap',
                    selectedType === filter
                      ? 'bg-[#151313] text-white shadow-md'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* --- Results Grid --- */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl">
              <p className="text-gray-400 font-medium">No resources found matching your criteria.</p>
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
                    rel="noopener noreferrer"
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                  >
                    <div
                      className="h-32 flex items-center justify-center relative"
                      style={{ backgroundColor: item.thumbnail_color }}
                    >
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Icon className="w-6 h-6 text-white drop-shadow-sm" />
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                         <ExternalLink className="w-3.5 h-3.5 text-gray-700" />
                      </div>
                      {/* Type Badge */}
                      <div className="absolute bottom-3 left-3">
                         <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-[10px] font-bold rounded-md shadow-sm uppercase tracking-wider text-[#151313]/80">
                           {item.type}
                         </span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 mb-2 text-xs">
                        <span className={cn('px-2 py-0.5 rounded border font-medium', getDifficultyColor(item.difficulty))}>
                          {item.difficulty}
                        </span>
                        {item.language !== 'English' && (
                          <span className="flex items-center gap-1 text-gray-500 font-medium">
                            <Globe className="w-3 h-3" />
                            {item.language}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-lg mb-1 leading-tight group-hover:text-[#fccc42] transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-1">by {item.creator}</p>

                      <div className="mt-auto pt-4 border-t border-gray-50 flex flex-wrap gap-1.5">
                        {item.tags?.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-gray-600 text-[10px] font-bold uppercase tracking-wide border border-gray-100"
                          >
                            <Hash className="w-2.5 h-2.5 mr-0.5 text-gray-400" />
                            {tag}
                          </span>
                        ))}
                        {(item.tags?.length || 0) > 3 && (
                            <span className="text-[10px] text-gray-400 py-1 px-1 font-medium">+{item.tags.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* --- Upload Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-xl font-bold text-[#151313]">Contribute Resource</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleUpload} className="space-y-5">
                <div className="space-y-4">
                   <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Title</label>
                          <Input name="title" required className="bg-gray-50 font-medium border-gray-200 focus:bg-white" placeholder="Resource Title"/>
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Creator</label>
                          <Input name="creator" required className="bg-gray-50 font-medium border-gray-200 focus:bg-white" placeholder="Author Name"/>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Type</label>
                          <select name="type" className="w-full h-10 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#fccc42]/50">
                              <option value="video">Video</option>
                              <option value="article">Article</option>
                              <option value="pdf">PDF Document</option>
                              <option value="blog">Blog Post</option>
                          </select>
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Difficulty</label>
                          <select name="difficulty" className="w-full h-10 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#fccc42]/50">
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                          </select>
                      </div>
                   </div>
                   
                   <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Language</label>
                       <select name="language" className="w-full h-10 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#fccc42]/50">
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                          <option value="Hindi">Hindi</option>
                      </select>
                   </div>

                   <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-900 uppercase tracking-wide block mb-1">External Link</label>
                          <Input name="url" placeholder="https://youtube.com/..." className="bg-white border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-400">
                        <span className="bg-gray-50 px-2 relative z-10">OR Upload PDF</span>
                        <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-0"></div>
                      </div>
                      <input 
                        type="file" 
                        name="file" 
                        accept=".pdf" 
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#151313] file:text-white hover:file:bg-gray-700 transition-all cursor-pointer"
                      />
                   </div>

                   <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tags</label>
                      <Input name="tags" placeholder="e.g. React, Math, History (comma separated)" className="bg-gray-50 border-gray-200 focus:bg-white" />
                   </div>
                </div>

                <div className="pt-2">
                  <button 
                    disabled={isUploading} 
                    type="submit" 
                    className="w-full bg-[#fccc42] text-[#151313] font-bold py-3.5 rounded-xl hover:bg-[#eebb2d] transition-all flex justify-center items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish Resource'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}