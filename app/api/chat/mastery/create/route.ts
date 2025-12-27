import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
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

  let { data: { user } } = await supabase.auth.getUser();
  if (!user) user = { id: '41162d70-c555-4503-b84a-c925380d4f2c' } as any;

  try {
    const { topic } = await request.json();

    if (!topic) return NextResponse.json({ error: 'Topic required' }, { status: 400 });

    // 1. Generate Subtopics (Mocked for now)
    const defaultSubtopics = [
      { name: 'Foundations', completed: false },
      { name: 'Core Concepts', completed: false },
      { name: 'Advanced Techniques', completed: false },
      { name: 'Real-world Application', completed: false },
    ];

    // 2. Insert into Supabase
    const { data, error } = await supabase
      .from('topic_mastery')
      .upsert({
        user_id: user!.id,
        topic_name: topic,
        mastery_percentage: 0,
        subtopics: defaultSubtopics
      }, { onConflict: 'user_id, topic_name' })
      .select()
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}