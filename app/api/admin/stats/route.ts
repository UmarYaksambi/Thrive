import { NextResponse } from 'next/server';
import {
  createClient,
  getSafeUser,
} from '@/lib/supabase/server';

export async function GET() {
  try {
    const user = await getSafeUser();
    if (!user)
      return new NextResponse('Unauthorized', {
        status: 401,
      });

    const supabase = await createClient();

    // Verify admin role
    const { data: role } =
      await supabase.rpc('get_user_role');
    if (!['admin', 'supervisor'].includes(role as string)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Fetch stats
    const [
      { count: studentsCount },
      { count: classroomsCount },
      { count: resourcesCount },
      { count: assignmentsCount },
    ] = await Promise.all([
      supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student'),
      supabase
        .from('classrooms')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('classroom_resources')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('assignment_submissions')
        .select('*', { count: 'exact', head: true }),
    ]);

    // Fetch classroom list for detailed tracking
    const { data: classrooms } = await supabase.from(
      'classrooms'
    ).select(`
        id,
        name,
        created_at,
        members:classroom_members(role)
      `);

    const classroomStats =
      (classrooms as any[])?.map((c: any) => ({
        ...c,
        studentCount:
          c.members?.filter(
            (m: any) => m.role === 'student'
          ).length || 0,
        teacherCount:
          c.members?.filter(
            (m: any) => m.role === 'teacher'
          ).length || 0,
      })) || [];

    return NextResponse.json({
      stats: {
        totalStudents: studentsCount || 0,
        totalClassrooms: classroomsCount || 0,
        totalResources: resourcesCount || 0,
        totalSubmissions: assignmentsCount || 0,
      },
      classrooms: classroomStats,
    });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
