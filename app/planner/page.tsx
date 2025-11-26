'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { Brain, Calendar, Clock, CheckCircle2, Youtube, BookOpen, FileText, Search, Sparkles, PlayCircle, X } from 'lucide-react';

// --- Helper to extract Video ID ---
const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// --- New Component to handle Video Toggling ---
const ResourceItem = ({ resource, getIcon }: { resource: any, getIcon: any }) => {
  const [showVideo, setShowVideo] = useState(false);
  const isYoutube = resource.type === 'youtube';
  const videoId = isYoutube ? getYoutubeId(resource.url) : null;

  if (isYoutube && videoId) {
    return (
      <div className="block">
        <button 
          onClick={() => setShowVideo(!showVideo)}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#151313] transition-colors w-full text-left group"
        >
          {getIcon(resource.type)}
          <span className="flex-1">{resource.name}</span>
          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 transition-all ${
            showVideo 
              ? 'bg-red-100 text-red-600' 
              : 'bg-gray-100 text-gray-600 group-hover:bg-[#fccc42] group-hover:text-black'
          }`}>
            {showVideo ? (
              <><X size={12} /> Close</>
            ) : (
              <><PlayCircle size={12} /> Watch</>
            )}
          </span>
        </button>
        
        {/* Video Player Container */}
        <div className={`transition-all duration-300 overflow-hidden ${showVideo ? 'max-h-[500px] mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden bg-black shadow-lg">
            {showVideo && (
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={resource.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default return for non-video resources
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#151313] transition-colors"
    >
      {getIcon(resource.type)}
      <span>{resource.name}</span>
    </a>
  );
};

const LoadingAnimation = ({ stage }: { stage: number }) => {
  const stages = [
    { icon: Search, text: 'Analyzing your requirements...', color: '#fccc42' },
    { icon: Youtube, text: 'Finding YouTube tutorials in Hindi...', color: '#FF0000' },
    { icon: BookOpen, text: 'Searching open source resources...', color: '#be94f5' },
    { icon: FileText, text: 'Curating documentation and articles...', color: '#4CAF50' },
    { icon: Sparkles, text: 'Generating your personalized course...', color: '#fccc42' },
  ];

  return (
    <div className="bg-white rounded-3xl p-12 shadow-sm">
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="relative h-32 flex items-center justify-center">
          {stages.map((s, idx) => {
            const Icon = s.icon;
            const isActive = idx === stage;
            
            return (
              <div
                key={idx}
                className={`absolute transition-all duration-500 ${
                  isActive ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                }`}
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
              >
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center animate-pulse"
                  style={{ backgroundColor: `${s.color}20` }}
                >
                  <Icon className="w-12 h-12" style={{ color: s.color }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-[#151313]">
            {stages[stage]?.text}
          </h3>
          <div className="flex items-center justify-center gap-2">
            {stages.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === stage
                    ? 'w-8 bg-[#fccc42]'
                    : idx < stage
                    ? 'w-2 bg-[#fccc42]'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PlannerPage() {
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('English');
  const [level, setLevel] = useState('Beginner');
  const [prerequisites, setPrerequisites] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);
  const [showPlan, setShowPlan] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});

  const handleGeneratePlan = () => {
    if (topic.trim()) {
      setIsGenerating(true);
      setShowPlan(false);
      setGenerationStage(0);

      const stages = [0, 1, 2, 3, 4];
      stages.forEach((stage, idx) => {
        setTimeout(() => {
          setGenerationStage(stage);
          if (stage === 4) {
            setTimeout(() => {
              setIsGenerating(false);
              setShowPlan(true);
            }, 1500);
          }
        }, idx * 2000);
      });
    }
  };

  interface CompletedLessons {
    [key: string]: boolean;
  }

  const toggleLesson = (weekIdx: number, lessonIdx: number): void => {
    const key = `${weekIdx}-${lessonIdx}`;
    setCompletedLessons((prev: CompletedLessons) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // ... (Keep your existing coursePlan object exactly as is)
  const coursePlan = {
    topic: 'वेब डेवलपमेंट (Web Development)',
    language: 'Hindi',
    difficulty: 'Intermediate',
    duration: '12 weeks',
    modules: [
      {
        week: 1,
        title: 'HTML और CSS की उन्नत अवधारणाएं (Advanced HTML & CSS Concepts)',
        description: 'HTML5 और CSS3 के advanced features सीखें',
        lessons: [
          {
            name: 'सिमेंटिक HTML और एक्सेसिबिलिटी (Semantic HTML & Accessibility)',
            resources: [
              { type: 'youtube', name: 'HTML5 in One Shot - CodeWithHarry', url: 'https://www.youtube.com/watch?v=BsDoLVMnmZs' },
              { type: 'youtube', name: 'HTML Tutorial for Beginners - Thapa Technical', url: 'https://www.youtube.com/watch?v=qHB2jUvPn0g' },
              { type: 'article', name: 'MDN Web Accessibility Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility' }
            ]
          },
          {
            name: 'CSS फ्लेक्सबॉक्स और ग्रिड लेआउट (CSS Flexbox & Grid Layout)',
            resources: [
              { type: 'youtube', name: 'CSS Grid Tutorial in Hindi - CodeWithHarry', url: 'https://www.youtube.com/watch?v=Ba-KKDHEjYo' },
              { type: 'youtube', name: 'Complete CSS Flexbox Tutorial - Thapa Technical', url: 'https://www.youtube.com/watch?v=R3GI7kLQ-Ek' },
              { type: 'course', name: 'CSS Grid Garden - Interactive Game', url: 'https://cssgridgarden.com/' }
            ]
          },
          {
            name: 'CSS एनिमेशन और ट्रांजिशन (CSS Animations & Transitions)',
            resources: [
              { type: 'youtube', name: 'CSS Animation Tutorial - Vinod Bahadur Thapa', url: 'https://www.youtube.com/watch?v=CL8xPGL-p6M' },
              { type: 'youtube', name: 'Advanced CSS Animations - WsCube Tech', url: 'https://www.youtube.com/watch?v=zHUpx90NerM' },
              { type: 'article', name: 'CSS Animation Guide - W3Schools', url: 'https://www.w3schools.com/css/css3_animations.asp' }
            ]
          },
          {
            name: 'रेस्पॉन्सिव डिज़ाइन सिद्धांत (Responsive Design Principles)',
            resources: [
              { type: 'youtube', name: 'Responsive Web Design Complete Course - CodeWithHarry', url: 'https://www.youtube.com/watch?v=ZdHQGrBBzwo' },
              { type: 'youtube', name: 'Mobile First Design - Thapa Technical', url: 'https://www.youtube.com/watch?v=VsNAuGkCpQU' },
              { type: 'course', name: 'freeCodeCamp Responsive Web Design', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/' }
            ]
          }
        ]
      },
      {
        week: 2,
        title: 'जावास्क्रिप्ट - ES6 और आधुनिक फीचर्स (JavaScript - ES6 & Modern Features)',
        description: 'Modern JavaScript concepts और best practices',
        lessons: [
          {
            name: 'एरो फंक्शन और डिस्ट्रक्चरिंग (Arrow Functions & Destructuring)',
            resources: [
              { type: 'youtube', name: 'JavaScript ES6 Tutorial in Hindi - CodeWithHarry', url: 'https://www.youtube.com/watch?v=hGMWLYVRW7s' },
              { type: 'youtube', name: 'ES6 Complete Course - Thapa Technical', url: 'https://www.youtube.com/watch?v=NhZ5VfE6CpY' },
              { type: 'article', name: 'JavaScript.info - Modern JavaScript', url: 'https://javascript.info/' }
            ]
          },
          {
            name: 'प्रॉमिसेस और Async/Await',
            resources: [
              { type: 'youtube', name: 'Async JavaScript Tutorial - CodeWithHarry', url: 'https://www.youtube.com/watch?v=IHjzyhjKxtc' },
              { type: 'youtube', name: 'Promises in JavaScript Hindi - Thapa Technical', url: 'https://www.youtube.com/watch?v=NOzi4wBHn0o' },
              { type: 'article', name: 'JavaScript Promises - MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise' }
            ]
          },
          {
            name: 'मॉड्यूल्स और Import/Export (Modules & Import/Export)',
            resources: [
              { type: 'youtube', name: 'JavaScript Modules Tutorial - WsCube Tech', url: 'https://www.youtube.com/watch?v=qgRUr-YUk1Q' },
              { type: 'youtube', name: 'ES6 Modules Explained Hindi', url: 'https://www.youtube.com/watch?v=cRHQNNcYf6s' },
              { type: 'article', name: 'ES6 Modules Guide', url: 'https://javascript.info/modules-intro' }
            ]
          },
          {
            name: 'एरर हैंडलिंग और डिबगिंग (Error Handling & Debugging)',
            resources: [
              { type: 'youtube', name: 'JavaScript Debugging Tutorial - CodeWithHarry', url: 'https://www.youtube.com/watch?v=3PHXvlpOkf4' },
              { type: 'youtube', name: 'Error Handling in JS - Thapa Technical', url: 'https://www.youtube.com/watch?v=cFTFtuEQ-10' },
              { type: 'article', name: 'Chrome DevTools Guide', url: 'https://developer.chrome.com/docs/devtools/' }
            ]
          }
        ]
      },
      {
        week: 3,
        title: 'DOM मैनिपुलेशन और इवेंट्स (DOM Manipulation & Events)',
        description: 'Interactive web pages बनाना सीखें',
        lessons: [
          {
            name: 'एडवांस्ड DOM सिलेक्शन और ट्रैवर्सल (Advanced DOM Selection & Traversal)',
            resources: [
              { type: 'youtube', name: 'DOM Manipulation Complete Guide - CodeWithHarry', url: 'https://www.youtube.com/watch?v=3PHXvlpOkf4' },
              { type: 'youtube', name: 'JavaScript DOM Tutorial Hindi - Thapa Technical', url: 'https://www.youtube.com/watch?v=IIHZkR4cqSc' },
              { type: 'course', name: 'JavaScript30 - DOM Projects', url: 'https://javascript30.com/' }
            ]
          },
          {
            name: 'इवेंट डेलिगेशन और कस्टम इवेंट्स (Event Delegation & Custom Events)',
            resources: [
              { type: 'youtube', name: 'JavaScript Events Tutorial - WsCube Tech', url: 'https://www.youtube.com/watch?v=VlkdT0bBhGI' },
              { type: 'youtube', name: 'Event Handling in JavaScript Hindi', url: 'https://www.youtube.com/watch?v=Nz4s19Th7ag' },
              { type: 'article', name: 'JavaScript Events - MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/Events' }
            ]
          },
          {
            name: 'फॉर्म वेलिडेशन और यूजर इनपुट (Form Validation & User Input)',
            resources: [
              { type: 'youtube', name: 'Form Validation Tutorial - CodeWithHarry', url: 'https://www.youtube.com/watch?v=In0nB0ABaUk' },
              { type: 'youtube', name: 'JavaScript Form Validation Hindi - Thapa Technical', url: 'https://www.youtube.com/watch?v=rsd4FNGTRBw' },
              { type: 'article', name: 'HTML5 Form Validation', url: 'https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation' }
            ]
          },
          {
            name: 'लोकल स्टोरेज और सेशन स्टोरेज (Local Storage & Session Storage)',
            resources: [
              { type: 'youtube', name: 'Browser Storage Tutorial Hindi - WsCube Tech', url: 'https://www.youtube.com/watch?v=k8yJCeuP6I8' },
              { type: 'youtube', name: 'LocalStorage in JavaScript - CodeWithHarry', url: 'https://www.youtube.com/watch?v=AUOzvFzdIk4' },
              { type: 'article', name: 'Web Storage API Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API' }
            ]
          }
        ]
      },
      {
        week: 4,
        title: 'React.js फंडामेंटल्स (React.js Fundamentals)',
        description: 'Modern web applications के लिए React सीखें',
        lessons: [
          {
            name: 'React कॉम्पोनेन्ट्स और JSX (React Components & JSX)',
            resources: [
              { type: 'youtube', name: 'React JS Tutorial in Hindi - CodeWithHarry', url: 'https://www.youtube.com/watch?v=RGKi6LSPDLU' },
              { type: 'youtube', name: 'React Complete Course - Thapa Technical', url: 'https://www.youtube.com/watch?v=tiLWCNFzThE' },
              { type: 'course', name: 'React Official Tutorial', url: 'https://react.dev/learn' }
            ]
          },
          {
            name: 'स्टेट और Props (State & Props)',
            resources: [
              { type: 'youtube', name: 'React State Management Hindi - WsCube Tech', url: 'https://www.youtube.com/watch?v=O6P86uwfdR0' },
              { type: 'youtube', name: 'Props and State in React - Love Babbar', url: 'https://www.youtube.com/watch?v=4pO-HcG2igk' },
              { type: 'article', name: 'Thinking in React', url: 'https://react.dev/learn/thinking-in-react' }
            ]
          },
          {
            name: 'React Hooks - useState और useEffect',
            resources: [
              { type: 'youtube', name: 'React Hooks Explained Hindi - CodeWithHarry', url: 'https://www.youtube.com/watch?v=mxK8b99iJTg' },
              { type: 'youtube', name: 'Complete React Hooks Tutorial - Thapa Technical', url: 'https://www.youtube.com/watch?v=O6P86uwfdR0' },
              { type: 'article', name: 'React Hooks Reference', url: 'https://react.dev/reference/react' }
            ]
          },
          {
            name: 'कॉम्पोनेन्ट लाइफसाइकिल और साइड इफेक्ट्स (Component Lifecycle & Side Effects)',
            resources: [
              { type: 'youtube', name: 'React Lifecycle Tutorial Hindi - WsCube Tech', url: 'https://www.youtube.com/watch?v=abjeWy4sZiU' },
              { type: 'youtube', name: 'useEffect Hook Complete Guide - Love Babbar', url: 'https://www.youtube.com/watch?v=0ZJgIjIuY7U' },
              { type: 'article', name: 'useEffect Complete Guide', url: 'https://overreacted.io/a-complete-guide-to-useeffect/' }
            ]
          }
        ]
      }
    ]
  };

  interface ProgressCalculation {
    weekIdx: number;
  }

  const calculateProgress = (weekIdx: ProgressCalculation['weekIdx']): number => {
    // Force Week 1 (module.week === 1, index 0) to show 20% progress
    if (weekIdx === 0) return 20;

    const totalLessons = coursePlan.modules[weekIdx].lessons.length;
    const completed = coursePlan.modules[weekIdx].lessons.filter((_: unknown, lessonIdx: number) =>
      completedLessons[`${weekIdx}-${lessonIdx}`]
    ).length;
    return Math.round((completed / totalLessons) * 100);
  };

  type ResourceType = 'youtube' | 'course' | 'article';

  interface Resource {
    type: ResourceType | string;
    name: string;
    url: string;
  }

  const getResourceIcon = (type: ResourceType | string): JSX.Element => {
    switch (type) {
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-600" />;
      case 'course':
        return <BookOpen className="w-4 h-4 text-[#be94f5]" />;
      case 'article':
        return <FileText className="w-4 h-4 text-[#fccc42]" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar />
      <div className="ml-20">
        <Topbar />

        <main className="p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-[#151313] mb-2">Learning Planner</h2>
            <p className="text-gray-600 mb-12">
              Create a personalized learning path tailored to your goals and current level
            </p>

            <div className="bg-white rounded-3xl p-8 shadow-sm mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-[#151313] mb-3">
                    What do you want to learn?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., React.js, Python, UI Design..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full h-12 rounded-full border-2 border-gray-200 focus:border-[#fccc42] px-4 font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#151313] mb-3">
                    Preferred Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full h-12 rounded-full border-2 border-gray-200 focus:border-[#fccc42] px-4 font-semibold outline-none"
                  >
                    <option>English</option>
                    <option>Kannada</option>
                    <option>Hindi</option>
                    <option>Marathi</option>
                    <option>Others (mention in Prerequisites)</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#151313] mb-3">
                  Current Level
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLevel(lvl)}
                      className={`px-6 py-3 rounded-full font-semibold transition-all ${
                        level === lvl
                          ? 'bg-[#fccc42] text-[#151313]'
                          : 'bg-gray-100 text-[#151313] hover:bg-gray-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#151313] mb-3">
                  Prerequisites / Current Knowledge
                </label>
                <textarea
                  placeholder="e.g., I know JavaScript basics, HTML/CSS..."
                  value={prerequisites}
                  onChange={(e) => setPrerequisites(e.target.value)}
                  className="w-full h-24 rounded-3xl border-2 border-gray-200 focus:border-[#fccc42] p-4 font-semibold outline-none resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="w-full py-4 bg-[#fccc42] text-[#151313] font-bold rounded-full hover:bg-[#f4b91a] transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate Learning Path'}
              </button>
            </div>

            {isGenerating && <LoadingAnimation stage={generationStage} />}

            {showPlan && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-8 shadow-sm">
                  <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                    <div>
                      <h3 className="text-3xl font-bold text-[#151313] mb-2">
                        {coursePlan.topic}
                      </h3>
                      <p className="text-gray-600">
                        Personalized learning journey in {coursePlan.language}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div className="px-6 py-3 bg-[#fccc42] rounded-full text-center">
                        <div className="text-sm text-gray-600 font-semibold">Duration</div>
                        <div className="text-lg font-bold text-[#151313]">
                          {coursePlan.duration}
                        </div>
                      </div>
                      <div className="px-6 py-3 bg-[#be94f5] text-white rounded-full text-center">
                        <div className="text-sm font-semibold">Level</div>
                        <div className="text-lg font-bold">{coursePlan.difficulty}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {coursePlan.modules.map((module, weekIdx) => (
                      <div key={module.week} className="border-2 border-gray-200 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 rounded-full bg-[#fccc42] flex items-center justify-center font-bold text-[#151313] flex-shrink-0">
                            W{module.week}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-[#151313]">
                              {module.title}
                            </h4>
                            <p className="text-sm text-gray-600">{module.description}</p>
                          </div>
                        </div>

                        <div className="space-y-4 ml-15 mt-4">
                          {module.lessons.map((lesson, lessonIdx) => {
                            const isCompleted = completedLessons[`${weekIdx}-${lessonIdx}`];
                            return (
                              <div key={lessonIdx} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                                <div className="flex items-start gap-3">
                                  <button
                                    onClick={() => toggleLesson(weekIdx, lessonIdx)}
                                    className="flex-shrink-0 mt-1"
                                  >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                      isCompleted 
                                        ? 'bg-[#fccc42] border-[#fccc42]' 
                                        : 'border-gray-400'
                                    }`}>
                                      {isCompleted && (
                                        <CheckCircle2 className="w-4 h-4 text-[#151313]" />
                                      )}
                                    </div>
                                  </button>
                                  <div className="flex-1">
                                    <h5 className="font-bold text-[#151313] mb-2">
                                      {lesson.name}
                                    </h5>
                                    <div className="space-y-2">
                                      {lesson.resources.map((resource, idx) => (
                                        <ResourceItem 
                                          key={idx} 
                                          resource={resource} 
                                          getIcon={getResourceIcon} 
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm">
                  <h3 className="text-2xl font-bold text-[#151313] mb-6">Your Progress</h3>
                  <div className="space-y-4">
                    {coursePlan.modules.map((module, idx) => {
                      const progress = calculateProgress(idx);
                      return (
                        <div key={idx} className="flex items-center gap-4">
                          <span className="font-semibold text-[#151313] w-20">
                            Week {module.week}
                          </span>
                          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#fccc42] transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-600 w-12 text-right">
                            {progress}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}