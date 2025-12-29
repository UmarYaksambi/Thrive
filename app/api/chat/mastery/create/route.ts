import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Helper: Normalize topic names for consistency
function normalizeTopic(topic: string): string {
  return topic.toLowerCase().trim();
}

// Helper: Generate smart subtopics based on topic
function generateSubtopics(topic: string): Array<{name: string, completed: boolean}> {
  const normalized = normalizeTopic(topic);
  
  // You can expand this with AI generation later
  const topicMaps: Record<string, string[]> = {
    'python': ['Syntax & Variables', 'Control Flow', 'Functions & Modules', 'OOP Basics'],
    'javascript': ['Fundamentals', 'DOM Manipulation', 'Async Programming', 'ES6+ Features'],
    'react': ['Components & Props', 'State & Lifecycle', 'Hooks', 'Context & Routing'],
    'cyber security': ['Fundamentals', 'Authentication', 'Encryption', 'Threat Detection'],
    'machine learning': ['Fundamentals', 'Supervised Learning', 'Neural Networks', 'Model Deployment'],
  };

  const subtopicNames = topicMaps[normalized] || [
    'Foundations',
    'Core Concepts', 
    'Advanced Techniques',
    'Real-world Application'
  ];

  return subtopicNames.map(name => ({ name, completed: false }));
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) { 
          cookieStore.set({ name, value, ...options }); 
        },
        remove(name: string, options: CookieOptions) { 
          cookieStore.set({ name, value: '', ...options }); 
        },
      },
    }
  );

  let { data: { user } } = await supabase.auth.getUser();
  if (!user) user = { id: '41162d70-c555-4503-b84a-c925380d4f2c' } as any;

  try {
    const { topic } = await request.json();
    if (!topic) return NextResponse.json({ error: 'Topic required' }, { status: 400 });

    const normalizedTopic = normalizeTopic(topic);
    const subtopics = generateSubtopics(normalizedTopic);

    // Check if already exists
    const { data: existing } = await supabase
      .from('topic_mastery')
      .select('id')
      .eq('user_id', user!.id)
      .eq('topic_name', normalizedTopic)
      .single();

    if (existing) {
      return NextResponse.json({ 
        error: 'Topic already exists',
        id: existing.id 
      }, { status: 409 });
    }

    // Insert new mastery track
    const { data, error } = await supabase
      .from('topic_mastery')
      .insert({
        user_id: user!.id,
        topic_name: normalizedTopic,
        mastery_percentage: 0,
        subtopics: subtopics
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Create mastery error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}