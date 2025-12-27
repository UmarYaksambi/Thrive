import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Helper to create Supabase client
const createClient = (cookieStore: any) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
        remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }); },
      },
    }
  );
};

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  // 1. Check Auth with Fallback
  let { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Fallback ID for testing
    user = { id: '41162d70-c555-4503-b84a-c925380d4f2c' } as any;
  }

  // If no session ID provided, fetch the most recent one
  if (!sessionId) {
    const { data: lastSession } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    
    if (!lastSession) return NextResponse.json([]); // No history found
    
    const { data: messages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', lastSession.id)
        .order('created_at', { ascending: true });
        
    return NextResponse.json(messages || []);
  }

  // Fetch messages for specific session
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// --- NEW DELETE METHOD ---
export async function DELETE(request: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  // 1. Check Auth with Fallback
  let { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    user = { id: '41162d70-c555-4503-b84a-c925380d4f2c' } as any;
  }

  try {
    if (sessionId) {
      // Option A: Delete a specific session
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user!.id); // Security: Ensure user owns this session

      if (error) throw error;
      return NextResponse.json({ message: 'Session deleted' });
    } else {
      // Option B: Delete ALL history for this user
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('user_id', user!.id);

      if (error) throw error;
      return NextResponse.json({ message: 'All history deleted' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}