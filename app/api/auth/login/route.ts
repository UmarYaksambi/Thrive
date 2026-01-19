import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();

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
            // Ignored: can throw in some server contexts
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  const { data: role, error: roleError } = await supabase.rpc('get_user_role');
  const roleValue = String(role || '');
  const isAllowedAdminRole = ['admin', 'teacher', 'supervisor'].includes(roleValue);

  if (roleError) {
    await supabase.auth.signOut();
    return NextResponse.json(
      {
        error:
          'Unable to verify admin role. Ensure the Supabase migration defining get_user_role() and user_roles policies has been applied to this project.',
      },
      { status: 403 }
    );
  }

  if (!isAllowedAdminRole) {
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: 'Access denied. Admin privileges required.' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    user: data.user,
    role: roleValue as 'admin' | 'teacher' | 'supervisor',
  });
}
