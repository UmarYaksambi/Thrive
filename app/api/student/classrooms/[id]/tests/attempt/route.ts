import { NextRequest, NextResponse } from 'next/server';
import {
  createClient,
  getSafeUser,
} from '@/lib/supabase/server';

// POST: Submit a test attempt
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
    const body = await req.json();
    const { test_id, score, answers } = body;

    // Verify student is member of the classroom
    const { data: membership, error: memError } =
      await supabase
        .from('classroom_members')
        .select('id')
        .eq('classroom_id', classroomId)
        .eq('user_id', user.id)
        .single();

    if (memError || !membership) {
      return NextResponse.json(
        {
          error:
            'Forbidden: You are not a member of this classroom',
        },
        { status: 403 }
      );
    }

    const { data: attempt, error: insertError } =
      await supabase
        .from('test_attempts')
        .insert({
          test_id,
          student_id: user.id,
          score,
          answers,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(attempt);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
