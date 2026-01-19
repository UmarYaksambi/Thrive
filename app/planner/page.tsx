'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { 
  Loader2, 
  BrainCircuit, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function PlannerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    domain: 'Computer Science',
    topic: '',
    level: 'Beginner',
    language: 'English',
    duration: '4 Weeks',
    includeQuizzes: true,
    includeFinalAssessment: true,
    prerequisites: '',
    takeAssessment: false,
  });

  // Mock Assessment State (In a real app, you'd fetch these questions from an API)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [assessmentScore, setAssessmentScore] = useState<number | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Step 2: Simulate Grading the Pre-Assessment
  const submitAssessment = () => {
    // In production, send answers to /api/assessments/grade
    // Here we simulate a calculation
    const score = 85; // Mock score
    setAssessmentScore(score);
    setStep(3);
  };

  // Step 3: Call the AI Generation API
  const handleGenerateCourse = async () => {
    if (!formData.topic) {
      setError('Please enter a topic.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        // If they took the assessment, we override the level or add context
        existingKnowledge: assessmentScore 
          ? `User scored ${assessmentScore}/100 on the pre-assessment.` 
          : formData.prerequisites,
      };

      const response = await fetch('/api/courses/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to generate course. Please try again.');
      }

      const data = await response.json();

      if (data.success && data.courseId) {
        // Redirect to the newly generated course
        router.push(`/course/${data.courseId}`);
      } else {
        throw new Error('Invalid response from server.');
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

        <main className="p-8 max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#151313] mb-2">AI Course Planner</h1>
            <p className="text-gray-500">Design a custom learning path tailored to your goals.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm min-h-[600px] relative">
            
            {/* Progress Stepper */}
            <div className="flex justify-between mb-10 border-b pb-6">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#ff5734] font-bold' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#ff5734] text-white' : 'bg-gray-100'}`}>1</div>
                <span>Preferences</span>
              </div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#ff5734] font-bold' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#ff5734] text-white' : 'bg-gray-100'}`}>2</div>
                <span>Skill Assessment</span>
              </div>
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#ff5734] font-bold' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-[#ff5734] text-white' : 'bg-gray-100'}`}>3</div>
                <span>Generate</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {/* STEP 1: PREFERENCES */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-bold text-[#151313] mb-2">Domain</label>
                    <select 
                      className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#ff5734] outline-none transition-all"
                      value={formData.domain}
                      onChange={(e) => handleInputChange('domain', e.target.value)}
                    >
                      <option>Computer Science</option>
                      <option>Marketing</option>
                      <option>Business & Economics</option>
                      <option>Psychology</option>
                      <option>Design</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#151313] mb-2">Topic</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Advanced Game Theory, React Hooks" 
                      className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#ff5734] outline-none transition-all"
                      value={formData.topic}
                      onChange={(e) => handleInputChange('topic', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block font-bold text-[#151313] mb-2">Current Level</label>
                    <select 
                      className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#ff5734] outline-none"
                      value={formData.level}
                      onChange={(e) => handleInputChange('level', e.target.value)}
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#151313] mb-2">Language</label>
                    <select 
                      className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#ff5734] outline-none"
                      value={formData.language}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#151313] mb-2">Duration</label>
                    <select 
                      className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#ff5734] outline-none"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                    >
                      <option>1 Week</option>
                      <option>4 Weeks</option>
                      <option>8 Weeks</option>
                      <option>12 Weeks</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#151313] mb-2">Prerequisites / Current Knowledge</label>
                  <textarea 
                    placeholder="e.g. I know basic Python loops and functions..." 
                    className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#ff5734] outline-none h-32 resize-none"
                    value={formData.prerequisites}
                    onChange={(e) => handleInputChange('prerequisites', e.target.value)}
                  />
                </div>

                <div className="p-6 bg-gray-50 rounded-2xl flex flex-col md:flex-row gap-6">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="quizzes" 
                      className="w-5 h-5 accent-[#ff5734]"
                      checked={formData.includeQuizzes}
                      onChange={(e) => handleInputChange('includeQuizzes', e.target.checked)}
                    />
                    <label htmlFor="quizzes" className="font-medium text-gray-700">Include Intermediate Quizzes</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="final" 
                      className="w-5 h-5 accent-[#ff5734]"
                      checked={formData.includeFinalAssessment}
                      onChange={(e) => handleInputChange('includeFinalAssessment', e.target.checked)}
                    />
                    <label htmlFor="final" className="font-medium text-gray-700">Include Final Assessment</label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="assessment" 
                          className="w-6 h-6 accent-[#be94f5]"
                          checked={formData.takeAssessment}
                          onChange={(e) => handleInputChange('takeAssessment', e.target.checked)}
                        />
                        <label htmlFor="assessment" className="font-bold text-[#151313]">I want to take a placement test to determine my level</label>
                     </div>
                     
                     <button 
                        onClick={() => {
                          if(!formData.topic) {
                            setError("Please enter a topic first.");
                            return;
                          }
                          setStep(formData.takeAssessment ? 2 : 3);
                        }}
                        className="px-8 py-4 bg-[#151313] text-white rounded-full font-bold hover:bg-gray-800 transition-colors"
                     >
                        Next Step
                     </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ASSESSMENT (Mock UI) */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="text-center">
                   <BrainCircuit className="w-16 h-16 text-[#be94f5] mx-auto mb-4" />
                   <h2 className="text-2xl font-bold mb-2">Preliminary Assessment</h2>
                   <p className="text-gray-500">Topic: {formData.topic}</p>
                </div>

                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
                   <h3 className="font-bold text-lg mb-4">1. What is the primary function of a {formData.topic}?</h3>
                   <div className="space-y-3">
                      {['Option A: It optimizes backend logic.', 'Option B: It handles UI rendering.', 'Option C: It manages database state.', 'Option D: None of the above.'].map((opt, i) => (
                        <button 
                          key={i}
                          onClick={() => setQuizAnswers({...quizAnswers, 1: opt})}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                             quizAnswers[1] === opt 
                             ? 'border-[#ff5734] bg-white text-[#ff5734] font-bold shadow-md' 
                             : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                           {opt}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="flex justify-between pt-6">
                   <button onClick={() => setStep(1)} className="text-gray-500 font-bold hover:text-black">Back</button>
                   <button 
                      onClick={submitAssessment}
                      className="px-8 py-4 bg-[#be94f5] text-white rounded-full font-bold hover:bg-[#a87df0] transition-colors"
                   >
                      Submit & Continue
                   </button>
                </div>
              </div>
            )}

            {/* STEP 3: GENERATION */}
            {step === 3 && (
              <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500 py-10">
                 {!loading ? (
                    <>
                      <h2 className="text-3xl font-bold text-[#151313]">Ready to Build Your Course?</h2>
                      
                      <div className="max-w-lg mx-auto bg-gray-50 p-6 rounded-2xl text-left space-y-4 text-sm">
                         <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Topic</span>
                            <span className="font-bold">{formData.topic}</span>
                         </div>
                         <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Duration</span>
                            <span className="font-bold">{formData.duration}</span>
                         </div>
                         <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Level</span>
                            <span className="font-bold">{assessmentScore ? `Adjusted (Score: ${assessmentScore})` : formData.level}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-gray-500">Features</span>
                            <span className="font-bold">
                              {formData.includeQuizzes ? 'Quizzes, ' : ''}
                              {formData.includeFinalAssessment ? 'Final Test' : ''}
                            </span>
                         </div>
                      </div>

                      <div className="flex gap-4 justify-center">
                         <button onClick={() => setStep(1)} className="px-6 py-3 text-gray-500 font-bold hover:text-black">Edit Details</button>
                         <button 
                            onClick={handleGenerateCourse}
                            className="px-10 py-4 bg-[#ff5734] text-white rounded-full font-bold text-lg hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                         >
                            <BrainCircuit className="w-5 h-5" />
                            Generate with AI
                         </button>
                      </div>
                    </>
                 ) : (
                    <div className="flex flex-col items-center justify-center py-10 space-y-6">
                       <Loader2 className="w-16 h-16 text-[#ff5734] animate-spin" />
                       <div className="space-y-2">
                          <h3 className="text-2xl font-bold">Designing your curriculum...</h3>
                          <p className="text-gray-500">OpenAI is structuring modules and Gemini is generating artwork.</p>
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