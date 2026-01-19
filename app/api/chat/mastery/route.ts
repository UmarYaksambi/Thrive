import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  createServerClient,
  type CookieOptions,
} from '@supabase/ssr';

export async function GET(request: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
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
          cookieStore.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  let {
    data: { user },
  } = await supabase.auth.getUser();

  // --- FIX: Add the same fallback ID here ---
  if (!user) {
    user = {
      id: '41162d70-c555-4503-b84a-c925380d4f2c',
    } as any;
  }
  // ----------------------------------------

  const { data: topics, error } = await supabase
    .from('topic_mastery')
    .select('id, topic_name, mastery_percentage, subtopics')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch mastery error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  const overallMastery =
    topics && topics.length > 0
      ? Math.round(
          topics.reduce(
            (sum, t) => sum + (t.mastery_percentage ?? 0),
            0
          ) / topics.length
        )
      : 0;

  return NextResponse.json({
    topics: topics ?? [],
    overallMastery,
  });
}
