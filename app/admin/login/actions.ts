'use server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies, type UnsafeUnwrappedCookies } from 'next/headers';
import { redirect } from 'next/navigation'

function getSupabase() {
  const cookieStore = (cookies() as unknown as UnsafeUnwrappedCookies)
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

export async function adminLogin(formData: FormData) {
  const supabase = getSupabase()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Attempt Sign In
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`)
  }

  // 2. Verify Role (Strict Admin/Supervisor check)
  const { data: role } = await supabase.rpc('get_user_role')
  const roleValue = String(role || '')

  if (roleValue !== 'admin' && roleValue !== 'supervisor') {
    // If they are a student or teacher trying to use the admin portal
    await supabase.auth.signOut()
    redirect('/admin/login?error=Unauthorized: Access restricted to administrators only.')
  }

  // 3. Redirect to Admin Dashboard
  redirect('/admin')
}
