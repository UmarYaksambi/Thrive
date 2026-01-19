'use server';

import {
  createServerClient,
  type CookieOptions,
} from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Helper to initialize the Supabase client with SSR cookie support.
 * Updated for Next.js 15+ (async cookies)
 */
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(
          name: string,
          value: string,
          options: CookieOptions
        ) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

export async function login(formData: FormData) {
  const supabase = await getSupabase(); // Await the client
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const selectedRole = formData.get('role') as string; // 'student' or 'teacher'

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // Get the user's actual role from database
  const { data: role } = await supabase.rpc('get_user_role');
  const actualRole = String(role || '');

  // Validate role matches what they selected
  if (selectedRole === 'student') {
    // Student login - should NOT be admin, supervisor, or teacher
    if (['admin', 'supervisor', 'teacher'].includes(actualRole)) {
      // Sign them out and show error
      await supabase.auth.signOut();
      redirect(
        '/login?error=This email is not registered as a student. Please use the correct login portal.'
      );
    }
    redirect('/dashboard');
  } else if (selectedRole === 'teacher') {
    // Teacher login - must be teacher (admins should use admin portal)
    if (actualRole !== 'teacher') {
      await supabase.auth.signOut();
      if (actualRole === 'admin' || actualRole === 'supervisor') {
        redirect(
          '/login?error=Admin accounts should use the Admin Access portal at the bottom of the homepage.'
        );
      }
      redirect('/login?error=This email is not registered as a teacher.');
    }
    redirect('/teacher');
  } else {
    // Fallback: role-based redirection (for any other case)
    if (actualRole === 'admin' || actualRole === 'supervisor') {
      redirect('/admin');
    } else if (actualRole === 'teacher') {
      redirect('/teacher');
    } else {
      redirect('/dashboard');
    }
  }
}

export async function signup(formData: FormData) {
  const supabase = await getSupabase(); // Await the client
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const role = formData.get('role') as string;
  const inviteCode = formData.get('inviteCode') as string;

  // Verify invite code for teachers
  if (role === 'teacher') {
    if (!process.env.TEACHER_INVITE_CODE) {
      console.error('TEACHER_INVITE_CODE is not set');
      redirect(
        '/login?error=System configuration error. Please contact support.'
      );
    }
    if (inviteCode !== process.env.TEACHER_INVITE_CODE) {
      redirect('/login?error=Invalid invite code for teacher registration.');
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // Role assignment logic
  if (data.user) {
    // Use service role client to bypass RLS for role assignment
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey) {
      const adminDb = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
          cookies: {
            getAll: () => [],
            setAll: () => { },
          },
        }
      );

      // If teacher, assign teacher role. If not, explicitly assign student (optional, as default is student)
      if (role === 'teacher') {
        await adminDb.from('user_roles').insert({
          user_id: data.user.id,
          role: 'teacher'
        });
      } else {
        await adminDb.from('user_roles').insert({
          user_id: data.user.id,
          role: 'student'
        });
      }
    }
  }

  // If email confirmation is ON, the user won't have a session yet.
  if (!data.session) {
    redirect(
      '/login?error=Please check your email to confirm your account before logging in.'
    );
  }

  // Redirect based on role
  if (role === 'teacher') {
    redirect('/teacher');
  } else {
    redirect('/dashboard');
  }
}

export async function logout() {
  const supabase = await getSupabase(); // Await the client
  await supabase.auth.signOut();
  redirect('/login');
}
