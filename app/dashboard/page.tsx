import { cookies } from 'next/headers';
import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { CourseCard } from '@/components/course-card';

// We keep the mock data for now until your courses table is ready
const mockCourses = [
  {
    id: '1',
    title: 'Creative Writing for Beginners',
    category: 'Marketing',
    progress: 25,
    totalLessons: 20,
    completedLessons: 5,
    colorCode: '#fccc42',
    students: [
      { name: 'John Doe', avatar: '' },
      { name: 'Jane Smith', avatar: '' },
      { name: 'Bob Johnson', avatar: '' },
      { name: 'Extra 1', avatar: '' },
      { name: 'Extra 2', avatar: '' },
    ],
  },
  {
    id: '2',
    title: 'Digital Illustration with Adobe Illustrator',
    category: 'Computer Science',
    progress: 24,
    totalLessons: 50,
    completedLessons: 12,
    colorCode: '#be94f5',
    students: [
      { name: 'Alice Brown', avatar: '' },
      { name: 'Charlie White', avatar: '' },
      { name: 'Diana Green', avatar: '' },
      { name: 'Extra 1', avatar: '' },
    ],
  },
  {
    id: '3',
    title: 'Public Speaking and Leadership',
    category: 'Psychology',
    progress: 82,
    totalLessons: 22,
    completedLessons: 18,
    colorCode: '#a8d8ea',
    students: [
      { name: 'Emma Davis', avatar: '' },
      { name: 'Frank Miller', avatar: '' },
      { name: 'Grace Lee', avatar: '' },
      { name: 'Extra 1', avatar: '' },
    ],
  },
];

const nextLessons = [
  {
    id: '1',
    title: '01. Introduction to Creative Writing',
    subtitle: 'Creative writing for beginners',
    teacher: 'ConnerGarcia',
    avatar: '',
    duration: '22 min',
  },
  {
    id: '2',
    title: '03. Foundations of Public Speaking',
    subtitle: 'Public Speaking and Leadership',
    teacher: 'Saira Goodman',
    avatar: '',
    duration: '40 min',
  },
  {
    id: '3',
    title: '05. Getting to know the tool Adobe Illustrator',
    subtitle: 'Digital illustration with Adobe Illustrator',
    teacher: 'Tony Ware',
    avatar: '',
    duration: '1h 08 min',
  },
  {
    id: '4',
    title: '11. Understanding audience psychology',
    subtitle: 'Public Speaking: Basic course',
    teacher: 'Mya Guzman',
    avatar: '',
    duration: '26 min',
  },
  {
    id: '5',
    title: '04. The importance of self reflection',
    subtitle: 'Psychology of influence',
    teacher: 'Zohaib Osborn',
    avatar: '',
    duration: '23 min',
  },
];

export default async function DashboardPage() {
  const cookieStore = cookies();

  // Initialize the Supabase Server Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Cookie set logic (usually done in middleware for server components)
        },
      },
    }
  );

  // 1. Verify if the user is logged in
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Redirect to login if no session is found
  if (!user) {
    redirect('/login');
  }

  // 3. Fetch the real profile data from your public.profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 4. Fetch User Role for Sidebar
  const { data: role } = await supabase.rpc('get_user_role');

  // 5. Fetch Real Enrollments/Courses
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      id,
      progress_percent,
      course:courses (
        id,
        title,
        category,
        thumbnail_url,
        description
      )
    `)
    .eq('user_id', user.id);

  // Map to CourseCard format
  const myCourses = (enrollments || []).map((enrollment: any) => ({
    id: enrollment.course.id,
    title: enrollment.course.title,
    category: enrollment.course.category || 'General',
    progress: enrollment.progress_percent || 0,
    // We mock total/completed lessons for now as that requires deep counting
    totalLessons: 20,
    completedLessons: Math.round(((enrollment.progress_percent || 0) / 100) * 20),
    colorCode: '#be94f5', // Default color, or derive from category
    students: [], // Could fetch this if needed, but skipping for performance
  }));

  // Mock next lessons for now (or fetch from `lessons` table if linked)
  // For MVP, we'll keep the static "next lessons" or empty state if no courses
  const nextLessons = [
    {
      id: '1',
      title: '01. Introduction',
      subtitle: myCourses[0]?.title || 'Your Course',
      teacher: 'Thrive Instructor',
      avatar: '',
      duration: '15 min',
    }
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar userRole={role as any} />
      <div className="ml-20">
        {/* 4. Pass the real user data to the Topbar */}
        <Topbar
          userName={profile?.full_name || 'Learner'}
          userHandle={profile?.email?.split('@')[0] ? `@${profile.email.split('@')[0]}` : undefined}
          userAvatar={profile?.avatar_url}
        />

        <main className="p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-[#151313]">My courses</h2>
              <div className="flex gap-2">
                <button className="px-6 py-2 bg-[#151313] text-white rounded-full font-semibold text-sm hover:bg-[#2a2828] transition-colors">
                  All courses
                </button>
                {/* Filters could be dynamic */}
              </div>
            </div>

            {myCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {myCourses.map((course) => (
                  <CourseCard key={course.id} {...course} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 text-lg mb-4">You haven't enrolled in any courses yet.</p>
                <Link href="/library" className="px-6 py-3 bg-[#fccc42] text-[#151313] font-bold rounded-full">Explore Library</Link>
              </div>
            )}

          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#151313]">My next lessons</h2>
                <button className="text-[#fccc42] font-semibold text-sm hover:underline">
                  View all lessons
                </button>
              </div>

              <div className="space-y-1">
                <div className="grid grid-cols-12 gap-4 pb-3 border-b border-gray-200 text-sm font-semibold text-gray-500">
                  <div className="col-span-6">Lesson</div>
                  <div className="col-span-4">Teacher</div>
                  <div className="col-span-2 text-right">Duration</div>
                </div>

                {nextLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="grid grid-cols-12 gap-4 py-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="col-span-6">
                      <div className="font-bold text-[#151313] mb-1">{lesson.title}</div>
                      <div className="text-sm text-gray-500">{lesson.subtitle}</div>
                    </div>
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#be94f5] to-[#ff5734] flex items-center justify-center text-white font-bold text-sm">
                        {lesson.teacher.charAt(0)}
                      </div>
                      <span className="font-medium text-[#151313]">{lesson.teacher}</span>
                    </div>
                    <div className="col-span-2 text-right font-semibold text-[#151313] flex items-center justify-end">
                      {lesson.duration}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#151313] rounded-3xl p-8 text-white shadow-sm">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">
                  New course matching your interests
                </h3>
                <span className="px-4 py-1.5 bg-[#fccc42] text-[#151313] text-xs font-bold rounded-full inline-block">
                  Computer Science
                </span>
              </div>

              <h2 className="text-2xl font-bold mb-6 leading-tight">
                Microsoft Future Ready: Fundamentals of Big Data
              </h2>

              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-3">They are already studying</p>
                <div className="flex items-center">
                  <div className="flex">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#be94f5] to-[#ff5734] border-2 border-[#151313] -ml-2 first:ml-0"
                      />
                    ))}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#fccc42] text-[#151313] font-bold text-sm flex items-center justify-center -ml-2">
                    +100
                  </div>
                </div>
              </div>

              <button className="w-full py-4 bg-[#ff5734] text-white font-bold rounded-full hover:bg-[#e64d2d] transition-colors">
                More details
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}