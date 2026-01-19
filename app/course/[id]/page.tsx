'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { Play, Download, CheckSquare, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Course, Module, Lesson } from '@/types/course';
import { useParams } from 'next/navigation';
import jsPDF from 'jspdf'; // Hypothetical usage for report

export default function CoursePage() {
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Fetch specific course data
    // In a real app, use useSWR or React Query
    const fetchCourse = async () => {
       // Mocking the fetch, replace with /api/courses/${params.id}
       const res = await fetch('/api/courses');
       const data = await res.json();
       const found = data.find((c: any) => c.id === params.id);
       if(found) {
         setCourse(found);
         setActiveModuleId(found.modules[0].id);
       }
    };
    fetchCourse();
  }, [params.id]);

  if (!course) return <div className="p-10">Loading Course Context...</div>;

  const handleDownload = () => {
    alert("Downloading course content to offline folder...");
    // Logic to zip content would go here
  };

  const generateReport = () => {
    // Mock PDF generation
    alert("Generating PDF Performance Report...");
  };

  const toggleLessonCompletion = (modId: string, lessonId: string) => {
    // Update local state and sync to backend
    const updatedModules = course.modules.map(m => {
      if(m.id !== modId) return m;
      return {
        ...m,
        lessons: m.lessons.map(l => l.id === lessonId ? {...l, completed: !l.completed} : l)
      };
    });
    setCourse({...course, modules: updatedModules});
    // Call API to persist
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar />
      <div className="ml-20">
        <Topbar />
        <main className="p-8">
           {/* Header with Image and Title */}
           <div className="relative h-64 rounded-3xl overflow-hidden mb-8">
              <img src={course.imageUrl} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8 text-white">
                 <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
                 <div className="flex gap-4">
                    <button onClick={handleDownload} className="flex items-center gap-2 bg-[#ff5734] px-4 py-2 rounded-full font-bold text-sm">
                       <Download size={16} /> Download Offline
                    </button>
                    <button onClick={generateReport} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold text-sm">
                       <FileText size={16} /> Student Report
                    </button>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Main Content Area */}
              <div className="xl:col-span-2 space-y-6">
                 {/* Video Player Placeholder */}
                 <div className="bg-black aspect-video rounded-3xl flex items-center justify-center relative group cursor-pointer">
                    <Play className="text-white w-20 h-20 opacity-80 group-hover:scale-110 transition-transform" />
                    <p className="absolute bottom-4 text-white text-sm">Redirects to YouTube Learning Path</p>
                 </div>

                 {/* Notes Section */}
                 <div className="bg-white p-6 rounded-3xl shadow-sm">
                    <h3 className="font-bold text-xl mb-4">Lecture Notes</h3>
                    <textarea 
                      className="w-full h-32 p-4 border rounded-xl bg-gray-50" 
                      placeholder="Type your notes here... (Auto-saved)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                 </div>
              </div>

              {/* Sidebar: Modules & Progress */}
              <div className="space-y-4">
                 <div className="bg-[#151313] text-white p-6 rounded-3xl">
                    <h3 className="font-bold text-lg mb-2">Course Progress</h3>
                    <div className="w-full bg-gray-700 h-2 rounded-full mb-2">
                       <div className="bg-[#fccc42] h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                 </div>

                 <div className="bg-white rounded-3xl p-6 shadow-sm max-h-[600px] overflow-y-auto">
                    {course.modules.map(module => (
                       <div key={module.id} className="mb-4 border-b pb-4 last:border-0">
                          <button 
                            onClick={() => setActiveModuleId(activeModuleId === module.id ? null : module.id)}
                            className="flex items-center justify-between w-full font-bold text-left mb-2"
                          >
                             {module.title}
                             {activeModuleId === module.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                          </button>
                          
                          {activeModuleId === module.id && (
                             <div className="space-y-2 pl-2">
                                {module.lessons.map(lesson => (
                                   <div key={lesson.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group">
                                      <div className="flex items-center gap-3">
                                         <button 
                                            onClick={() => toggleLessonCompletion(module.id, lesson.id)}
                                            className={`w-5 h-5 border-2 rounded flex items-center justify-center ${lesson.completed ? 'bg-[#ff5734] border-[#ff5734]' : 'border-gray-300'}`}
                                         >
                                            {lesson.completed && <CheckSquare size={12} className="text-white" />}
                                         </button>
                                         <span className="text-sm font-medium">{lesson.title}</span>
                                      </div>
                                      <Play size={14} className="text-gray-400 group-hover:text-[#ff5734]" />
                                   </div>
                                ))}
                                {/* Quiz for Module */}
                                {module.quiz && (
                                   <div className="flex items-center justify-between p-2 bg-[#f0f0f0] rounded-lg mt-2 cursor-pointer">
                                      <span className="text-sm font-bold text-[#ff5734]">Section Quiz</span>
                                      <span className="text-xs bg-white px-2 py-1 rounded">Start</span>
                                   </div>
                                )}
                             </div>
                          )}
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