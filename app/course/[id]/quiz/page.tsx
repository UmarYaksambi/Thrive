'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Maximize, Minimize, AlertTriangle, CheckCircle } from 'lucide-react';

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const [courseId, setCourseId] = useState<string>('');
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const moduleId = searchParams.get('moduleId');
  const topic = searchParams.get('topic');

  // ... (Keep existing state: questions, userAnswers, loading, submitted, result, isFullScreen) ...
  const [questions, setQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    params.then(p => setCourseId(p.id));
  }, [params]);

  // ... (Keep existing generate logic) ...
  useEffect(() => {
    if(!topic) return;
    const generate = async () => {
      try {
        const res = await fetch('/api/tests/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            topic: topic, 
            difficulty: 'Intermediate', 
            questionCount: 5 
          })
        });
        const data = await res.json();
        setQuestions(data.questions);
      } catch (e) {
        alert("Failed to generate test.");
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, [topic]);

  // ... (Keep existing Full Screen, Handle Select, and Submit logic) ...
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  const handleSelect = (qId: string, option: string) => {
    if (submitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch('/api/tests/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: courseId, // use the unwrapped ID
        moduleId: moduleId,
        userAnswers,
        originalQuestions: questions
      })
    });
    const data = await res.json();
    setResult(data.result);
    setSubmitted(true);
    setLoading(false);
  };

  // ... (Keep existing JSX return) ...
  return (
    <div className="min-h-screen bg-[#f7f7f5] flex flex-col">
       {/* ... Same UI as previous message ... */}
       {/* Ensure the Back button uses router.back() correctly */}
       {/* Ensure the question mapping uses the state properly */}
       <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
         <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if(confirm("Are you sure you want to quit?")) {
                   if(document.fullscreenElement) document.exitFullscreen();
                   router.back();
                }
              }} 
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
            >
               <ArrowLeft />
            </button>
            <div>
               <h1 className="font-bold text-xl">{topic} Assessment</h1>
               <p className="text-xs text-gray-500">Focus Mode</p>
            </div>
         </div>
         {/* ... Rest of Header ... */}
         <div className="flex items-center gap-4">
            <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">
               {Object.keys(userAnswers).length} / {questions.length} Answered
            </div>
            <button onClick={toggleFullScreen} className="flex items-center gap-2 text-sm font-bold text-[#151313] hover:text-[#ff5734]">
               {isFullScreen ? <><Minimize size={18} /> Exit</> : <><Maximize size={18} /> Full Screen</>}
            </button>
         </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full p-8">
         {/* Loading / Content Logic */}
         {loading && !submitted && (
            <div className="text-center py-20">Generating Quiz...</div>
         )}

         {!loading && !submitted && (
            <div className="space-y-8">
               {questions.map((q, idx) => (
                  <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <div className="flex gap-4 mb-4"><span className="font-bold">{idx+1}</span><p className="font-bold text-lg">{q.question}</p></div>
                     <div className="space-y-2 pl-8">
                        {q.options.map((opt: string) => (
                           <button key={opt} onClick={() => handleSelect(q.id, opt)} className={`w-full text-left p-3 rounded-lg border ${userAnswers[q.id] === opt ? 'bg-[#ff5734] text-white border-[#ff5734]' : 'hover:bg-gray-50'}`}>
                              {opt}
                           </button>
                        ))}
                     </div>
                  </div>
               ))}
               <button onClick={handleSubmit} className="w-full py-4 bg-[#151313] text-white font-bold rounded-full">Submit Final Answers</button>
            </div>
         )}

         {/* Result View */}
         {submitted && result && (
            <div className="text-center pt-10">
               <div className="text-5xl font-bold text-[#fccc42] mb-4">{result.score}%</div>
               <p className="mb-8 text-gray-500">{result.feedback}</p>
               <button onClick={() => router.back()} className="px-8 py-3 bg-[#151313] text-white rounded-full">Return to Course</button>
            </div>
         )}
      </main>
    </div>
  );
}