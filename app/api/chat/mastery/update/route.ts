import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  createServerClient,
  type CookieOptions,
} from '@supabase/ssr';

function normalizeTopic(topic: string): string {
  return topic
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '');
}

export async function POST(request: Request) {
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

  // --- FIX: Add Fallback User for Development ---
  if (!user) {
    user = {
      id: '41162d70-c555-4503-b84a-c925380d4f2c',
    } as any;
  }
  // ---------------------------------------------

  try {
    const { topicName, subtopicName } =
      await request.json();

    if (!topicName || !subtopicName) {
      return NextResponse.json(
        { error: 'Topic and subtopic required' },
        { status: 400 }
      );
    }

    const normalizedTopic = normalizeTopic(topicName);

    const { data: record, error: fetchError } =
      await supabase
        .from('topic_mastery')
        .select('*')
        .eq('user_id', user!.id)
        .eq('topic_name', normalizedTopic)
        .maybeSingle();

    if (fetchError || !record) {
      return NextResponse.json(
        {
          error:
            'Mastery track not found. Create it first.',
        },
        { status: 404 }
      );
    }

    const existingSubtopics = Array.isArray(
      record.subtopics
    )
      ? record.subtopics
      : [];

    let found = false;

    // Mark specific subtopic as completed
    const updatedSubtopics = existingSubtopics.map(
      (sub: any) => {
        // Use includes or looser matching to catch AI variations
        if (
          typeof sub?.name === 'string' &&
          (sub.name.toLowerCase() ===
            subtopicName.toLowerCase() ||
            sub.name
              .toLowerCase()
              .includes(subtopicName.toLowerCase()) ||
            subtopicName
              .toLowerCase()
              .includes(sub.name.toLowerCase()))
        ) {
          found = true;
          return { ...sub, completed: true };
        }
        return sub;
      }
    );

    // Optional: If AI made up a new valid subtopic, add it (or you can ignore this block)
    if (!found) {
      updatedSubtopics.push({
        name: subtopicName,
        completed: true,
      });
    }

    // Recalculate Percentage
    const completedCount = updatedSubtopics.filter(
      (s: any) => s.completed === true
    ).length;

    const newPercentage = Math.round(
      (completedCount / updatedSubtopics.length) * 100
    );

    const { data, error } = await supabase
      .from('topic_mastery')
      .update({
        mastery_percentage: newPercentage,
        subtopics: updatedSubtopics,
        updated_at: new Date().toISOString(),
      })
      .eq('id', record.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Update mastery error:', error);
    return NextResponse.json(
      { error: error.message ?? 'Internal Server Error' },
      { status: 500 }
    );
  }
}
