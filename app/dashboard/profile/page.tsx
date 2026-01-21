'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { createBrowserClient } from '@supabase/ssr';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Contribution = {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  type: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [contributions, setContributions] = useState<
    Contribution[]
  >([]);
  const [loading, setLoading] = useState(true);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase =
    supabaseUrl && supabaseKey
      ? createBrowserClient(supabaseUrl, supabaseKey)
      : null;

  useEffect(() => {
    if (!supabase) return;
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profile);

      // Fetch Contributions
      const { data: items } = await supabase
        .from('library_items')
        .select('*')
        .eq('submitted_by', user.id)
        .order('created_at', { ascending: false });

      if (items) setContributions(items as Contribution[]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const getStatusBadge = (
    status: string,
    reason?: string
  ) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex gap-1">
            <CheckCircle className="w-3 h-3" /> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <div className="flex flex-col items-start gap-1">
            <Badge
              variant="destructive"
              className="flex gap-1"
            >
              <XCircle className="w-3 h-3" /> Rejected
            </Badge>
            {reason && (
              <span className="text-xs text-red-500 font-medium">
                Reason: {reason}
              </span>
            )}
          </div>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 flex gap-1"
          >
            <Clock className="w-3 h-3" /> Pending Review
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#151313]">
      <Sidebar />
      <div className="ml-20">
        <Topbar
          userName={profile?.full_name || 'Learner'}
          userHandle={
            profile?.email?.split('@')[0]
              ? `@${profile.email.split('@')[0]}`
              : undefined
          }
          userAvatar={profile?.avatar_url}
        />

        <main className="p-8 max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight mb-8">
            My Profile
          </h1>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl p-8 mb-10 shadow-sm border border-gray-100 flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-500">
              {profile?.full_name?.[0] ||
                user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {profile?.full_name || 'User'}
              </h2>
              <p className="text-gray-500">{user?.email}</p>
              <div className="mt-2 flex gap-2">
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-600"
                >
                  Student
                </Badge>
              </div>
            </div>
          </div>

          {/* Contributions Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-gray-400" />
              My Contributions
              <span className="text-sm font-normal text-gray-500 ml-2 bg-gray-100 px-2 py-0.5 rounded-full">
                {contributions.length}
              </span>
            </h2>

            {loading ? (
              <div className="text-center py-10 text-gray-400">
                Loading contributions...
              </div>
            ) : contributions.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-gray-200">
                <p className="text-gray-500 mb-4">
                  You haven't contributed any resources yet.
                </p>
                <a
                  href="/library"
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Go to Library to Contribute
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {contributions.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-shadow flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 grid place-items-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {item.title}
                        </h3>
                        <div className="text-xs text-gray-400 flex items-center gap-2">
                          <span className="capitalize">
                            {item.type}
                          </span>
                          <span>•</span>
                          <span>
                            Submitted{' '}
                            {item.created_at
                              ? formatDistanceToNow(
                                  new Date(item.created_at),
                                  { addSuffix: true }
                                )
                              : 'Recently'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(
                        item.status,
                        item.rejection_reason
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
