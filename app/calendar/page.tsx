'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { 
  ChevronLeft, ChevronRight, Clock, Edit3, CheckCircle, AlertCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Types specific to the View
type CalendarEvent = {
  id: string;
  courseId: string;
  title: string;
  date: Date;
  type: 'Lesson' | 'Quiz';
  duration?: string;
  completed: boolean;
  score?: number; // Only for quizzes
  passed?: boolean; // Only for quizzes
};

type Note = {
  date: string;
  note: string;
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Note Editing
  const [dailyNote, setDailyNote] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);

  // 1. Sync Data on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/calendar/sync');
        const { courses, results, notes: fetchedNotes } = await res.json();
        
        setNotes(fetchedNotes);

        const mappedEvents: CalendarEvent[] = [];

        courses.forEach((course: any) => {
          const startDate = new Date(course.startDate);
          
          course.modules.forEach((module: any, idx: number) => {
            // Schedule: 1 module every 2 days
            const modDate = new Date(startDate);
            modDate.setDate(startDate.getDate() + (idx * 2));

            // Map Lessons
            module.lessons.forEach((lesson: any) => {
              mappedEvents.push({
                id: lesson.id,
                courseId: course.id,
                title: `${course.title}: ${lesson.title}`,
                date: new Date(modDate),
                type: 'Lesson',
                duration: lesson.duration,
                completed: lesson.completed
              });
            });

            // Map Quiz
            if (module.quiz) {
              const quizDate = new Date(modDate);
              quizDate.setDate(modDate.getDate() + 1); // Quiz on the next day

              // Find Result from DB
              const result = results.find((r: any) => r.moduleId === module.id);
              
              mappedEvents.push({
                id: module.quiz.id || `${module.id}-quiz`,
                courseId: course.id,
                title: `Quiz: ${module.title}`,
                date: quizDate,
                type: 'Quiz',
                completed: !!result,
                score: result?.score,
                passed: result ? result.score >= 60 : undefined
              });
            }
          });
        });

        setEvents(mappedEvents);
      } catch (e) {
        console.error("Calendar Sync Failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Handle Note Saving
  const handleSaveNote = async () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    // UI Optimistic Update
    const newNotes = notes.filter(n => n.date !== dateStr);
    if(dailyNote.trim()) newNotes.push({ date: dateStr, note: dailyNote });
    setNotes(newNotes);
    setIsEditingNote(false);

    // API Call
    await fetch('/api/calendar/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateStr, note: dailyNote })
    });
  };

  // Update text area when date changes
  useEffect(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const existing = notes.find(n => n.date === dateStr);
    setDailyNote(existing?.note || '');
    setIsEditingNote(false);
  }, [selectedDate, notes]);

  // Calendar Logic
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const days = [];
  const totalDays = daysInMonth(currentDate);
  const startDay = firstDayOfMonth(currentDate);

  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

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

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar />
      <div className="ml-20">
        <Topbar />
        <main className="p-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-[#151313] mb-8">Learning Calendar</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* --- CALENDAR GRID --- */}
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
                    if (!day) return <div key={idx} />;

                    const dayEvents = getEventsForDate(day);
                    const isSelected = day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth();
                    
                    const total = dayEvents.length;
                    const completed = dayEvents.filter(e => e.completed).length;
                    const hasQuiz = dayEvents.some(e => e.type === 'Quiz');
                    
                    // Determine Status Color
                    let bgClass = 'bg-gray-100 text-gray-700';
                    if (total > 0) {
                      if (completed === total) bgClass = 'bg-[#4ade80] text-white'; // Green (Done)
                      else if (completed > 0) bgClass = 'bg-[#fccc42] text-black'; // Yellow (Started)
                      else bgClass = 'bg-[#be94f5] text-white'; // Purple (Pending)
                    }
                    if (isSelected) bgClass = 'bg-[#151313] text-white ring-4 ring-gray-200';

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                        className={cn(
                          'aspect-square rounded-xl font-bold transition-all flex flex-col items-center justify-center relative group',
                          bgClass
                        )}
                      >
                        {day}
                        {hasQuiz && <div className="w-1.5 h-1.5 rounded-full bg-[#ff5734] mt-1" />}

                        {/* HOVER TOOLTIP */}
                        {total > 0 && (
                          <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 w-32 bg-black text-white text-xs p-2 rounded-lg text-center shadow-lg">
                            <p className="font-bold">{completed}/{total} Completed</p>
                            {hasQuiz && <p className="text-[#ff5734] mt-1">Quiz Day</p>}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* --- RIGHT COLUMN: DETAILS & NOTES --- */}
              <div className="space-y-6">
                 
                 {/* Details Card */}
                 <div className="bg-white rounded-3xl p-6 shadow-sm min-h-[250px]">
                    <h3 className="text-xl font-bold text-[#151313] mb-4 border-b pb-2">
                       {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h3>
                    
                    {selectedDayEvents.length > 0 ? (
                       <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                          {selectedDayEvents.map((ev) => (
                             <div key={ev.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-start mb-1">
                                   <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${ev.type === 'Quiz' ? 'bg-[#ff5734] text-white' : 'bg-[#be94f5] text-white'}`}>
                                      {ev.type}
                                   </span>
                                   {ev.type === 'Quiz' && ev.completed && (
                                      <span className={`text-xs font-bold ${ev.passed ? 'text-green-600' : 'text-red-600'}`}>
                                        {ev.score}% {ev.passed ? 'PASS' : 'FAIL'}
                                      </span>
                                   )}
                                </div>
                                <p className="font-bold text-sm text-gray-800 mb-1">{ev.title}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                   <Clock size={12} /> {ev.duration || '20m'}
                                   {ev.completed && <CheckCircle size={12} className="text-green-600" />}
                                </div>
                                <Link href={`/course/${ev.courseId}`} className="block mt-2 text-center text-xs font-bold bg-[#151313] text-white py-1.5 rounded-lg hover:bg-gray-800">
                                   {ev.completed ? 'Review' : 'Start'}
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

                 {/* Daily Note Card */}
                 <div className="bg-[#fefce8] rounded-3xl p-6 shadow-sm border border-yellow-100 relative">
                    <div className="flex items-center justify-between mb-2">
                       <h3 className="font-bold text-[#151313] flex items-center gap-2">
                          <Edit3 size={16} /> Daily Notes
                       </h3>
                       {!isEditingNote && (
                          <button onClick={() => setIsEditingNote(true)} className="text-xs text-gray-500 hover:text-black font-bold">Edit</button>
                       )}
                    </div>
                    
                    {isEditingNote ? (
                       <div>
                          <textarea 
                             className="w-full bg-white p-3 rounded-xl text-sm border focus:ring-2 focus:ring-[#fccc42] outline-none"
                             rows={4}
                             value={dailyNote}
                             onChange={(e) => setDailyNote(e.target.value)}
                             placeholder="Goals for the day..."
                          />
                          <button 
                             onClick={handleSaveNote}
                             className="mt-2 w-full py-2 bg-[#fccc42] text-black font-bold rounded-lg text-sm"
                          >
                             Save Note
                          </button>
                       </div>
                    ) : (
                       <div className="min-h-[60px] text-sm text-gray-700 whitespace-pre-wrap cursor-pointer" onClick={() => setIsEditingNote(true)}>
                          {dailyNote || <span className="text-gray-400 italic">Tap to add notes...</span>}
                       </div>
                    )}
                 </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}