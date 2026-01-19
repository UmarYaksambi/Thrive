import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password, inviteCode } = await request.json();
  
  // Verify invite code
  if (inviteCode !== process.env.ADMIN_INVITE_CODE) {
    return NextResponse.json(
      { error: 'Invalid admin invite code' },
      { status: 403 }
    );
  }

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

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      {
        error:
          'Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local to allow creating the first admin (required due to RLS on user_roles).',
      },
      { status: 500 }
    );
  }

  const adminDb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  try {
    // Create the user (admin creation only; do NOT promote existing auth users)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      const code = String((authError as any)?.code || '');
      if (code === 'user_already_exists') {
        return NextResponse.json(
          {
            error:
              'This email already exists. Admin invite signup only creates new users. Please use a different email, or delete the user from Supabase Dashboard → Authentication → Users, then try again.',
          },
          { status: 409 }
        );
      } else {
        throw authError;
      }
    }

    const userId = authData.user?.id ?? null;

    if (!userId) {
      throw new Error('Signup did not return a user id');
    }

    // Ensure profile row exists (matches your schema; no is_admin column)
    const { error: profileError } = await adminDb.from('profiles').upsert({
      id: userId,
      email,
      updated_at: new Date().toISOString(),
    });

    if (profileError) throw profileError;

    // Grant admin access via user_roles (Admin page checks user_roles)
    const { error: roleInsertError } = await adminDb.from('user_roles').insert({
      user_id: userId,
      role: 'admin',
    });

    // If it already exists, ignore. Otherwise, surface error.
    if (
      roleInsertError &&
      !String(roleInsertError.message || '')
        .toLowerCase()
        .includes('duplicate')
    ) {
      throw roleInsertError;
    }

    // Ensure the user has a session cookie
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      throw signInError;
    }

    return NextResponse.json({ 
      message: 'Admin account created successfully',
      redirectTo: '/admin'
    });
  } catch (error: any) {
    console.error('Admin signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create admin account' },
      { status: 500 }
    );
  }
}
