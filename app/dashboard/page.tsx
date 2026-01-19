'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { 
  Play, Download, CheckSquare, FileText, 
  ChevronDown, ChevronUp, ArrowLeft, ExternalLink, Save
} from 'lucide-react';
import { Course, Module, Lesson } from '@/lib/server/courseStore'; // Using the types we defined

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // 1. Fetch Course Data
  const fetchCourse = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${params.id}`);
      if (!res.ok) throw new Error('Course not found');
      const data = await res.json();
      setCourse(data);
      
      // Set initial active state
      if (data.modules.length > 0) {
        setActiveModuleId(data.modules[0].id);
        setCurrentLesson(data.modules[0].lessons[0]);
        setNotes(data.modules[0].lessons[0].notes || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  // 2. Sync Updates to Backend
  const saveProgress = async (updatedModules: Module[]) => {
    if (!course) return;
    
    // Optimistic Update
    setCourse({ ...course, modules: updatedModules });

    // API Call
    await fetch(`/api/courses/${course.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modules: updatedModules }),
    });
  };

  // 3. Handle Lesson Completion
  const toggleLesson = (moduleId: string, lessonId: string) => {
    if (!course) return;

    const newModules = course.modules.map((m) => {
      if (m.id !== moduleId) return m;
      return {
        ...m,
        lessons: m.lessons.map((l) => 
          l.id === lessonId ? { ...l, completed: !l.completed } : l
        )
      };
    });

    saveProgress(newModules);
  };

  // 4. Handle Notes Save
  const saveNotes = async () => {
    if (!course || !currentLesson) return;
    setSavingNotes(true);

    // Find the lesson and update its notes property
    const newModules = course.modules.map(m => ({
      ...m,
      lessons: m.lessons.map(l => 
        l.id === currentLesson.id ? { ...l, notes: notes } : l
      )
    }));

    await saveProgress(newModules);
    setSavingNotes(false);
  };

  // 5. Handle Report Generation
  const handleGenerateReport = async () => {
    const res = await fetch('/api/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: params.id })
    });
    const data = await res.json();
    alert(`Report Generated!\n\nStudent: ${data.student}\nProgress: ${data.progress}\nCertificate: ${data.certificateId}`);
  };

  // 6. Handle "Download" (Mock)
  const handleDownload = () => {
    alert(`Downloading offline pack for "${course?.title}" to local system...`);
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Course...</div>;
  if (!course) return <div className="h-screen flex items-center justify-center">Course not found.</div>;

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar />
      <div className="ml-20">
        <Topbar userName="Learner" />

        <main className="p-8">
          {/* Breadcrumb / Header */}
          <div className="mb-6 flex items-center justify-between">
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-black">
              <ArrowLeft size={20} /> Back to Dashboard
            </button>
            <div className="flex gap-3">
               <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-full text-sm font-bold hover:bg-gray-50">
                  <Download size={16} /> Offline Mode
               </button>
               <button onClick={handleGenerateReport} className="flex items-center gap-2 px-4 py-2 bg-[#151313] text-white rounded-full text-sm font-bold hover:bg-gray-800">
                  <FileText size={16} /> Generate Report
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Col: Player & Notes */}
            <div className="xl:col-span-2 space-y-6">
               
               {/* "Video" Player Area */}
               <div className="bg-black rounded-3xl overflow-hidden shadow-lg relative aspect-video group">
                  <img 
                    src={course.imageUrl} 
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-30 transition-opacity" 
                    alt="Course Cover"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                     <h2 className="text-3xl font-bold mb-2">{currentLesson?.title}</h2>
                     <p className="text-gray-300 mb-6">{course.title}</p>
                     
                     {currentLesson?.videoUrl && (
                       <a 
                         href={currentLesson.videoUrl} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-center gap-3 px-8 py-4 bg-[#ff5734] rounded-full font-bold hover:scale-105 transition-transform"
                       >
                          <Play fill="white" /> Watch Lesson on YouTube
                          <ExternalLink size={16} />
                       </a>
                     )}
                  </div>
               </div>

               {/* Notes Section */}
               <div className="bg-white rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="font-bold text-xl flex items-center gap-2">
                        <FileText className="text-[#be94f5]" />
                        Study Notes
                     </h3>
                     <button 
                       onClick={saveNotes}
                       disabled={savingNotes}
                       className="text-sm font-bold text-[#151313] hover:text-[#ff5734] flex items-center gap-1"
                     >
                        <Save size={16} /> {savingNotes ? 'Saving...' : 'Save Notes'}
                     </button>
                  </div>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={`Take notes for "${currentLesson?.title}" here...`}
                    className="w-full h-40 p-4 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-[#be94f5] resize-none"
                  />
               </div>
            </div>

            {/* Right Col: Curriculum */}
            <div className="space-y-6">
               {/* Progress Card */}
               <div className="bg-[#151313] text-white p-6 rounded-3xl shadow-sm">
                  <h3 className="font-bold text-lg mb-2">Course Progress</h3>
                  <div className="w-full bg-gray-700 h-2 rounded-full mb-3">
                     <div 
                       className="bg-[#fccc42] h-2 rounded-full transition-all duration-500" 
                       style={{ width: `${course.progress}%` }}
                     />
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                     <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                     <span>{course.progress}% Complete</span>
                  </div>
               </div>

               {/* Modules List */}
               <div className="bg-white rounded-3xl p-6 shadow-sm max-h-[600px] overflow-y-auto custom-scrollbar">
                  <h3 className="font-bold text-xl mb-4">Curriculum</h3>
                  
                  <div className="space-y-4">
                    {course.modules.map((module) => (
                      <div key={module.id} className="border border-gray-100 rounded-xl overflow-hidden">
                        <button 
                          onClick={() => setActiveModuleId(activeModuleId === module.id ? null : module.id)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="text-left">
                            <h4 className="font-bold text-[#151313]">{module.title}</h4>
                            <span className="text-xs text-gray-500">{module.duration}</span>
                          </div>
                          {activeModuleId === module.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>

                        {activeModuleId === module.id && (
                          <div className="divide-y divide-gray-100">
                            {module.lessons.map((lesson) => (
                              <div 
                                key={lesson.id} 
                                className={`p-3 flex items-center justify-between hover:bg-gray-50 ${currentLesson?.id === lesson.id ? 'bg-[#f0f9ff]' : ''}`}
                              >
                                <div 
                                  className="flex items-center gap-3 cursor-pointer flex-1"
                                  onClick={() => {
                                    setCurrentLesson(lesson);
                                    setNotes(lesson.notes || '');
                                  }}
                                >
                                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentLesson?.id === lesson.id ? 'bg-[#151313] text-white' : 'bg-gray-200 text-gray-600'}`}>
                                      {lesson.type === 'video' ? <Play size={10} /> : <FileText size={10} />}
                                   </div>
                                   <span className={`text-sm font-medium ${currentLesson?.id === lesson.id ? 'text-[#151313]' : 'text-gray-600'}`}>
                                      {lesson.title}
                                   </span>
                                </div>
                                
                                <button 
                                  onClick={() => toggleLesson(module.id, lesson.id)}
                                  className={`p-1 rounded transition-colors ${lesson.completed ? 'text-[#ff5734]' : 'text-gray-300 hover:text-gray-400'}`}
                                >
                                   <CheckSquare size={20} fill={lesson.completed ? "currentColor" : "none"} />
                                </button>
                              </div>
                            ))}

                            {/* Quiz Entry */}
                            {module.quiz && (
                               <div className="p-3 bg-[#fff9ea] flex items-center justify-between cursor-pointer hover:brightness-95">
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-[#fccc42] text-[#151313] flex items-center justify-center font-bold">?</div>
                                     <div>
                                        <p className="text-sm font-bold text-[#151313]">Module Quiz</p>
                                        <p className="text-xs text-gray-500">Test your knowledge</p>
                                     </div>
                                  </div>
                                  <button className="px-3 py-1 bg-[#151313] text-white text-xs rounded-full">Start</button>
                               </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
               </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}