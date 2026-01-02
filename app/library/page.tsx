'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
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
  Download,
  Check,
  WifiOff,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useDownload } from '@/hooks/useDownload';

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
    case 'video': return Play;
    case 'pdf': return FileText;
    case 'article':
    case 'blog': return Newspaper;
    default: return BookOpen;
  }
};

const getDifficultyColor = (diff: string) => {
  switch (diff) {
    case 'Beginner': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Intermediate': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Advanced': return 'bg-rose-100 text-rose-700 border-rose-200';
    default: return 'bg-gray-100 text-gray-700';
  }
};

// --- Sub-Component: Resource Card ---
function ResourceCard({ item, isOfflineMode }: { item: LibraryItem, isOfflineMode: boolean }) {
  const { isDownloaded, downloading, progress, downloadResource, removeDownload, getOfflineUrl } = useDownload();
  const isCurrentlyDownloading = downloading.has(item.id);
  const downloadProgress = progress.get(item.id) || 0;
  const downloaded = isDownloaded(item.id);
  const Icon = getContentIcon(item.type);

  const handleCardClick = async () => {
    if (downloaded) {
      const localUrl = await getOfflineUrl(item.id);
      if (localUrl) window.open(localUrl, '_blank');
    } else if (!isOfflineMode) {
      window.open(item.resource_url, '_blank');
    } else {
      alert("You are offline and this resource is not downloaded.");
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (downloaded) {
      if (confirm('Remove this download from offline storage?')) {
        removeDownload(item.id);
      }
    } else {
      downloadResource(item);
    }
  };

  const isAvailable = !isOfflineMode || downloaded;

  return (
    <div 
      onClick={handleCardClick}
      className={cn(
        "group relative bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 flex flex-col h-full cursor-pointer",
        isAvailable ? "hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1" : "opacity-60 grayscale cursor-not-allowed"
      )}
    >
      <button
        onClick={handleDownloadClick}
        disabled={isOfflineMode && !downloaded}
        className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white transition-all border border-gray-100 group-hover:scale-110"
      >
        {isCurrentlyDownloading ? (
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="absolute -bottom-8 right-0 text-[10px] font-bold text-blue-600 bg-white px-1 rounded shadow-sm">
              {Math.round(downloadProgress)}%
            </span>
          </div>
        ) : downloaded ? (
          <Check className="w-5 h-5 text-green-600" />
        ) : (
          <Download className="w-5 h-5 text-gray-500 hover:text-gray-900" />
        )}
      </button>

      {downloaded && (
        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-green-100/90 backdrop-blur rounded-md border border-green-200 shadow-sm">
          <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider flex items-center gap-1">
             <Check className="w-3 h-3" /> Offline
          </span>
        </div>
      )}

      <div
        className="h-32 flex items-center justify-center relative"
        style={{ backgroundColor: item.thumbnail_color }}
      >
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Icon className="w-6 h-6 text-white drop-shadow-sm" />
        </div>
        {!downloaded && (
            <div className="absolute bottom-3 left-3">
                <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-[10px] font-bold rounded-md shadow-sm uppercase tracking-wider text-[#151313]/80">
                {item.type}
                </span>
            </div>
        )}
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
    </div>
  );
}

// --- Main Page Component ---
export default function LibraryPage() {
  const router = useRouter(); 
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState('All Languages');
  const [selectedDiff, setSelectedDiff] = useState('All Difficulties');
  const [selectedType, setSelectedType] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // --- CRITICAL FIX: PREFETCH & REDIRECT ---
  useEffect(() => {
    // 1. Prefetch the downloads page immediately so code is available
    if (navigator.onLine) {
        router.prefetch('/downloads');
    }

    const handleOffline = () => {
      setIsOffline(true);
      console.log("⚠️ Offline detected. Attempting redirect...");
      try {
        router.push('/downloads');
      } catch (e) {
        // Fallback if router fails due to missing chunks
        window.location.href = '/downloads';
      }
    };

    const handleOnline = () => setIsOffline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check on mount
    if (!navigator.onLine) {
       handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  const fetchLibraryItems = async () => {
    // Prevent fetching if offline to avoid errors
    if (!navigator.onLine) {
        setLoading(false);
        return;
    }

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

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      const t = setTimeout(fetchLibraryItems, 400);
      return () => clearTimeout(t);
    }
  }, [searchQuery, selectedLang, selectedDiff, selectedType, isOffline]);

  // Upload handler
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;

    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file && file.size > MAX_SIZE) {
      alert("File is too large! Please upload files smaller than 50MB or use an External Link.");
      return; 
    }

    setIsUploading(true);
    try {
      const res = await fetch('/api/library', { method: 'POST', body: formData });
      if (!res.ok) throw new Error((await res.json()).error);
      setIsModalOpen(false);
      fetchLibraryItems();
    } catch (error) {
      alert('Upload failed. Please try again.');
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
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-4xl font-bold tracking-tight">Library</h2>
                {isOffline && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1 border border-red-200">
                    <WifiOff className="w-3 h-3" /> Offline Mode
                  </span>
                )}
              </div>
              <p className="text-gray-500 mt-2 font-medium">
                {isOffline ? "Connection lost." : "Explore open-source resources or contribute your own."}
              </p>
            </div>
            {!isOffline ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-[#151313] text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-gray-200 hover:scale-105 hover:shadow-xl transition-all"
              >
                <Upload className="w-4 h-4" />
                Contribute
              </button>
            ) : (
                // Added a manual button in case auto-redirect fails
                <button
                onClick={() => router.push('/downloads')}
                className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:bg-red-700 transition-all animate-pulse"
              >
                Go to Downloads <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className={cn("bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 space-y-4", isOffline && "opacity-50 pointer-events-none")}>
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="relative w-full md:w-[60%]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                />
              </div>
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

          {/* Results Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl">
              <p className="text-gray-400 font-medium">No resources found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <ResourceCard key={item.id} item={item} isOfflineMode={isOffline} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Upload Modal */}
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
                          <Input name="title" required className="bg-gray-50 font-medium border-gray-200" placeholder="Resource Title"/>
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Creator</label>
                          <Input name="creator" required className="bg-gray-50 font-medium border-gray-200" placeholder="Author Name"/>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Type</label>
                          <select name="type" className="w-full h-10 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm">
                              <option value="video">Video</option>
                              <option value="article">Article</option>
                              <option value="pdf">PDF Document</option>
                              <option value="blog">Blog Post</option>
                          </select>
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Difficulty</label>
                          <select name="difficulty" className="w-full h-10 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm">
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                          </select>
                      </div>
                   </div>
                   
                   <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Language</label>
                       <select name="language" className="w-full h-10 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm">
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                          <option value="Hindi">Hindi</option>
                      </select>
                   </div>

                   <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-900 uppercase tracking-wide flex justify-between items-center mb-1">
                            <span>External Link</span>
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full normal-case font-medium">Recommended for Videos</span>
                          </label>
                          <Input name="url" placeholder="https://youtube.com/..." className="bg-white border-gray-200" />
                      </div>
                      
                      <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-400">
                        <span className="bg-gray-50 px-2 relative z-10">OR Upload File</span>
                        <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-0"></div>
                      </div>

                      <div className="space-y-2">
                        <input 
                          type="file" 
                          name="file" 
                          accept=".pdf,.mp4,video/mp4,video/webm" 
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#151313] file:text-white hover:file:bg-gray-700 transition-all cursor-pointer"
                        />
                        <div className="flex items-start gap-2 text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                           <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                           <p>Max file size: 50MB. For larger videos, please use an external link (YouTube/Vimeo) above.</p>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tags</label>
                      <Input name="tags" placeholder="e.g. React, Math" className="bg-gray-50 border-gray-200" />
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