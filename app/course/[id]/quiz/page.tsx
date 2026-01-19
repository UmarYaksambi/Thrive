'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Maximize, Minimize, AlertTriangle, CheckCircle } from 'lucide-react';

export default function QuizPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const moduleId = searchParams.get('moduleId');
  const topic = searchParams.get('topic');

  const [questions, setQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // 1. Generate Quiz
  useEffect(() => {
    const generate = async () => {
      try {
        const res = await fetch('/api/tests/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            topic: topic || 'General Course Knowledge', 
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

  // 2. Full Screen Logic
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

  // 3. Handle Answer
  const handleSelect = (qId: string, option: string) => {
    if (submitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: option }));
  };

  // 4. Submit
  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch('/api/tests/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: params.id,
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

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex flex-col">
      {/* HEADER: Minimalist for Focus */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
         <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if(confirm("Are you sure you want to quit? Your progress will be lost.")) {
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
         <div className="flex items-center gap-4">
            <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">
               {Object.keys(userAnswers).length} / {questions.length} Answered
            </div>
            <button 
              onClick={toggleFullScreen} 
              className="flex items-center gap-2 text-sm font-bold text-[#151313] hover:text-[#ff5734]"
            >
               {isFullScreen ? <><Minimize size={18} /> Exit Full Screen</> : <><Maximize size={18} /> Full Screen</>}
            </button>
         </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full p-8">
        
        {loading && !submitted && (
           <div className="text-center py-20 flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-[#fccc42] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold text-gray-500">Generating secure test environment...</p>
           </div>
        )}

        {!loading && !submitted && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Warning Banner */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-start gap-3">
               <AlertTriangle className="text-yellow-600 shrink-0" />
               <p className="text-sm text-yellow-800">
                  You are in a timed assessment. Do not refresh the page or switch tabs, as it may flag your session.
               </p>
            </div>

            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-start gap-4 mb-6">
                   <span className="w-8 h-8 rounded-full bg-[#151313] text-white flex items-center justify-center font-bold shrink-0">
                      {idx + 1}
                   </span>
                   <p className="font-bold text-lg pt-1">{q.question}</p>
                </div>
                <div className="space-y-3 pl-12">
                  {q.options.map((opt: string) => (
                    <button
                      key={opt}
                      onClick={() => handleSelect(q.id, opt)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                        userAnswers[q.id] === opt 
                          ? 'border-[#ff5734] bg-[#fff0ed] text-[#ff5734] font-bold shadow-md' 
                          : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span>{opt}</span>
                      {userAnswers[q.id] === opt && <CheckCircle size={20} />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="pt-8 pb-20">
               <button 
                 onClick={handleSubmit}
                 disabled={Object.keys(userAnswers).length !== questions.length}
                 className="w-full py-4 bg-[#151313] text-white font-bold rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
               >
                 Submit Final Answers
               </button>
               {Object.keys(userAnswers).length !== questions.length && (
                  <p className="text-center text-sm text-gray-400 mt-2">Please answer all questions to submit.</p>
               )}
            </div>
          </div>
        )}

        {submitted && result && (
           <div className="max-w-xl mx-auto text-center animate-in zoom-in duration-500 pt-10">
              <div className="w-24 h-24 bg-[#151313] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                 <span className="text-3xl font-bold text-[#fccc42]">{result.score}%</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Test Submitted!</h2>
              <p className="text-gray-500 mb-8">{result.feedback}</p>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8 text-left">
                 {result.answers.map((ans: any, i: number) => (
                    <div key={i} className={`p-4 border-b last:border-0 flex justify-between items-center ${ans.isCorrect ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
                       <span className="font-medium text-sm truncate max-w-[70%]">{i+1}. {ans.questionText}</span>
                       <span className={`text-xs font-bold px-2 py-1 rounded ${ans.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {ans.isCorrect ? 'Correct' : 'Incorrect'}
                       </span>
                    </div>
                 ))}
              </div>
              
              <button 
                onClick={() => {
                   if(document.fullscreenElement) document.exitFullscreen();
                   router.back();
                }}
                className="w-full py-4 bg-[#ff5734] text-white font-bold rounded-full hover:shadow-lg transition-transform hover:-translate-y-1"
              >
                Return to Course Dashboard
              </button>
           </div>
        )}

      </main>
    </div>
  );
}