import { NextRequest, NextResponse } from 'next/server';
import {
  createClient,
  getSafeUser,
} from '@/lib/supabase/server';

// GET: Fetch all tests for a specific classroom
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classroomId } = await params;
    const user = await getSafeUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    const { data: tests, error } = await supabase
      .from('classroom_tests')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(tests);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST: Add a new test to the classroom
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classroomId } = await params;
    const user = await getSafeUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Verify user is the teacher of this classroom
    const { data: classroom, error: classError } =
      await supabase
        .from('classrooms')
        .select('teacher_id')
        .eq('id', classroomId)
        .single();

    if (classError || !classroom) {
      return NextResponse.json(
        { error: 'Classroom not found' },
        { status: 404 }
      );
    }

    if (classroom.teacher_id !== user.id) {
      return NextResponse.json(
        {
          error:
            'Forbidden: Only teachers can create tests',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, questions, duration_minutes } = body;

    const { data: test, error: insertError } =
      await supabase
        .from('classroom_tests')
        .insert({
          classroom_id: classroomId,
          title,
          questions,
          duration_minutes,
          created_by: user.id,
        })
        .select()
        .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(test);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
