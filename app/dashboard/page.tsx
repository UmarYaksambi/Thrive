'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import Link from 'next/link';
// Ensure this path matches your DB definition
import { Course } from '@/lib/types';
import { Chatbot } from '@/components/ui/chatbot';
import {
  Play, Clock, MoreHorizontal, PieChart, Award, Download,
  TrendingUp, BarChart2, X, Activity, Calendar, Zap, Loader2, ImageIcon
} from 'lucide-react';

export default function DashboardPage() {
  // --- STATE MANAGEMENT ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [stats, setStats] = useState({ avgScore: 0, overallCompletion: 0 });

  // Track which images are currently being generated to show specific loaders
  const [generatingImages, setGeneratingImages] = useState<Set<string>>(new Set());

  // Modal State
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // --- 1. FETCH DATA & INIT ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Courses (Real + Dummy)
        const courseRes = await fetch('/api/courses');
        const courseData = await courseRes.json();
        setCourses(courseData);

        // 2. Trigger Auto-Generation for missing images
        checkAndGenerateImages(courseData);

        // 3. Fetch Calendar Results for Stats
        const syncRes = await fetch('/api/calendar/sync');
        const { results } = await syncRes.json();

        // 4. Calculate Stats
        const totalProgress = courseData.reduce((acc: number, c: any) => acc + (c.progress || 0), 0);
        const overallCompletion = courseData.length > 0 ? Math.round(totalProgress / courseData.length) : 0;
        const totalScore = results.reduce((acc: number, r: any) => acc + r.score, 0);
        const avgScore = results.length > 0 ? Math.round(totalScore / results.length) : 0;

        setStats({ avgScore, overallCompletion });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 2. IMAGE GENERATION LOGIC ---
  const checkAndGenerateImages = async (coursesToCheck: Course[]) => {
    coursesToCheck.forEach(async (course) => {
      // Check if image is missing or is an external http link (we want local /course-images/)
      const needsLocal = !course.imageUrl || course.imageUrl.startsWith('http');

      if (needsLocal) {
        setGeneratingImages(prev => new Set(prev).add(course.id));

        try {
          const res = await fetch('/api/courses/image/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              courseId: course.id,
              title: course.title,
              category: course.category
            })
          });

          const data = await res.json();

          if (data.success && data.imageUrl) {
            // Update state live
            setCourses(prev => prev.map(c =>
              c.id === course.id ? { ...c, imageUrl: data.imageUrl } : c
            ));
          }
        } catch (error) {
          console.error(`Failed to gen image for ${course.title}`);
        } finally {
          setGeneratingImages(prev => {
            const next = new Set(prev);
            next.delete(course.id);
            return next;
          });
        }
      }
    });
  };

  // --- 3. REPORT DOWNLOAD ---
  const downloadReport = async () => {
    const res = await fetch('/api/reports/student');
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Student_Report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // --- 4. VIEW HELPERS ---
  const filteredCourses = filter === 'All'
    ? courses
    : courses.filter((c) => c.category === filter);

  const nextLessons = courses
    .map((course) => {
      const activeModule = course.modules.find((m) =>
        m.lessons.some((l) => !l.completed)
      );
      const activeLesson = activeModule?.lessons.find((l) => !l.completed);
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
    .filter((item) => item !== null)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#ff5734]" />
          <div className="text-[#151313] font-bold">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar />
      <div className="ml-20">
        <Topbar userName="Learner" />

        {/* --- LEVITATING CHATBOT --- */}
        <Chatbot />

        <main className="p-8 relative">

          {/* --- METRICS HEADER --- */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#151313] text-white p-6 rounded-3xl flex items-center justify-between shadow-lg">
              <div>
                <p className="text-gray-400 text-sm font-semibold mb-1">Overall Progress</p>
                <h3 className="text-4xl font-bold">{stats.overallCompletion}%</h3>
              </div>
              <div className="w-12 h-12 bg-[#333] rounded-full flex items-center justify-center">
                <PieChart className="text-[#fccc42]" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl flex items-center justify-between shadow-sm border border-gray-100">
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1">Avg. Test Score</p>
                <h3 className={`text-4xl font-bold ${stats.avgScore >= 75 ? 'text-green-600' : 'text-[#151313]'}`}>
                  {stats.avgScore}%
                </h3>
              </div>
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                <Award className="text-[#ff5734]" />
              </div>
            </div>

            <button
              onClick={downloadReport}
              className="bg-[#fccc42] hover:bg-[#f4b91a] transition-colors p-6 rounded-3xl flex flex-col justify-center items-start text-left shadow-sm group"
            >
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-6 h-6 text-[#151313]" />
                <span className="font-bold text-[#151313]">Student Report</span>
              </div>
              <p className="text-sm text-[#151313]/80 group-hover:translate-x-1 transition-transform">
                Download full performance analytics PDF/JSON
              </p>
            </button>
          </div>

          {/* --- COURSE FILTERS --- */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-[#151313]">My courses</h2>
              <div className="flex gap-2">
                {['All', 'Computer Science', 'Marketing', 'Business', 'Psychology'].map(
                  (category) => (
                    <button
                      key={category}
                      onClick={() => setFilter(category)}
                      className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors ${filter === category
                          ? 'bg-[#151313] text-white'
                          : 'bg-white border-2 border-gray-200 text-[#151313] hover:border-[#151313]'
                        }`}
                    >
                      {category}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* --- COURSE GRID --- */}
            {filteredCourses.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-6">No courses found in this category.</p>
                <Link href="/planner" className="px-8 py-3 bg-[#ff5734] text-white rounded-full font-bold">
                  Generate Course
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <div key={course.id} className="relative group h-full">
                    <Link href={`/course/${course.id}`} className="block h-full">
                      <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer h-full flex flex-col">

                        {/* Header & Actions */}
                        <div className="flex justify-between items-start mb-4">
                          <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">
                            {course.category}
                          </span>

                          <div className="flex items-center gap-2">
                            {/* Stats Button (Stops Link Propagation) */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedCourse(course);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-[#ff5734] transition-colors relative z-20 group/stat"
                            >
                              <BarChart2 className="w-5 h-5" />
                              <span className="absolute -top-8 right-0 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/stat:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Analytics
                              </span>
                            </button>

                            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* --- GEMINI AI IMAGE --- */}
                        <div className="aspect-video rounded-2xl bg-gray-100 mb-4 overflow-hidden relative">
                          {generatingImages.has(course.id) ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 gap-2">
                              <Loader2 className="w-8 h-8 animate-spin text-[#ff5734]" />
                              <span className="text-xs font-semibold">Designing Cover...</span>
                            </div>
                          ) : (
                            <>
                              <img
                                src={course.imageUrl || '/placeholder.jpg'}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                            </>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-[#151313] mb-2 line-clamp-2">
                          {course.title}
                        </h3>

                        {/* Progress */}
                        <div className="mt-auto pt-4">
                          <div className="flex justify-between text-sm text-gray-500 mb-2">
                            <span className="flex items-center gap-1"><TrendingUp size={14} /> Progress</span>
                            <span className="font-bold text-[#151313]">{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${course.progress}%`,
                                backgroundColor: course.progress === 100 ? '#4ade80' : (course.colorCode || '#fccc42'),
                              }}
                            >
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* --- BOTTOM SECTION --- */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#151313]">My next lessons</h2>
                <Link href="/calendar" className="text-[#fccc42] font-semibold text-sm hover:underline">
                  View full schedule
                </Link>
              </div>

              <div className="space-y-1">
                <div className="grid grid-cols-12 gap-4 pb-3 border-b border-gray-200 text-sm font-semibold text-gray-500">
                  <div className="col-span-6">Lesson</div>
                  <div className="col-span-4">Course</div>
                  <div className="col-span-2 text-right">Duration</div>
                </div>

                {nextLessons.length > 0 ? (
                  nextLessons.map((lesson) => (
                    <Link href={`/course/${lesson.courseId}`} key={lesson.id}>
                      <div className="grid grid-cols-12 gap-4 py-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer items-center group">
                        <div className="col-span-6">
                          <div className="font-bold text-[#151313] mb-1 group-hover:text-[#ff5734] transition-colors">
                            {lesson.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            Video Lesson
                          </div>
                        </div>
                        <div className="col-span-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs">
                            {lesson.subtitle.charAt(0)}
                          </div>
                          <span className="font-medium text-[#151313] text-sm line-clamp-1">
                            {lesson.subtitle}
                          </span>
                        </div>
                        <div className="col-span-2 text-right font-semibold text-[#151313] flex items-center justify-end gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {lesson.duration}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <p>All caught up! No pending lessons.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#151313] rounded-3xl p-8 text-white shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff5734] rounded-full blur-[60px] opacity-20"></div>
              <div>
                <div className="mb-6 relative z-10">
                  <h3 className="text-sm font-semibold text-gray-400 mb-4">Recommendation</h3>
                  <span className="px-4 py-1.5 bg-[#fccc42] text-[#151313] text-xs font-bold rounded-full inline-block">
                    AI & Data
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-6 leading-tight relative z-10">Want to advance your career?</h2>
                <p className="text-gray-400 text-sm mb-6">Generate a custom path based on your recent quiz scores.</p>
              </div>
              <Link href="/planner">
                <button className="w-full py-4 bg-[#ff5734] text-white font-bold rounded-full hover:bg-[#e64d2d] transition-colors relative z-10 shadow-lg shadow-[#ff5734]/30">
                  Create New Path
                </button>
              </Link>
            </div>
          </div>
        </main>

        {/* --- ANALYTICS MODAL OVERLAY --- */}
        {selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">

              {/* Modal Header */}
              <div className="bg-[#151313] p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-800 overflow-hidden">
                    <img src={selectedCourse.imageUrl} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedCourse.title}</h3>
                    <p className="text-gray-400 text-sm">Course Analytics</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCourse(null)} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-bold mb-2">
                      <Activity className="w-4 h-4 text-[#ff5734]" /> Time Spent
                    </div>
                    <h4 className="text-2xl font-bold text-[#151313]">
                      {/* Simple estimate logic */}
                      {Math.round(selectedCourse.completedLessons * 0.5)}h 15m
                    </h4>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-bold mb-2">
                      <Zap className="w-4 h-4 text-[#fccc42]" /> Current Streak
                    </div>
                    <h4 className="text-2xl font-bold text-[#151313]">3 Days</h4>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-bold mb-2">
                      <Calendar className="w-4 h-4 text-[#be94f5]" /> Est. Finish
                    </div>
                    <h4 className="text-2xl font-bold text-[#151313]">Jan 28</h4>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <h4 className="font-bold text-gray-800">Learning Mastery</h4>
                    <span className="text-[#ff5734] font-bold text-sm">Needs Focus</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-gray-500 w-20">Concept</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-[#4ade80] rounded-full w-[85%]"></div>
                      </div>
                      <span className="text-xs font-bold">85%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-gray-500 w-20">Application</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-[#fccc42] rounded-full w-[60%]"></div>
                      </div>
                      <span className="text-xs font-bold">60%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-gray-500 w-20">Quizzes</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-[#ff5734] rounded-full w-[40%]"></div>
                      </div>
                      <span className="text-xs font-bold">40%</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="px-6 py-3 font-bold text-gray-500 hover:text-black transition-colors"
                  >
                    Close
                  </button>
                  <Link href={`/course/${selectedCourse.id}`}>
                    <button className="px-6 py-3 bg-[#151313] text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
                      Resume Course
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}