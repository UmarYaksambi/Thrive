'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { ChevronLeft, ChevronRight, Clock, BookOpen, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Type definitions (ensure these match your types/course.ts)
type CalendarEvent = {
  id: string;
  courseId: string;
  title: string;
  date: Date; // Actual Date object
  type: 'Lesson' | 'Quiz' | 'Final Exam';
  duration: string;
  completed: boolean;
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Courses and Flatten into Events
  useEffect(() => {
    const fetchAndMapCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        const courses = await res.json();

        const mappedEvents: CalendarEvent[] = [];

        courses.forEach((course: any) => {
          const startDate = new Date(course.startDate); // Ensure your API saves this ISO string
          
          // Logic: Distribute modules every 2 days
          course.modules.forEach((module: any, modIndex: number) => {
            // Calculate Lesson Date
            const lessonDate = new Date(startDate);
            lessonDate.setDate(startDate.getDate() + (modIndex * 2)); 

            // Add Lessons
            module.lessons.forEach((lesson: any, lessonIndex: number) => {
               // If multiple lessons in a module, maybe stack them on the same day or spread slightly
               mappedEvents.push({
                 id: lesson.id,
                 courseId: course.id,
                 title: `${course.title}: ${lesson.title}`,
                 date: new Date(lessonDate), 
                 type: 'Lesson',
                 duration: lesson.duration || '30m',
                 completed: lesson.completed
               });
            });

            // Add Module Quiz (if exists) - Schedule for the day after the module
            if (module.quiz) {
               const quizDate = new Date(lessonDate);
               quizDate.setDate(lessonDate.getDate() + 1);
               mappedEvents.push({
                  id: module.quiz.id || `${module.id}-quiz`,
                  courseId: course.id,
                  title: `Quiz: ${module.title}`,
                  date: quizDate,
                  type: 'Quiz',
                  duration: '20m',
                  completed: module.quiz.completed
               });
            }
          });
        });

        setEvents(mappedEvents);
      } catch (error) {
        console.error("Failed to load calendar events", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndMapCourses();
  }, []);

  // Calendar Utility Functions
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // Grid Generation
  const days = [];
  const totalDays = daysInMonth(currentDate);
  const startDay = firstDayOfMonth(currentDate);

  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  // Filter Events
  const getEventsForDate = (day: number) => {
    return events.filter(e => 
      e.date.getDate() === day && 
      e.date.getMonth() === currentDate.getMonth() &&
      e.date.getFullYear() === currentDate.getFullYear()
    );
  };

  const selectedDayEvents = events.filter(e => 
     e.date.getDate() === selectedDate.getDate() &&
     e.date.getMonth() === selectedDate.getMonth() &&
     e.date.getFullYear() === selectedDate.getFullYear()
  );

  const upcomingEvents = events
    .filter(e => e.date >= new Date())
    .sort((a,b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar />
      <div className="ml-20">
        <Topbar />

        <main className="p-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-[#151313] mb-8">Learning Calendar</h2>

            {loading ? (
               <div className="w-full h-96 flex items-center justify-center">
                  <div className="text-gray-500">Loading schedule...</div>
               </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Calendar Grid */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm h-fit">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-[#151313]">{monthName}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#fccc42]">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#fccc42]">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-bold text-gray-400 text-sm py-2">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {days.map((day, idx) => {
                    const dayEvents = day ? getEventsForDate(day) : [];
                    const hasLesson = dayEvents.some(e => e.type === 'Lesson');
                    const hasQuiz = dayEvents.some(e => e.type === 'Quiz');
                    const isSelected = day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth();

                    return (
                      <button
                        key={idx}
                        disabled={!day}
                        onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                        className={cn(
                          'aspect-square rounded-xl font-bold transition-all flex flex-col items-center justify-center relative',
                          !day ? 'invisible' : '',
                          isSelected ? 'bg-[#151313] text-white scale-105 shadow-lg' : 'bg-gray-50 text-gray-700 hover:bg-gray-200'
                        )}
                      >
                        {day}
                        <div className="flex gap-1 mt-1">
                           {hasLesson && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#fccc42]' : 'bg-[#be94f5]'}`} />}
                           {hasQuiz && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#ff5734]' : 'bg-[#ff5734]'}`} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-6 flex gap-4 text-sm font-semibold text-gray-500">
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#be94f5]"/> Lesson</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ff5734]"/> Mandatory Quiz</div>
                </div>
              </div>

              {/* Right Column: Day Detail & Upcoming */}
              <div className="space-y-6">
                 {/* Selected Date View */}
                 <div className="bg-white rounded-3xl p-6 shadow-sm min-h-[200px]">
                    <h3 className="text-xl font-bold text-[#151313] mb-4">
                       {selectedDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                    </h3>
                    
                    {selectedDayEvents.length > 0 ? (
                       <div className="space-y-3">
                          {selectedDayEvents.map((ev) => (
                             <div key={ev.id} className="border-l-4 border-[#fccc42] pl-4 py-1">
                                <p className="font-bold text-sm text-gray-800 line-clamp-1">{ev.title}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                   <span className={`px-2 py-0.5 rounded text-white ${ev.type === 'Quiz' ? 'bg-[#ff5734]' : 'bg-[#be94f5]'}`}>{ev.type}</span>
                                   <Clock size={12} /> {ev.duration}
                                </div>
                                <Link href={`/course/${ev.courseId}`} className="text-xs font-bold text-[#151313] hover:underline mt-2 block">
                                   Go to Course -
                                </Link>
                             </div>
                          ))}
                       </div>
                    ) : (
                       <div className="text-center py-8 text-gray-400">
                          <p>No tasks scheduled.</p>
                       </div>
                    )}
                 </div>

                 {/* Upcoming List */}
                 <div className="bg-[#151313] rounded-3xl p-6 shadow-sm text-white">
                    <h3 className="text-xl font-bold mb-4">Upcoming Deadlines</h3>
                    <div className="space-y-4">
                       {upcomingEvents.map((ev, i) => (
                          <div key={i} className="flex items-center gap-4">
                             <div className="bg-[#333] w-12 h-12 rounded-xl flex flex-col items-center justify-center text-xs font-bold">
                                <span className="text-[#fccc42]">{ev.date.getDate()}</span>
                                <span className="uppercase text-gray-400">{ev.date.toLocaleString('default',{month:'short'})}</span>
                             </div>
                             <div>
                                <p className="font-bold text-sm line-clamp-1">{ev.title}</p>
                                <p className="text-xs text-gray-400">{ev.duration} • {ev.type}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

            </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}