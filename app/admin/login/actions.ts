'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function getSupabase() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Updated to use getAll/setAll for best compatibility with Next.js 15
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}

export async function adminLogin(formData: FormData) {
  // 1. FIX: You must await the client initialization
  const supabase = await getSupabase()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 2. Attempt Sign In
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`)
  }

  // 3. Verify Role (RPC Call)
  // We check for error here just in case the RPC fails unexpectedly
  const { data: role, error: rpcError } = await supabase.rpc('get_user_role')
  
  if (rpcError) {
    await supabase.auth.signOut()
    redirect('/admin/login?error=System error: Unable to verify permissions.')
  }

  const roleValue = String(role || '')

  if (roleValue !== 'admin' && roleValue !== 'supervisor') {
    // If they are a student or teacher trying to use the admin portal
    await supabase.auth.signOut()
    redirect('/admin/login?error=Unauthorized: Access restricted to administrators only.')
  }

  // 4. Redirect to Admin Dashboard
  redirect('/admin')
}