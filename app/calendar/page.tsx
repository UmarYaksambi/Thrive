'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { 
  ChevronLeft, ChevronRight, Clock, Edit3, CheckCircle, AlertCircle, Calendar as CalendarIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// --- TYPES ---
type CalendarEvent = {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  date: Date;
  type: 'Lesson' | 'Quiz';
  duration?: string;
  completed: boolean;
  score?: number;
  passed?: boolean;
  colorCode?: string;
};

type Note = {
  date: string;
  note: string;
};

export default function CalendarPage() {
  // --- STATE ---
  // Default to the specific week of the Dummy Data (Jan 19, 2026)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 19)); 
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 0, 19));
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Note Editing
  const [dailyNote, setDailyNote] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);

  // --- 1. FETCH DATA (API Call) ---
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
            // Schedule Logic: 
            // - Lessons: Every 2 days from Start Date
            // - Quizzes: 1 Day after the Module Lessons
            const modDate = new Date(startDate);
            modDate.setDate(startDate.getDate() + (idx * 2));

            // Map Lessons
            module.lessons.forEach((lesson: any) => {
              mappedEvents.push({
                id: lesson.id,
                courseId: course.id,
                courseTitle: course.title,
                title: lesson.title,
                date: new Date(modDate),
                type: 'Lesson',
                duration: lesson.duration,
                completed: lesson.completed,
                colorCode: course.colorCode
              });
            });

            // Map Quiz
            if (module.quiz) {
              const quizDate = new Date(modDate);
              quizDate.setDate(modDate.getDate() + 1); 

              // Check DB or Initial Data for results
              const result = results.find((r: any) => r.moduleId === module.id);
              const isComplete = module.quiz.completed || !!result;
              const score = result?.score || module.quiz.score || 0;

              mappedEvents.push({
                id: module.quiz.id || `${module.id}-quiz`,
                courseId: course.id,
                courseTitle: course.title,
                title: `Quiz: ${module.quiz.title}`,
                date: quizDate,
                type: 'Quiz',
                completed: isComplete,
                score: score,
                passed: score >= 60,
                colorCode: '#ff5734' // Distinct color for quizzes
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

  // --- 2. NOTE LOGIC ---
  const handleSaveNote = async () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    // Optimistic UI Update
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

  useEffect(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const existing = notes.find(n => n.date === dateStr);
    setDailyNote(existing?.note || '');
    setIsEditingNote(false);
  }, [selectedDate, notes]);

  // --- 3. CALENDAR UTILS ---
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

  // Filter Upcoming (Simulated "Today" is Jan 19, 2026)
  const simulatedToday = new Date(2026, 0, 19);
  const upcomingEvents = events
    .filter(e => e.date >= simulatedToday) 
    .sort((a,b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar />
      <div className="ml-20">
        <Topbar userName="Learner" />
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
                    
                    // --- Color Logic ---
                    let bgClass = 'bg-gray-50 text-gray-700 hover:bg-gray-100'; // Default Empty
                    
                    if (total > 0) {
                      if (completed === total) {
                        bgClass = 'bg-[#4ade80] text-white hover:bg-[#22c55e] shadow-sm'; // All Done (Green)
                      } else if (completed > 0) {
                        bgClass = 'bg-[#fccc42] text-[#151313] hover:bg-[#eab308] shadow-sm'; // In Progress (Yellow)
                      } else {
                        bgClass = 'bg-[#be94f5] text-white hover:bg-[#a855f7] shadow-sm'; // Pending (Purple)
                      }
                    }

                    if (isSelected) {
                        bgClass = 'bg-[#151313] text-white ring-4 ring-gray-200 transform scale-105 z-10';
                    }

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
                        
                        {/* Red Dot for Quiz */}
                        {hasQuiz && (
                             <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-[#ff5734]'}`} />
                        )}

                        {/* --- HOVER TOOLTIP --- */}
                        {total > 0 && (
                          <div className="absolute bottom-full mb-3 hidden group-hover:block z-20 w-48 bg-[#151313] text-white text-xs p-3 rounded-xl shadow-2xl pointer-events-none text-left animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-700">
                                <span className="font-bold">{day} {monthName}</span>
                                <span className="bg-white/20 px-1.5 py-0.5 rounded">{completed}/{total} Done</span>
                            </div>
                            <div className="space-y-1.5">
                                {dayEvents.slice(0, 3).map((e, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${e.type === 'Quiz' ? 'bg-[#ff5734]' : 'bg-[#be94f5]'}`} />
                                        <span className={cn("truncate", e.completed && "line-through text-gray-400")}>
                                            {e.title}
                                        </span>
                                    </div>
                                ))}
                                {dayEvents.length > 3 && (
                                    <div className="text-gray-400 pl-3.5">+ {dayEvents.length - 3} more</div>
                                )}
                            </div>
                            {/* Triangle Arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#151313]"></div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Legend */}
                <div className="mt-8 flex gap-6 text-sm font-semibold text-gray-500 justify-center">
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#4ade80]"/> Completed</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#fccc42]"/> In Progress</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#be94f5]"/> Assigned</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ff5734]"/> Quiz Day</div>
                </div>
              </div>

              {/* --- DETAILS & NOTES & UPCOMING --- */}
              <div className="space-y-6">
                 
                 {/* Selected Date Details */}
                 <div className="bg-white rounded-3xl p-6 shadow-sm min-h-[300px]">
                    <div className="flex items-center justify-between mb-4 border-b pb-4">
                        <h3 className="text-xl font-bold text-[#151313]">
                           {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </h3>
                        <CalendarIcon className="text-gray-300" />
                    </div>
                    
                    {selectedDayEvents.length > 0 ? (
                       <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                          {selectedDayEvents.map((ev) => (
                             <div key={ev.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-[#be94f5] transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                   <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${ev.type === 'Quiz' ? 'bg-[#ff5734] text-white' : 'bg-[#151313] text-white'}`}>
                                      {ev.type}
                                   </span>
                                   {ev.type === 'Quiz' && ev.completed && (
                                      <span className={`text-xs font-bold ${ev.passed ? 'text-green-600' : 'text-red-600'}`}>
                                        {ev.score}% {ev.passed ? 'PASS' : 'FAIL'}
                                      </span>
                                   )}
                                   {ev.type === 'Lesson' && ev.completed && (
                                       <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                           <CheckCircle size={12} /> Done
                                       </span>
                                   )}
                                </div>
                                <p className="font-bold text-[#151313] mb-1 leading-tight">{ev.title}</p>
                                <p className="text-xs text-gray-500 mb-2">{ev.courseTitle}</p>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-xs text-gray-400 font-semibold">
                                        <Clock size={12} /> {ev.duration || '20m'}
                                    </div>
                                    <Link href={`/course/${ev.courseId}`} className="text-xs font-bold bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:bg-[#151313] hover:text-white transition-colors">
                                       {ev.completed ? 'Review' : 'Start Now'}
                                    </Link>
                                </div>
                             </div>
                          ))}
                       </div>
                    ) : (
                       <div className="text-center py-12 text-gray-400 flex flex-col items-center">
                          <CheckCircle className="w-12 h-12 mb-2 opacity-20" />
                          <p>No tasks scheduled.</p>
                       </div>
                    )}
                 </div>

                 {/* Daily Notes */}
                 <div className="bg-[#fefce8] rounded-3xl p-6 shadow-sm border border-yellow-100 relative group">
                    <div className="flex items-center justify-between mb-2">
                       <h3 className="font-bold text-[#151313] flex items-center gap-2">
                          <Edit3 size={16} /> Daily Notes
                       </h3>
                    </div>
                    
                    {isEditingNote ? (
                       <div className="animate-in fade-in zoom-in duration-200">
                          <textarea 
                             className="w-full bg-white p-3 rounded-xl text-sm border focus:ring-2 focus:ring-[#fccc42] outline-none"
                             rows={4}
                             value={dailyNote}
                             onChange={(e) => setDailyNote(e.target.value)}
                             placeholder="Write down your goals..."
                             autoFocus
                          />
                          <div className="flex gap-2 mt-2">
                              <button 
                                 onClick={handleSaveNote}
                                 className="flex-1 py-2 bg-[#fccc42] text-black font-bold rounded-lg text-sm hover:bg-[#eab308]"
                              >
                                 Save
                              </button>
                              <button 
                                 onClick={() => setIsEditingNote(false)}
                                 className="px-4 py-2 bg-white border text-gray-500 font-bold rounded-lg text-sm hover:bg-gray-50"
                              >
                                 Cancel
                              </button>
                          </div>
                       </div>
                    ) : (
                       <div 
                         className="min-h-[80px] text-sm text-gray-700 whitespace-pre-wrap cursor-pointer hover:bg-yellow-50/50 p-2 -ml-2 rounded-lg transition-colors" 
                         onClick={() => setIsEditingNote(true)}
                       >
                          {dailyNote || <span className="text-gray-400 italic flex items-center gap-2"><Edit3 size={12}/> Tap to add notes...</span>}
                       </div>
                    )}
                 </div>

                 {/* Upcoming List */}
                 <div className="bg-[#151313] rounded-3xl p-6 shadow-sm text-white">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <AlertCircle size={16} className="text-[#fccc42]" /> Upcoming
                    </h3>
                    <div className="space-y-3">
                       {upcomingEvents.length > 0 ? upcomingEvents.map((ev, i) => (
                          <div key={i} className="flex items-center gap-3 border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                             <div className="text-center min-w-[36px]">
                                <span className="block text-xs text-gray-500 uppercase">{ev.date.toLocaleString('default',{month:'short'})}</span>
                                <span className="block text-lg font-bold text-[#fccc42] leading-none">{ev.date.getDate()}</span>
                             </div>
                             <div>
                                <p className="font-bold text-sm line-clamp-1">{ev.title}</p>
                                <p className="text-[10px] text-gray-400">{ev.type} • {ev.courseTitle}</p>
                             </div>
                          </div>
                       )) : (
                          <p className="text-gray-500 text-sm">No upcoming tasks.</p>
                       )}
                    </div>
                 </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}