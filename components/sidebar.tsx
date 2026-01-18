'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, LayoutGrid, PieChart, Calendar, MessageCircle, Settings, LogOut, Shield, GraduationCap, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/app/login/actions';
import { createBrowserClient } from '@supabase/ssr';

interface SidebarProps {
  userRole?: 'admin' | 'teacher' | 'supervisor' | 'student';
}

export function Sidebar({ userRole: initialRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | undefined>(initialRole);

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  useEffect(() => {
    if (!initialRole && !role) {
      const fetchRole = async () => {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data } = await supabase.rpc('get_user_role');
        if (data) setRole(data);
      };
      fetchRole();
    }
  }, [initialRole, role]);

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  const getLinks = (role?: string) => {
    const common = [
      { icon: LayoutGrid, label: 'Dashboard', href: role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/dashboard' },
      { icon: BookOpen, label: 'Library', href: '/library' },
      { icon: PieChart, label: 'Planner', href: '/planner' },
      { icon: Calendar, label: 'Calendar', href: '/calendar' },
      { icon: MessageCircle, label: 'Chat', href: '/chat' },
    ];

    if (role === 'admin' || role === 'supervisor') {
      return [
        { icon: Shield, label: 'Admin Panel', href: '/admin' },
        ...common,
        { icon: Settings, label: 'Settings', href: '/settings' },
      ];
    }

    if (role === 'teacher') {
      return [
        { icon: GraduationCap, label: 'Teacher Dashboard', href: '/teacher' },
        { icon: Users, label: 'My Students', href: '/teacher/students' },
        ...common,
        { icon: Settings, label: 'Settings', href: '/settings' },
      ];
    }

    // Student / Default
    return [
      ...common,
      // Added Profile link for students to see contributions
      { icon: Users, label: 'My Profile', href: '/dashboard/profile' },
      { icon: Settings, label: 'Settings', href: '/settings' },
    ];
  };

  // Dedup links based on href
  const links = getLinks(role).filter((v, i, a) => a.findIndex(v2 => (v2.href === v.href)) === i);

  return (
    <div className="fixed left-0 top-0 h-screen w-20 bg-[#151313] flex flex-col items-center py-8 z-50 transition-all duration-300">
      <div className="flex flex-col items-center gap-4 flex-1">
        {links.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/dashboard' && item.href !== '/admin');

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

      <button
        onClick={handleLogout}
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white hover:bg-[#2a2828] transition-all hover:scale-110"
        title="Logout"
      >
        <LogOut className="w-6 h-6" />
      </button>
    </div>
  );
}