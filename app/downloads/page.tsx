'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { useDownload } from '@/hooks/useDownload';
import { formatBytes, formatDate, cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  FileText,
  Play,
  Newspaper,
  Trash2,
  ExternalLink,
  Hash,
  Globe,
  Search,
  HardDrive,
  Clock,
  ArrowRight
} from 'lucide-react';

// --- Types ---
// Matches the shape stored in 'metadata'
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

// --- Component: Download Card ---
function DownloadCard({ download, removeDownload, getOfflineUrl }: any) {
  // We use the stored metadata to populate the UI (colors, tags, etc.)
  // Fallback values provided in case metadata is missing
  const item: Partial<LibraryItem> = download.metadata || {};
  const Icon = getContentIcon(download.type);

  const handleCardClick = async () => {
    // Fetch the Blob URL only when clicked to save memory
    const url = await getOfflineUrl(download.id);
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('Could not load offline file.');
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 flex flex-col h-full cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1"
    >
      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent card click
          if (confirm('Remove this download from offline storage?')) {
            removeDownload(download.id);
          }
        }}
        className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-red-50 transition-all border border-gray-100 group-hover:scale-110"
        title="Remove Download"
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </button>

      {/* Offline Badge */}
      <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-green-100/90 backdrop-blur rounded-md border border-green-200 shadow-sm">
        <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider flex items-center gap-1">
           <HardDrive className="w-3 h-3" /> Offline Ready
        </span>
      </div>

      {/* Thumbnail */}
      <div
        className="h-32 flex items-center justify-center relative"
        style={{ backgroundColor: item.thumbnail_color || '#e5e7eb' }}
      >
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Icon className="w-6 h-6 text-white drop-shadow-sm" />
        </div>
        
        {/* Type Label */}
        <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-[10px] font-bold rounded-md shadow-sm uppercase tracking-wider text-[#151313]/80">
            {download.type}
            </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-2 text-xs">
          {item.difficulty && (
            <span className={cn('px-2 py-0.5 rounded border font-medium', getDifficultyColor(item.difficulty))}>
              {item.difficulty}
            </span>
          )}
          {item.language && item.language !== 'English' && (
            <span className="flex items-center gap-1 text-gray-500 font-medium">
              <Globe className="w-3 h-3" />
              {item.language}
            </span>
          )}
        </div>

        <h3 className="font-bold text-lg mb-1 leading-tight group-hover:text-[#fccc42] transition-colors line-clamp-2">
          {download.title}
        </h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-1">by {download.creator}</p>

        {/* Download Stats (Size & Date) */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-400 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
           <div className="flex items-center gap-1.5">
              <HardDrive className="w-3 h-3" />
              {formatBytes(download.size)}
           </div>
           <div className="w-px h-3 bg-gray-200"></div>
           <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {formatDate(download.downloadedAt)}
           </div>
        </div>

        {/* Tags */}
        <div className="mt-auto pt-4 border-t border-gray-50 flex flex-wrap gap-1.5">
          {(item.tags ?? []).slice(0, 3).map((tag: string, i: number) => (
            <span
              key={i}
              className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-gray-600 text-[10px] font-bold uppercase tracking-wide border border-gray-100"
            >
              <Hash className="w-2.5 h-2.5 mr-0.5 text-gray-400" />
              {tag}
            </span>
          ))}
          {((item.tags ?? []).length) > 3 && (
              <span className="text-[10px] text-gray-400 py-1 px-1 font-medium">+{(item.tags ?? []).length - 3} more</span>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---
export default function DownloadsPage() {
  const { downloads, removeDownload, getOfflineUrl } = useDownload();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter downloads locally
  const filteredDownloads = downloads.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#151313]">
      <Sidebar />
      <div className="ml-20">
        <Topbar />
        
        <main className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
             <div>
               <h2 className="text-4xl font-bold tracking-tight mb-2">My Downloads</h2>
               <p className="text-gray-500 font-medium">
                 Access your saved content offline, anytime.
               </p>
             </div>
          </div>

          {/* Search Bar (Only show if there are downloads) */}
          {downloads.length > 0 && (
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8">
               <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search your downloads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                  />
               </div>
             </div>
          )}

          {/* Empty State */}
          {downloads.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <HardDrive className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No downloads yet</h3>
              <p className="text-gray-500 font-medium mb-6 max-w-sm mx-auto">
                Content you download from the library will appear here for offline access.
              </p>
              <Link 
                href="/" // Redirect to Library/Home
                className="inline-flex items-center gap-2 bg-[#151313] text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-900 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Browse Library <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : filteredDownloads.length === 0 ? (
             <div className="text-center py-20">
               <p className="text-gray-400 font-medium">No matching downloads found.</p>
             </div>
          ) : (
            /* Downloads Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDownloads.map((download) => (
                <DownloadCard 
                   key={download.id} 
                   download={download} 
                   removeDownload={removeDownload} 
                   getOfflineUrl={getOfflineUrl}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}