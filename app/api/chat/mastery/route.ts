import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 1. Check Auth with Fallback
  let { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log("⚠️ Authentication failed (Mastery). Using fallback User ID for testing.");
    // Manually assign your specific UID
    user = { id: '41162d70-c555-4503-b84a-c925380d4f2c' } as any;
  }

  // Fetch topic mastery data
  const { data: topics, error } = await supabase
    .from('topic_mastery')
    .select('id, topic_name, mastery_percentage')
    .eq('user_id', user!.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate Overall Mastery for the sidebar widget
  // Default to 0 if no topics exist
  const overallMastery = topics && topics.length > 0
    ? Math.round(topics.reduce((acc, curr) => acc + curr.mastery_percentage, 0) / topics.length)
    : 0;

  return NextResponse.json({
    topics: topics || [],
    overallMastery,
  });
}