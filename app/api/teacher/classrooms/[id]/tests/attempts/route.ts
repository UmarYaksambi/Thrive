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
    const testId = searchParams.get('test_id');

    let query = supabase.from('test_attempts').select(`
        *,
        student:profiles!test_attempts_student_id_fkey(full_name, avatar_url)
      `);

    if (testId) {
      query = query.eq('test_id', testId);
    } else {
      const { data: tests } = await supabase
        .from('classroom_tests')
        .select('id')
        .eq('classroom_id', classroomId);

      const testIds =
        (tests as any[])?.map((t: any) => t.id) || [];
      query = query.in('test_id', testIds);
    }

    const { data, error } = await query.order(
      'completed_at',
      { ascending: false }
    );

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
