'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

const scheduledLessons = [
  { date: 5, title: 'React Fundamentals', time: '10:00 AM', duration: '1h' },
  { date: 7, title: 'State Management', time: '2:00 PM', duration: '1.5h' },
  { date: 12, title: 'Hooks Deep Dive', time: '11:00 AM', duration: '45m' },
  { date: 14, title: 'Performance Optimization', time: '3:00 PM', duration: '1h' },
  { date: 19, title: 'Testing in React', time: '10:00 AM', duration: '2h' },
  { date: 22, title: 'Advanced Patterns', time: '1:00 PM', duration: '1.5h' },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10)); // November 2025
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const days = [];
  const totalDays = daysInMonth(currentDate);
  const startDay = firstDayOfMonth(currentDate);

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getLessonsForDate = (date: number) => {
    return scheduledLessons.filter((lesson) => lesson.date === date);
  };

  const selectedLessons = selectedDate ? getLessonsForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar />
      <div className="ml-20">
        <Topbar />

        <main className="p-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-[#151313] mb-8">Learning Calendar</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-[#151313]">{monthName}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={previousMonth}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#fccc42] transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#fccc42] transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Day labels */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center font-bold text-[#151313] text-sm py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2">
                  {days.map((day, idx) => {
                    const hasLessons = day && getLessonsForDate(day).length > 0;
                    const isSelected = selectedDate === day;

                    return (
                      <button
                        key={idx}
                        onClick={() => day && setSelectedDate(day)}
                        className={cn(
                          'aspect-square rounded-xl font-bold transition-all flex items-center justify-center relative',
                          !day
                            ? 'cursor-default'
                            : isSelected
                            ? 'bg-[#fccc42] text-[#151313] scale-110'
                            : hasLessons
                            ? 'bg-[#be94f5] text-white hover:scale-105'
                            : 'bg-gray-100 text-[#151313] hover:bg-gray-200'
                        )}
                      >
                        {day}
                        {hasLessons && (
                          <div className="absolute bottom-1 w-1 h-1 bg-current rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 pt-8 border-t-2 border-gray-200">
                  <h4 className="text-lg font-bold text-[#151313] mb-4">Legend</h4>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#be94f5]"></div>
                      <span className="text-sm font-semibold text-gray-600">
                        Has lessons scheduled
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#fccc42]"></div>
                      <span className="text-sm font-semibold text-gray-600">Selected date</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lessons for selected date */}
              <div className="bg-white rounded-3xl p-8 shadow-sm h-fit">
                <h3 className="text-2xl font-bold text-[#151313] mb-6">
                  {selectedDate ? `Lessons on Nov ${selectedDate}` : 'Select a date'}
                </h3>

                {selectedDate && selectedLessons.length > 0 ? (
                  <div className="space-y-4">
                    {selectedLessons.map((lesson, idx) => (
                      <div key={idx} className="border-2 border-gray-200 rounded-2xl p-4">
                        <h4 className="font-bold text-[#151313] mb-3">{lesson.title}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{lesson.time}</span>
                          </div>
                          <div className="text-gray-600">Duration: {lesson.duration}</div>
                        </div>
                        <button className="w-full mt-4 px-4 py-2 bg-[#fccc42] text-[#151313] font-bold rounded-full hover:bg-[#f4b91a] transition-colors text-sm">
                          Open Lesson
                        </button>
                      </div>
                    ))}
                  </div>
                ) : selectedDate && selectedLessons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="font-semibold mb-2">No lessons scheduled</p>
                    <button className="text-[#fccc42] font-bold hover:underline">
                      Schedule a lesson
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="font-semibold">Select a date to view lessons</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming lessons */}
            <div className="mt-8 bg-white rounded-3xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-[#151313] mb-6">Upcoming Lessons</h3>
              <div className="space-y-3">
                {scheduledLessons.slice(0, 5).map((lesson, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-[#151313]">{lesson.title}</div>
                      <div className="text-sm text-gray-600">Nov {lesson.date} • {lesson.time}</div>
                    </div>
                    <div className="flex items-center gap-2 text-[#fccc42] font-bold">
                      <Clock className="w-4 h-4" />
                      {lesson.duration}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
