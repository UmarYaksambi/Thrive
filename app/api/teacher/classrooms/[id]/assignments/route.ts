import { NextRequest, NextResponse } from 'next/server';
import {
  createClient,
  getSafeUser,
} from '@/lib/supabase/server';

// GET: Fetch all assignments for a specific classroom
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

    const { data: assignments, error } = await supabase
      .from('classroom_assignments')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(assignments);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST: Add a new assignment to the classroom
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
            'Forbidden: Only teachers can create assignments',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, due_date, points } = body;

    const { data: assignment, error: insertError } =
      await supabase
        .from('classroom_assignments')
        .insert({
          classroom_id: classroomId,
          title,
          description,
          due_date,
          points,
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

    return NextResponse.json(assignment);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
