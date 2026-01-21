import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error(
      'CRITICAL: Supabase environment variables are missing in current environment!'
    );
    throw new Error('Supabase configuration missing');
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

/**
 * Safely gets the authenticated user.
 * Returns null if not authenticated or if an auth error occurs (like refresh token failure).
 */
export async function getSafeUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error(
        'Supabase getSafeUser Auth Error Details:',
        JSON.stringify(error, null, 2)
      );
      return null;
    }
    if (!user) {
      console.warn(
        'Supabase getSafeUser: No user found in session'
      );
      return null;
    }
    return user;
  } catch (err) {
    console.error(
      'Supabase getSafeUser Critical Exception:',
      err
    );
    return null;
  }
}
