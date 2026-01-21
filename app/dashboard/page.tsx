'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import Link from 'next/link';
import { Course } from '@/lib/server/courseStore';
import { Chatbot } from '@/components/ui/chatbot';
import {
  Play,
  Clock,
  MoreHorizontal,
  PieChart,
  Award,
  Download,
  TrendingUp,
  BarChart2,
  X,
  Activity,
  Calendar,
  Zap,
  Loader2,
} from 'lucide-react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ---------------------------------- */
/* TYPES                              */
/* ---------------------------------- */

type NextLesson = {
  id: string;
  courseId: string;
  title: string;
  subtitle: string;
  teacher: string;
  duration: string;
};

/* ---------------------------------- */
/* COMPONENT                          */
/* ---------------------------------- */

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [stats, setStats] = useState({
    avgScore: 0,
    overallCompletion: 0,
  });

  const [generatingImages, setGeneratingImages] = useState<
    Set<string>
  >(new Set());
  const [selectedCourse, setSelectedCourse] =
    useState<Course | null>(null);

  /* ---------------------------------- */
  /* DATA FETCHING                      */
  /* ---------------------------------- */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await fetch('/api/courses');
        const courseData = await courseRes.json();
        setCourses(courseData);

        const syncRes = await fetch('/api/calendar/sync');
        const { results } = await syncRes.json();

        const totalProgress = courseData.reduce(
          (acc: number, c: any) => acc + (c.progress || 0),
          0
        );

        const overallCompletion =
          courseData.length > 0
            ? Math.round(totalProgress / courseData.length)
            : 0;

        const totalScore = results.reduce(
          (acc: number, r: any) => acc + r.score,
          0
        );

        const avgScore =
          results.length > 0
            ? Math.round(totalScore / results.length)
            : 0;

        setStats({ avgScore, overallCompletion });
      } catch (e) {
        console.error('Dashboard fetch failed:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ---------------------------------- */
  /* DERIVED DATA (FIXED)               */
  /* ---------------------------------- */

  const filteredCourses =
    filter === 'All'
      ? courses
      : courses.filter((c) => c.category === filter);

  const nextLessons: NextLesson[] = courses
    .map((course) => {
      const activeModule = course.modules.find((m) =>
        m.lessons.some((l) => !l.completed)
      );

      const activeLesson = activeModule?.lessons.find(
        (l) => !l.completed
      );

      if (!activeLesson) return null;

      return {
        id: activeLesson.id,
        courseId: course.id,
        title: activeLesson.title,
        subtitle: course.title,
        teacher: 'AI Tutor',
        duration: activeLesson.duration,
      };
    })
    .filter(
      (lesson): lesson is NextLesson => lesson !== null
    )
    .slice(0, 5);

  /* ---------------------------------- */
  /* LOADING STATE                      */
  /* ---------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#ff5734]" />
      </div>
    );
  }

  /* ---------------------------------- */
  /* RENDER                             */
  /* ---------------------------------- */

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar />
      <div className="ml-20">
        <Topbar userName="Learner" />
        <Chatbot />

        <main className="p-8">
          {/* METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-[#151313] text-white p-6 rounded-3xl">
              <p className="text-gray-400 text-sm">
                Overall Progress
              </p>
              <h3 className="text-4xl font-bold">
                {stats.overallCompletion}%
              </h3>
            </div>

            <div className="bg-white p-6 rounded-3xl">
              <p className="text-gray-500 text-sm">
                Avg Test Score
              </p>
              <h3 className="text-4xl font-bold">
                {stats.avgScore}%
              </h3>
            </div>

            <button className="bg-[#fccc42] p-6 rounded-3xl">
              <Download className="w-6 h-6" />
              <span className="font-bold">
                Download Report
              </span>
            </button>
          </div>

          {/* NEXT LESSONS */}
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">
              My next lessons
            </h2>

            {nextLessons.length > 0 ? (
              nextLessons.map((lesson) => (
                <Link
                  href={`/course/${lesson.courseId}`}
                  key={lesson.id}
                >
                  <div className="grid grid-cols-12 gap-4 py-4 hover:bg-gray-50 rounded-xl cursor-pointer">
                    <div className="col-span-6">
                      <div className="font-bold">
                        {lesson.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        Video Lesson
                      </div>
                    </div>

                    <div className="col-span-4">
                      {lesson.subtitle}
                    </div>

                    <div className="col-span-2 text-right flex items-center justify-end gap-2">
                      <Clock className="w-4 h-4" />
                      {lesson.duration}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-6">
                All caught up 🎉
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
