'use server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Helper to initialize the Supabase client with SSR cookie support.
 * This matches your project's use of @supabase/ssr.
 */
function getSupabase() {
    const cookieStore = cookies()
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


export async function login(formData: FormData) {
    const supabase = getSupabase()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/dashboard')
}

// Thrive/app/login/actions.ts

export async function signup(formData: FormData) {
    const supabase = getSupabase()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName }
        }
    })

    if (error) {
        redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    // If email confirmation is ON, the user won't have a session yet.
    if (!data.session) {
        redirect('/login?error=Please check your email to confirm your account before logging in.')
    }

    redirect('/dashboard')
}

export async function logout() {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    redirect('/login')
}