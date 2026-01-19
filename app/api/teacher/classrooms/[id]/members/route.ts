import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

function createSupabase() {
  const cookieStore = cookies();
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

// POST: Remove a student from classroom
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const classroomId = params.id;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = createSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceSupabase = createServiceSupabase();

    // Verify classroom ownership
    const { data: classroom } = await serviceSupabase
      .from('classrooms')
      .select('teacher_id')
      .eq('id', classroomId)
      .single();

    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    if (classroom.teacher_id !== user.id) {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = roles?.some(r => r.role === 'admin');
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Remove member
    const { error } = await serviceSupabase
      .from('classroom_members')
      .delete()
      .eq('classroom_id', classroomId)
      .eq('user_id', userId);

    if (error) {
      console.error('Remove error:', error);
      return NextResponse.json({ error: 'Failed to remove student' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Student removed from classroom' });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
