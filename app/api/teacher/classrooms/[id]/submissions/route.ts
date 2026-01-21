import { NextResponse } from 'next/server';
import {
  createClient,
  getSafeUser,
} from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classroomId } = await params;
    const user = await getSafeUser();

    if (!user)
      return new NextResponse('Unauthorized', {
        status: 401,
      });

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignment_id');

    let query = supabase.from('assignment_submissions')
      .select(`
        *,
        student:profiles!assignment_submissions_student_id_fkey(full_name, avatar_url)
      `);

    if (assignmentId) {
      query = query.eq('assignment_id', assignmentId);
    } else {
      const { data: assignments } = await supabase
        .from('classroom_assignments')
        .select('id')
        .eq('classroom_id', classroomId);

      const assignmentIds =
        (assignments as any[])?.map((a: any) => a.id) || [];
      query = query.in('assignment_id', assignmentIds);
    }

    const { data, error } = await query.order(
      'submitted_at',
      { ascending: false }
    );

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classroomId } = await params;
    const user = await getSafeUser();

    if (!user)
      return new NextResponse('Unauthorized', {
        status: 401,
      });

    const supabase = await createClient();
    const body = await request.json();
    const {
      submission_id,
      grade,
      teacher_feedback,
      status,
      ocr_text,
    } = body;

    // Verify user is teacher of this classroom
    const { data: isTeacher } = await supabase
      .from('classroom_members')
      .select('role')
      .eq('classroom_id', classroomId)
      .eq('user_id', user.id)
      .eq('role', 'teacher')
      .single();

    if (!isTeacher)
      return new NextResponse('Forbidden', { status: 403 });

    const updateData: any = {};
    if (grade !== undefined) updateData.grade = grade;
    if (teacher_feedback !== undefined)
      updateData.teacher_feedback = teacher_feedback;
    if (status !== undefined) updateData.status = status;
    if (ocr_text !== undefined)
      updateData.ocr_text = ocr_text;

    const { data, error } = await supabase
      .from('assignment_submissions')
      .update(updateData)
      .eq('id', submission_id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
