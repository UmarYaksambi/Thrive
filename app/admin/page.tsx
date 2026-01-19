import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { AdminDashboard } from '@/components/admin/admin-dashboard';

export default async function AdminPage() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) => {
              cookieStore.set({ name, value, ...options });
            });
          } catch {
            // Ignored: can throw in some server contexts
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: role, error: roleError } = await supabase.rpc('get_user_role');

  const roleValue = String(role || '');
  const isAllowedAdminRole = ['admin', 'supervisor'].includes(roleValue);

  if (roleError || !isAllowedAdminRole) {
    return redirect('/dashboard?error=unauthorized');
  }

  const adminRole = roleValue as 'admin' | 'teacher' | 'supervisor';

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar userRole={adminRole} />
      <div className="ml-20">
        <Topbar
          userName={profile?.full_name || 'Learner'}
          userHandle={profile?.email?.split('@')[0] ? `@${profile.email.split('@')[0]}` : undefined}
          userAvatar={profile?.avatar_url}
        />
        <main className="p-8">
          <AdminDashboard userId={user.id} userRole={adminRole} />
        </main>
      </div>
    </div>
  );
}
