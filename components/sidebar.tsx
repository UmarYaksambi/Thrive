'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutGrid, PieChart, Calendar, MessageCircle, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
  { icon: BookOpen, label: 'Library', href: '/library' },
  { icon: PieChart, label: 'Planner', href: '/planner' },
  { icon: Calendar, label: 'Calendar', href: '/calendar' },
  { icon: MessageCircle, label: 'Chat', href: '/chat' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 h-screen w-20 bg-[#151313] flex flex-col items-center py-8 z-50">
      <div className="flex flex-col items-center gap-4 flex-1">
        {sidebarItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={index}
              href={item.href}
              className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center transition-all hover:scale-110',
                isActive
                  ? 'bg-[#fccc42] text-[#151313]'
                  : 'text-white hover:bg-[#2a2828]'
              )}
              title={item.label}
            >
              <Icon className="w-6 h-6" />
            </Link>
          );
        })}
      </div>

      <button className="w-14 h-14 rounded-2xl flex items-center justify-center text-white hover:bg-[#2a2828] transition-all hover:scale-110" title="Logout">
        <LogOut className="w-6 h-6" />
      </button>
    </div>
  );
}
