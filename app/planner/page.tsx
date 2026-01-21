'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { Chatbot } from '@/components/ui/chatbot'; 
import { 
  Loader2, BrainCircuit, AlertCircle, CheckCircle, Info 
} from 'lucide-react';

export default function PlannerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Data State
  const [formData, setFormData] = useState({
    domain: 'Computer Science',
    topic: '',
    level: 'Beginner',
    language: 'English',
    duration: '4 Weeks',
    includeQuizzes: true,
    includeFinalAssessment: true,
    prerequisites: '', 
    learningStyle: 'Visual',
    takeAssessment: false,
  });

  // Assessment State
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [assessmentScore, setAssessmentScore] = useState<number | null>(null);
  
  // Confirmation State
  const [isGenerated, setIsGenerated] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // --- TRANSITION: Step 1 -> Step 2 (Generate Quiz) ---
  const handleProceedToStep2 = async () => {
    if (!formData.topic) {
      setError("Please enter a topic first.");
      return;
    }

    if (formData.takeAssessment) {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/tests/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            topic: formData.topic, 
            difficulty: 'General', 
            questionCount: 5 
          })
        });
        
        const data = await res.json();
        if (data.questions) {
          setQuizQuestions(data.questions);
          setStep(2);
        } else {
          throw new Error("Failed to generate quiz questions.");
        }
      } catch (err) {
        setError("Could not generate assessment. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setStep(3);
    }
  };

  // --- TRANSITION: Step 2 -> Step 3 (Grade & Finish) ---
  const submitAssessment = () => {
    let correct = 0;
    quizQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.answer) correct++;
    });
    
    const score = Math.round((correct / quizQuestions.length) * 100);
    setAssessmentScore(score);
    setStep(3);
  };

  // --- FINAL: Generate Course ---
  const handleGenerateCourse = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        assessmentScore: assessmentScore, 
        existingKnowledge: assessmentScore !== null
          ? `User scored ${assessmentScore}% on the placement test. ${formData.prerequisites}` 
          : formData.prerequisites,
      };

      const response = await fetch('/api/courses/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to generate course.');

      const data = await response.json();

      if (data.success) {
        setIsGenerated(true);
        setTimeout(() => {
           router.push('/dashboard'); 
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar />
      <div className="ml-20">
        <Topbar userName="Learner" />
        
        <Chatbot /> 

        <main className="p-8 max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#151313] mb-2">AI Course Planner</h1>
            <p className="text-gray-500">Design a custom learning path tailored to your goals.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm min-h-[600px] relative">
            
            {/* Progress Stepper */}
            <div className="flex justify-between mb-10 border-b pb-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`flex items-center gap-2 ${step >= s ? 'text-[#ff5734] font-bold' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s ? 'bg-[#ff5734] text-white' : 'bg-gray-100'}`}>{s}</div>
                  <span>{s === 1 ? 'Preferences' : s === 2 ? 'Assessment' : 'Generate'}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {/* --- STEP 1: PREFERENCES --- */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block font-bold text-[#151313] mb-2">Domain</label>
                      <select className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#ff5734] outline-none"
                        value={formData.domain} onChange={(e) => handleInputChange('domain', e.target.value)}>
                        <option>Computer Science</option>
                        <option>Marketing</option>
                        <option>Business</option>
                        <option>Psychology</option>
                        <option>Arts & Design</option>
                      </select>
                   </div>
                   <div>
                      <label className="block font-bold text-[#151313] mb-2">Topic</label>
                      <input type="text" placeholder="e.g. React Native, SEO Strategy" className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#ff5734] outline-none"
                        value={formData.topic} onChange={(e) => handleInputChange('topic', e.target.value)} />
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block font-bold text-[#151313] mb-2">Target Level</label>
                        <select className="w-full p-4 border rounded-xl" value={formData.level} onChange={(e) => handleInputChange('level', e.target.value)}>
                            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-bold text-[#151313] mb-2">Language</label>
                        <select className="w-full p-4 border rounded-xl" value={formData.language} onChange={(e) => handleInputChange('language', e.target.value)}>
                            <option>English</option><option>Spanish</option><option>French</option><option>German</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-bold text-[#151313] mb-2">Duration</label>
                        <select className="w-full p-4 border rounded-xl" value={formData.duration} onChange={(e) => handleInputChange('duration', e.target.value)}>
                            <option>1 Week</option><option>4 Weeks</option><option>8 Weeks</option><option>12 Weeks</option>
                        </select>
                    </div>
                </div>

                {/* Prerequisites & Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        {/* FIXED: Wrapped Info icon in a span to attach the title */}
                        <label className="block font-bold text-[#151313] mb-2 flex items-center gap-2">
                            Prerequisites / Current Skills 
                            <span title="What do you already know?" className="cursor-help">
                                <Info size={16} className="text-gray-400" />
                            </span>
                        </label>
                        <textarea 
                            placeholder="e.g. I know basic Python loops, functions, and arrays..." 
                            className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#ff5734] outline-none h-32 resize-none"
                            value={formData.prerequisites}
                            onChange={(e) => handleInputChange('prerequisites', e.target.value)}
                        />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block font-bold text-[#151313] mb-2">Learning Style</label>
                            <select className="w-full p-4 border rounded-xl bg-gray-50" value={formData.learningStyle} onChange={(e) => handleInputChange('learningStyle', e.target.value)}>
                                <option>Visual (Videos & Diagrams)</option>
                                <option>Text-Based (Reading & Docs)</option>
                                <option>Practical (Projects & Code)</option>
                            </select>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <p className="font-bold mb-3 text-sm text-gray-500">Course Features</p>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" className="w-5 h-5 accent-[#ff5734]" checked={formData.includeQuizzes} onChange={(e) => handleInputChange('includeQuizzes', e.target.checked)} />
                                    <label className="text-sm font-medium">Chapter Quizzes</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" className="w-5 h-5 accent-[#ff5734]" checked={formData.includeFinalAssessment} onChange={(e) => handleInputChange('includeFinalAssessment', e.target.checked)} />
                                    <label className="text-sm font-medium">Final Certification Exam</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                   <div className="flex items-center gap-3 bg-[#f0f9ff] p-3 rounded-xl border border-[#bae6fd]">
                      <input type="checkbox" id="assessment" className="w-5 h-5 accent-[#0ea5e9]"
                        checked={formData.takeAssessment} onChange={(e) => handleInputChange('takeAssessment', e.target.checked)} />
                      <label htmlFor="assessment" className="font-bold text-[#0ea5e9] text-sm cursor-pointer">Take placement test to customize curriculum?</label>
                   </div>
                   
                   <button onClick={handleProceedToStep2} disabled={loading}
                      className="px-8 py-4 bg-[#151313] text-white rounded-full font-bold hover:bg-gray-800 transition-colors flex items-center gap-2">
                      {loading ? <Loader2 className="animate-spin" /> : 'Next Step'}
                   </button>
                </div>
              </div>
            )}

            {/* --- STEP 2: ASSESSMENT (REAL) --- */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="text-center">
                   <BrainCircuit className="w-16 h-16 text-[#be94f5] mx-auto mb-4" />
                   <h2 className="text-2xl font-bold mb-2">Knowledge Check</h2>
                   <p className="text-gray-500">Evaluating your proficiency in: {formData.topic}</p>
                </div>

                <div className="space-y-6">
                   {quizQuestions.map((q, idx) => (
                      <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                         <h3 className="font-bold text-lg mb-4 text-[#151313]">{idx + 1}. {q.question}</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options.map((opt: string) => (
                               <button 
                                 key={opt}
                                 onClick={() => setUserAnswers(prev => ({...prev, [q.id]: opt}))}
                                 className={`text-left p-4 rounded-xl border-2 transition-all ${
                                    userAnswers[q.id] === opt 
                                    ? 'border-[#ff5734] bg-white text-[#ff5734] font-bold shadow-md ring-2 ring-[#ff5734]/20' 
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-100'
                                 }`}
                               >
                                  {opt}
                               </button>
                            ))}
                         </div>
                      </div>
                   ))}
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-100">
                   <button onClick={() => setStep(1)} className="text-gray-500 font-bold hover:text-black px-4">Back</button>
                   <button 
                      onClick={submitAssessment}
                      disabled={Object.keys(userAnswers).length < quizQuestions.length}
                      className="px-8 py-4 bg-[#be94f5] text-white rounded-full font-bold hover:bg-[#a87df0] transition-colors disabled:opacity-50 shadow-lg shadow-[#be94f5]/30"
                   >
                      Submit Assessment
                   </button>
                </div>
              </div>
            )}

            {/* --- STEP 3: CONFIRM & GENERATE --- */}
            {step === 3 && (
              <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500 py-10">
                 {!loading && !isGenerated ? (
                    <>
                      <h2 className="text-3xl font-bold text-[#151313]">Ready to Build?</h2>
                      
                      <div className="max-w-lg mx-auto bg-gray-50 p-8 rounded-3xl text-left space-y-4 text-sm shadow-sm border border-gray-100">
                         <div className="flex justify-between border-b border-gray-200 pb-3">
                            <span className="text-gray-500 font-medium">Topic</span>
                            <span className="font-bold text-lg">{formData.topic}</span>
                         </div>
                         {assessmentScore !== null && (
                             <div className="flex justify-between border-b border-gray-200 pb-3">
                                <span className="text-gray-500 font-medium">Assessment Score</span>
                                <span className={`font-bold text-lg ${assessmentScore >= 70 ? 'text-green-600' : 'text-orange-500'}`}>
                                    {assessmentScore}%
                                </span>
                             </div>
                         )}
                         <div className="flex justify-between items-center pt-2">
                            <span className="text-gray-500 font-medium">Difficulty Mode</span>
                            <span className="font-bold px-3 py-1 bg-[#151313] text-white rounded-full text-xs">
                                {assessmentScore === null ? formData.level : assessmentScore >= 80 ? 'Advanced (Accelerated)' : assessmentScore >= 50 ? 'Intermediate (Tailored)' : 'Foundational'}
                            </span>
                         </div>
                      </div>

                      <div className="flex justify-center gap-4">
                          <button onClick={() => setStep(1)} className="px-6 py-3 font-bold text-gray-400 hover:text-black">Edit Settings</button>
                          <button 
                             onClick={handleGenerateCourse}
                             className="px-10 py-4 bg-[#ff5734] text-white rounded-full font-bold text-lg hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                          >
                             <BrainCircuit className="w-5 h-5" />
                             Generate Course
                          </button>
                      </div>
                    </>
                 ) : isGenerated ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-6">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                           <CheckCircle className="w-12 h-12 text-green-600 animate-bounce" />
                        </div>
                        <h3 className="text-3xl font-bold text-[#151313]">Course Created Successfully!</h3>
                        <p className="text-gray-500">Redirecting to your dashboard...</p>
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center py-10 space-y-6">
                       <Loader2 className="w-16 h-16 text-[#ff5734] animate-spin" />
                       <div className="space-y-2">
                          <h3 className="text-2xl font-bold">Constructing your course...</h3>
                          <p className="text-gray-500">AI is structuring modules and Gemini is painting the cover art.</p>
                       </div>
                    </div>
                 )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}