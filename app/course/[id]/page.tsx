'use client';

import { useState, useEffect, use } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { Play, Download, CheckSquare, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Course } from '@/types/course'; // Ensure this type matches your DB schema
import { useRouter } from 'next/navigation';
// Note: In Next.js 15, params is a Promise. Use React.use() to unwrap it if using 'use client'
// Or standard useEffect pattern if preferrable.

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use() or async effect
  // For simplicity/compatibility, we can use a small helper or useEffect
  const [courseId, setCourseId] = useState<string>('');
  
  const [course, setCourse] = useState<Course | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [randomVideo, setRandomVideo] = useState('');
  const router = useRouter();

  // Unwrap params
  useEffect(() => {
    params.then(p => setCourseId(p.id));
  }, [params]);

  // Fetch Course
  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
       try {
         const res = await fetch(`/api/courses/${courseId}`);
         if (!res.ok) throw new Error('Course not found');
         const data = await res.json();
         setCourse(data);
         if (data.modules && data.modules.length > 0) {
            setActiveModuleId(data.modules[0].id);
         }
       } catch (e) {
         console.error(e);
       }
    };
    fetchCourse();
    
    // Pick random video from sample_videos (assuming filenames like video1.mp4, video2.mp4...)
    // This is a mock selection logic for your public folder requirement
    const videoId = Math.floor(Math.random() * 3) + 1; // 1 to 3
    setRandomVideo(`/sample_videos/video${videoId}.mp4`); 

  }, [courseId]);

  if (!course) return <div className="p-10">Loading Course Context...</div>;

  const handleDownload = () => alert("Downloading offline content...");
  const generateReport = () => alert("Generating PDF Report...");

  const handleStartQuiz = (moduleId: string, title: string) => {
     // Navigate to the Quiz Page with query params
     router.push(`/course/${courseId}/quiz?moduleId=${moduleId}&topic=${encodeURIComponent(title)}`);
  };

  const toggleLessonCompletion = async (modId: string, lessonId: string) => {
    const updatedModules = course.modules.map(m => {
      if(m.id !== modId) return m;
      return {
        ...m,
        lessons: m.lessons.map(l => l.id === lessonId ? {...l, completed: !l.completed} : l)
      };
    });
    
    // Optimistic Update
    const newCourseState = {...course, modules: updatedModules};
    setCourse(newCourseState);

    // Save to Backend
    await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules: updatedModules })
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar />
      <div className="ml-20">
        <Topbar />
        <main className="p-8">
           {/* Header */}
           <div className="relative h-64 rounded-3xl overflow-hidden mb-8">
              <img src={course.imageUrl || '/placeholder.jpg'} className="w-full h-full object-cover" />
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
              <div className="xl:col-span-2 space-y-6">
                 {/* Video Player */}
                 <div className="bg-black aspect-video rounded-3xl overflow-hidden relative group">
                    {/* Use the random sample video from public folder */}
                    <video 
                        src={randomVideo} 
                        controls 
                        className="w-full h-full object-cover"
                        poster={course.imageUrl} 
                    />
                 </div>

                 {/* Notes */}
                 <div className="bg-white p-6 rounded-3xl shadow-sm">
                    <h3 className="font-bold text-xl mb-4">Lecture Notes</h3>
                    <textarea 
                      className="w-full h-32 p-4 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#ff5734] outline-none" 
                      placeholder="Type your notes here... (Auto-saved)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                 </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                 <div className="bg-[#151313] text-white p-6 rounded-3xl">
                    <h3 className="font-bold text-lg mb-2">Course Progress</h3>
                    <div className="w-full bg-gray-700 h-2 rounded-full mb-2">
                       <div className="bg-[#fccc42] h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                    </div>
                    <p className="text-sm text-gray-400">{course.progress}% Complete</p>
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
                                         <span className="text-sm font-medium cursor-pointer">{lesson.title}</span>
                                      </div>
                                      <Play size={14} className="text-gray-400 group-hover:text-[#ff5734]" />
                                   </div>
                                ))}
                                
                                {/* Quiz Button */}
                                {module.quiz && (
                                   <div 
                                     onClick={() => handleStartQuiz(module.id, module.title)}
                                     className="flex items-center justify-between p-3 bg-[#fff0ed] border border-[#ff5734]/20 rounded-lg mt-3 cursor-pointer hover:bg-[#ffe4de] transition-colors"
                                   >
                                      <span className="text-sm font-bold text-[#ff5734]">Module Quiz</span>
                                      <span className="text-xs bg-white text-[#ff5734] font-bold px-3 py-1 rounded-full border border-[#ff5734]">Start</span>
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