'use client';

import Link from 'next/link';
import { Search, Bell, User } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TopbarProps {
  userName?: string;
  userAvatar?: string;
  userHandle?: string;
}

export function Topbar({ userName = 'Kacie Velasquez', userAvatar, userHandle = '@k_velasquez' }: TopbarProps) {
  return (
    <div className="h-20 flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm border-b border-gray-200">
      <Link href="/" className="flex items-center gap-1.5 group">
        <span className="text-sm text-gray-500 tracking-wide group-hover:text-gray-700 transition-colors">
          Welcome to
        </span>
        <h1 className="text-3xl font-bold group-hover:opacity-90 transition-opacity">
          <span className="text-[#D8C4FB]">Th</span>
          <span className="text-[#151313]">rive</span>
        </h1>
      </Link>

      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search"
            className="pl-12 h-12 rounded-full border-2 border-gray-200 focus:border-[#fccc42] bg-white"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#fccc42] flex items-center justify-center text-[#151313] hover:bg-[#f4b91a] transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-[#fccc42] hover:bg-[#fccc42]/5 transition-colors relative">
          <Bell className="w-5 h-5 text-gray-700" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#fccc42] rounded-full"></span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#be94f5] to-[#ff5734] flex items-center justify-center">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="text-sm">
            <div className="font-semibold text-[#151313]">{userName}</div>
            <div className="text-gray-500 text-xs">{userHandle}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
