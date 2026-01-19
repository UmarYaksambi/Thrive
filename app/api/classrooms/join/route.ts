import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

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

// POST: Student joins classroom using invite code
export async function POST(request: NextRequest) {
  try {
    const { inviteCode } = await request.json();

    if (!inviteCode?.trim()) {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
    }

    const supabase = await createSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - please log in' }, { status: 401 });
    }

    const serviceSupabase = createServiceSupabase();

    // Find classroom by invite code
    const { data: classroom, error: classroomError } = await serviceSupabase
      .from('classrooms')
      .select('id, name, teacher_id')
      .eq('invite_code', inviteCode.trim().toUpperCase())
      .single();

    if (classroomError || !classroom) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    // Check if already a member
    const { data: existingMember } = await serviceSupabase
      .from('classroom_members')
      .select('id')
      .eq('classroom_id', classroom.id)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      return NextResponse.json({ error: 'You are already a member of this classroom' }, { status: 400 });
    }

    // Check if user is the teacher (can't join own classroom as student)
    if (classroom.teacher_id === user.id) {
      return NextResponse.json({ error: 'You cannot join your own classroom as a student' }, { status: 400 });
    }

    // Join classroom
    const { error: joinError } = await serviceSupabase
      .from('classroom_members')
      .insert({
        classroom_id: classroom.id,
        user_id: user.id,
        role: 'student',
      });

    if (joinError) {
      console.error('Join error:', joinError);
      return NextResponse.json({ error: 'Failed to join classroom' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully joined "${classroom.name}"!`,
      classroom: { id: classroom.id, name: classroom.name }
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
