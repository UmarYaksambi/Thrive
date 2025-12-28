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
    const { topicName, subtopicName } = await request.json();

    // 1. Try to fetch current data
    const { data: record } = await supabase
      .from('topic_mastery')
      .select('*')
      .eq('user_id', user!.id)
      .ilike('topic_name', topicName) // ilike = Case-insensitive match (Fixes "cyber security" vs "Cyber Security")
      .single();

    let updatedSubtopics = [];
    let currentId = record?.id;

    // 2. Logic: If record exists, use it. If not, CREATE it.
    if (record) {
      updatedSubtopics = Array.isArray(record.subtopics) ? record.subtopics : [];
    } else {
      // Create defaults if creating from scratch
      updatedSubtopics = [
        { name: 'Foundations', completed: false },
        { name: 'Core Concepts', completed: false },
        { name: 'Advanced Techniques', completed: false },
        { name: 'Real-world Application', completed: false },
      ];
    }

    // 3. Mark the specific subtopic as complete
    let found = false;
    updatedSubtopics = updatedSubtopics.map((sub: any) => {
      if (sub.name.toLowerCase() === subtopicName.toLowerCase()) {
        found = true;
        return { ...sub, completed: true };
      }
      return sub;
    });

    // If the subtopic was new (e.g. "Authentication"), add it
    if (!found) {
        updatedSubtopics.push({ name: subtopicName, completed: true });
    }

    // 4. Recalculate Percentage
    const completedCount = updatedSubtopics.filter((s: any) => s.completed).length;
    const totalCount = updatedSubtopics.length;
    const newPercentage = Math.round((completedCount / totalCount) * 100);

    // 5. Save (Upsert handles both Insert and Update)
    const { data, error } = await supabase
      .from('topic_mastery')
      .upsert({
        id: currentId, 
        user_id: user!.id,
        topic_name: record ? record.topic_name : topicName, 
        mastery_percentage: newPercentage,
        subtopics: updatedSubtopics
      }, { onConflict: 'user_id, topic_name' }) 
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}