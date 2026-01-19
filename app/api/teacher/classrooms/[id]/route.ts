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

// GET: Fetch single classroom with its members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classroomId } = await params;
    const supabase = await createSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceSupabase = createServiceSupabase();

    // Fetch classroom
    const { data: classroom, error: classroomError } = await serviceSupabase
      .from('classrooms')
      .select('*')
      .eq('id', classroomId)
      .single();

    if (classroomError || !classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    // Check if user is the teacher
    if (classroom.teacher_id !== user.id) {
      // Check if admin
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = roles?.some(r => r.role === 'admin');
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Fetch members with profile info
    const { data: members, error: membersError } = await serviceSupabase
      .from('classroom_members')
      .select(`
        *,
        profile:profiles!user_id(id, full_name, email, avatar_url)
      `)
      .eq('classroom_id', classroomId);

    if (membersError) {
      console.error('Members fetch error:', membersError);
    }

    return NextResponse.json({
      classroom,
      members: members || []
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Delete classroom
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classroomId } = await params;
    const supabase = await createSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceSupabase = createServiceSupabase();

    // Verify ownership
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

    // Delete classroom (cascades to members)
    const { error } = await serviceSupabase
      .from('classrooms')
      .delete()
      .eq('id', classroomId);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete classroom' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Classroom deleted' });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Update classroom or regenerate invite code
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classroomId } = await params;
    const body = await request.json();
    const { name, description, regenerateCode } = body;

    const supabase = await createSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceSupabase = createServiceSupabase();

    // Verify ownership
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

    // Build update object
    const updateData: any = { updated_at: new Date().toISOString() };
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;

    // Generate new invite code if requested
    if (regenerateCode) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let newCode = '';
      for (let i = 0; i < 6; i++) {
        newCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      updateData.invite_code = newCode;
    }

    const { data, error } = await serviceSupabase
      .from('classrooms')
      .update(updateData)
      .eq('id', classroomId)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update classroom' }, { status: 500 });
    }

    return NextResponse.json({ success: true, classroom: data });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
