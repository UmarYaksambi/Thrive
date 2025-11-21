'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Calendar, Clock, CheckCircle2 } from 'lucide-react';

export default function PlannerPage() {
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('English');
  const [level, setLevel] = useState('Beginner');
  const [showPlan, setShowPlan] = useState(false);

  const handleGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      setShowPlan(true);
    }
  };

  const samplePlan = {
    topic: 'React.js',
    difficulty: 'Intermediate',
    duration: '8 weeks',
    modules: [
      {
        week: 1,
        title: 'React Fundamentals',
        lessons: [
          'Introduction to React',
          'JSX and Components',
          'Props and State',
          'Hooks Basics',
        ],
      },
      {
        week: 2,
        title: 'Component Lifecycle',
        lessons: [
          'useEffect Hook Deep Dive',
          'Custom Hooks',
          'Context API',
          'Performance Optimization',
        ],
      },
      {
        week: 3,
        title: 'State Management',
        lessons: [
          'Redux Basics',
          'Redux Middleware',
          'Redux Hooks',
          'Real-world Applications',
        ],
      },
    ],
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

            <form onSubmit={handleGeneratePlan} className="bg-white rounded-3xl p-8 shadow-sm mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-[#151313] mb-3">
                    What do you want to learn?
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., React.js, Python, UI Design..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="h-12 rounded-full border-2 border-gray-200 focus:border-[#fccc42]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#151313] mb-3">
                    Preferred Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full h-12 rounded-full border-2 border-gray-200 focus:border-[#fccc42] px-4 font-semibold"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>Hindi</option>
                    <option>German</option>
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
                  className="w-full h-24 rounded-3xl border-2 border-gray-200 focus:border-[#fccc42] p-4 font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#fccc42] text-[#151313] font-bold rounded-full hover:bg-[#f4b91a] transition-colors text-lg"
              >
                Generate Learning Path
              </button>
            </form>

            {showPlan && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-8 shadow-sm">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-3xl font-bold text-[#151313] mb-2">
                        {samplePlan.topic}
                      </h3>
                      <p className="text-gray-600">Personalized learning journey</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="px-6 py-3 bg-[#fccc42] rounded-full text-center">
                        <div className="text-sm text-gray-600 font-semibold">Duration</div>
                        <div className="text-lg font-bold text-[#151313]">
                          {samplePlan.duration}
                        </div>
                      </div>
                      <div className="px-6 py-3 bg-[#be94f5] text-white rounded-full text-center">
                        <div className="text-sm font-semibold">Level</div>
                        <div className="text-lg font-bold">{samplePlan.difficulty}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {samplePlan.modules.map((module) => (
                      <div key={module.week} className="border-2 border-gray-200 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-[#fccc42] flex items-center justify-center font-bold text-[#151313]">
                            W{module.week}
                          </div>
                          <h4 className="text-xl font-bold text-[#151313]">
                            {module.title}
                          </h4>
                        </div>

                        <ul className="space-y-3 ml-15">
                          {module.lessons.map((lesson, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-3 text-gray-700 font-semibold"
                            >
                              <div className="w-5 h-5 rounded-full border-2 border-[#fccc42] flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-[#fccc42]"></div>
                              </div>
                              {lesson}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm">
                  <h3 className="text-2xl font-bold text-[#151313] mb-6">Your Progress</h3>
                  <div className="space-y-4">
                    {[
                      { week: 'Week 1', progress: 0 },
                      { week: 'Week 2', progress: 0 },
                      { week: 'Week 3', progress: 0 },
                    ].map((item) => (
                      <div key={item.week} className="flex items-center gap-4">
                        <span className="font-semibold text-[#151313] w-20">{item.week}</span>
                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#fccc42] transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-600">
                          {item.progress}%
                        </span>
                      </div>
                    ))}
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
