import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// Helper to create authenticated Supabase client
async function createSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) => {
              cookieStore.set({ name, value, ...options });
            });
          } catch { }
        },
      },
    }
  );
}

// Service role client for bypassing RLS
function createServiceSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() { },
      },
    }
  );
}

// GET: Fetch teacher's classrooms with student counts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify teacher role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isTeacher = roles?.some(r => ['teacher', 'admin', 'supervisor'].includes(r.role));
    if (!isTeacher) {
      return NextResponse.json({ error: 'Forbidden - teacher role required' }, { status: 403 });
    }

    // Fetch classrooms with member counts
    const serviceSupabase = createServiceSupabase();

    const { data: classrooms, error } = await serviceSupabase
      .from('classrooms')
      .select(`
        *,
        members:classroom_members(count)
      `)
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch classrooms' }, { status: 500 });
    }

    // Transform to include student count
    const transformed = (classrooms || []).map((c: any) => ({
      ...c,
      studentCount: c.members?.[0]?.count || 0,
    }));

    return NextResponse.json({ classrooms: transformed });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create new classroom
export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Classroom name is required' }, { status: 400 });
    }

    const supabase = await createSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify teacher role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isTeacher = roles?.some(r => ['teacher', 'admin', 'supervisor'].includes(r.role));
    if (!isTeacher) {
      return NextResponse.json({ error: 'Forbidden - teacher role required' }, { status: 403 });
    }

    // Create classroom using service role
    const serviceSupabase = createServiceSupabase();

    const { data, error } = await serviceSupabase
      .from('classrooms')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        teacher_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Create error:', error);
      return NextResponse.json({ error: 'Failed to create classroom' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      classroom: data,
      message: 'Classroom created successfully!'
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
