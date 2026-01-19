import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { SettingsForm } from './settings-form';

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
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

        <main className="p-8">
          <SettingsForm
            profile={profile}
            email={user.email}
          />
        </main>
      </div>
    </div>
  );
}
