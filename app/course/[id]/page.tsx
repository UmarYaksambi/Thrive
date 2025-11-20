'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { Play, ChevronDown, ChevronUp, Star, Clock, FileText, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const courseData = {
  id: '3',
  title: 'Public Speaking and Leadership',
  category: 'Psychology',
  lessons: 6,
  duration: '3h 25min',
  rating: 4.8,
  reviews: 86,
  breadcrumb: ['My courses', 'Public Speaking and Leadership', 'Lesson 1. Introduction to Public Speaking and Leadership'],
  modules: [
    {
      id: 1,
      title: '01. Introduction to Public Speaking and Leadership',
      duration: '40 min',
      lessons: [
        { id: 1, title: 'Overview of public speaking', duration: '8 min' },
        { id: 2, title: 'Effective communication', duration: '15 min' },
        { id: 3, title: 'Personal leadership assessment', duration: '11 min' },
        { id: 4, title: 'Understanding audience dynamics', duration: '6 min' },
      ],
    },
    {
      id: 2,
      title: '02. Foundations of Public Speaking',
      duration: '36 min',
      lessons: [
        { id: 5, title: 'Voice modulation techniques', duration: '12 min' },
        { id: 6, title: 'Body language basics', duration: '14 min' },
        { id: 7, title: 'Stage presence', duration: '10 min' },
      ],
    },
    {
      id: 3,
      title: '03. Creating clear and engaging messages',
      duration: '24 min',
      lessons: [
        { id: 8, title: 'Message structure', duration: '8 min' },
        { id: 9, title: 'Storytelling techniques', duration: '10 min' },
        { id: 10, title: 'Engaging your audience', duration: '6 min' },
      ],
    },
    {
      id: 4,
      title: '04. Mastering Non-Verbal Communication',
      duration: '55 min',
      lessons: [
        { id: 11, title: 'Reading body language', duration: '15 min' },
        { id: 12, title: 'Facial expressions', duration: '12 min' },
        { id: 13, title: 'Gestures and movement', duration: '18 min' },
        { id: 14, title: 'Eye contact mastery', duration: '10 min' },
      ],
    },
    {
      id: 5,
      title: '05. Persuasion Techniques in Public Speaking',
      duration: '32 min',
      lessons: [
        { id: 15, title: 'Ethos, Pathos, Logos', duration: '12 min' },
        { id: 16, title: 'Call to action strategies', duration: '10 min' },
        { id: 17, title: 'Handling objections', duration: '10 min' },
      ],
    },
    {
      id: 6,
      title: '06. Advanced Speaking Techniques',
      duration: '18 min',
      lessons: [
        { id: 18, title: 'Q&A session mastery', duration: '8 min' },
        { id: 19, title: 'Improvisation skills', duration: '10 min' },
      ],
    },
  ],
  description: `Public speaking is an essential skill that plays a significant role in both personal and professional development. Whether you're delivering a speech at a conference, giving a presentation at work, or speaking at a social event, being able to communicate effectively in front of an audience is invaluable.

In this course, you'll learn the fundamentals of public speaking, from understanding your audience to mastering non-verbal communication. We'll cover techniques for crafting compelling messages, building confidence, and handling challenging situations.`,
  timestamps: [
    { time: '0:00', title: 'Introduction to Public Speaking' },
    { time: '2:34', title: 'The Importance of Public Speaking' },
    { time: '5:46', title: 'Types of Public Speaking' },
    { time: '7:12', title: 'Key Elements of Effective Public Speaking' },
  ],
};

export default function CoursePage() {
  const [activeTab, setActiveTab] = useState<'description' | 'materials' | 'task'>('description');
  const [expandedModules, setExpandedModules] = useState<number[]>([1]);

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar />
      <div className="ml-20">
        <Topbar />

        <main className="p-8">
          <div className="mb-6 text-sm text-gray-500">
            <span className="hover:text-[#ff5734] cursor-pointer">My courses</span>
            {' / '}
            <span className="hover:text-[#ff5734] cursor-pointer">Public Speaking and Leadership</span>
            {' / '}
            <span className="text-[#151313] font-semibold">Lesson 1. Introduction to Public Speaking ...</span>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-[#151313] mb-2">
                {courseData.title}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#fccc42] rounded-full">
                <FileText className="w-5 h-5" />
                <span className="font-semibold">{courseData.lessons} lessons</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border-2 border-gray-200">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">{courseData.duration}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border-2 border-gray-200">
                <Star className="w-5 h-5 fill-[#fccc42] text-[#fccc42]" />
                <span className="font-semibold">{courseData.rating} ({courseData.reviews} reviews)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <div className="bg-gradient-to-br from-[#be94f5] to-[#8b6cc7] rounded-3xl aspect-video flex items-center justify-center mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <button className="relative w-20 h-20 rounded-full bg-[#ff5734] flex items-center justify-center hover:bg-[#e64d2d] transition-all hover:scale-110 shadow-2xl">
                  <Play className="w-10 h-10 text-white ml-1" fill="white" />
                </button>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={cn(
                      'px-6 py-3 font-semibold rounded-t-xl transition-colors',
                      activeTab === 'description'
                        ? 'bg-[#151313] text-white'
                        : 'text-gray-500 hover:text-[#151313]'
                    )}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab('materials')}
                    className={cn(
                      'px-6 py-3 font-semibold rounded-t-xl transition-colors',
                      activeTab === 'materials'
                        ? 'bg-[#151313] text-white'
                        : 'text-gray-500 hover:text-[#151313]'
                    )}
                  >
                    Materials
                  </button>
                  <button
                    onClick={() => setActiveTab('task')}
                    className={cn(
                      'px-6 py-3 font-semibold rounded-t-xl transition-colors',
                      activeTab === 'task'
                        ? 'bg-[#151313] text-white'
                        : 'text-gray-500 hover:text-[#151313]'
                    )}
                  >
                    Home task
                  </button>
                  <button className="ml-auto text-[#ff5734] font-semibold flex items-center gap-2 hover:underline">
                    <Share2 className="w-4 h-4" />
                    Share lesson
                  </button>
                </div>

                {activeTab === 'description' && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {courseData.description}
                    </p>

                    <h3 className="text-xl font-bold text-[#151313] mb-4">Lesson Timeline</h3>
                    <div className="space-y-3">
                      {courseData.timestamps.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 text-[#151313] hover:text-[#ff5734] cursor-pointer transition-colors"
                        >
                          <span className="font-mono font-semibold">{item.time}</span>
                          <span>{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'materials' && (
                  <div className="text-gray-700">
                    <p className="mb-4">Course materials will be available here.</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        <span>Lesson 1 Slides.pdf</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        <span>Public Speaking Checklist.pdf</span>
                      </li>
                    </ul>
                  </div>
                )}

                {activeTab === 'task' && (
                  <div className="text-gray-700">
                    <h3 className="text-xl font-bold text-[#151313] mb-4">Practice Assignment</h3>
                    <p>Record a 2-minute speech on a topic of your choice and submit it for review.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm h-fit max-h-[800px] overflow-y-auto">
              <h2 className="text-2xl font-bold text-[#151313] mb-6">Course Content</h2>

              <div className="space-y-3">
                {courseData.modules.map((module) => {
                  const isExpanded = expandedModules.includes(module.id);

                  return (
                    <div key={module.id} className="border-2 border-gray-200 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-left">
                          <div className="font-bold text-[#151313] mb-1">{module.title}</div>
                          <div className="text-sm text-gray-500">{module.duration}</div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="border-t-2 border-gray-200 bg-gray-50">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between px-6 py-3 hover:bg-white transition-colors cursor-pointer border-b border-gray-200 last:border-b-0"
                            >
                              <div className="flex items-center gap-3">
                                <Play className="w-4 h-4 text-gray-400" />
                                <span className="text-[#151313]">{lesson.title}</span>
                              </div>
                              <span className="text-sm text-gray-500 font-semibold">{lesson.duration}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
