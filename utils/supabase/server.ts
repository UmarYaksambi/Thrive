<<<<<<< HEAD
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  
=======
// utils/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

>>>>>>> origin/main
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
<<<<<<< HEAD
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) => {
              cookieStore.set({ name, value, ...options });
            });
          } catch {
            // Handle cookie setting error
=======
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
>>>>>>> origin/main
          }
        },
      },
    }
<<<<<<< HEAD
  );
}

export async function getUserRole(userId: string) {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
    
  if (error || !data) {
    return null;
  }
  
  return data.role;
}

export async function isUserAdmin(userId: string) {
  const role = await getUserRole(userId);
  return role === 'admin' || role === 'supervisor';
}
=======
  )
}
>>>>>>> origin/main
