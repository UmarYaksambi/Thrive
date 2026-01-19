import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { ClassroomManagement } from '@/components/teacher/classroom-management';

export default async function TeacherStudentsPage() {
  const cookieStore = await cookies();

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
            // Ignored
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: role } = await supabase.rpc('get_user_role');
  const roleValue = String(role || '');
  const isAllowed = ['teacher', 'admin', 'supervisor'].includes(roleValue);

  if (!isAllowed) {
    return redirect('/dashboard?error=unauthorized');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar userRole={roleValue as any} />
      <div className="ml-20">
        <Topbar
          userName={profile?.full_name || 'Teacher'}
          userHandle={profile?.email?.split('@')[0] ? `@${profile.email.split('@')[0]}` : undefined}
          userAvatar={profile?.avatar_url}
        />
        <main className="p-8">
          <ClassroomManagement userId={user.id} />
        </main>
      </div>
    </div>
  );
}
