import { NextRequest, NextResponse } from 'next/server';
import {
  createClient,
  getSafeUser,
} from '@/lib/supabase/server';

// GET: Fetch all resources for a specific classroom
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

    const { data: resources, error } = await supabase
      .from('classroom_resources')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Library GET Error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(resources);
  } catch (error: any) {
    console.error('Library GET Exception:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST: Add a new resource to the classroom library
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
            'Forbidden: Only teachers can add resources',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      type,
      resource_url,
      thumbnail_color,
      tags,
    } = body;

    const { data: resource, error: insertError } =
      await supabase
        .from('classroom_resources')
        .insert({
          classroom_id: classroomId,
          title,
          description,
          type,
          resource_url,
          thumbnail_color,
          tags: tags || [],
          created_by: user.id,
        })
        .select()
        .single();

    if (insertError) {
      console.error('Library POST Error:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(resource);
  } catch (error: any) {
    console.error('Library POST Exception:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
