'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { StudentProgress } from '@/components/admin/student-progress';
import { CourseManagement } from '@/components/admin/course-management';

interface TeacherDashboardProps {
  userId: string;
  userRole: 'teacher' | 'supervisor';
}

export function TeacherDashboard({ userId, userRole }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState('progress');
  const router = useRouter();

  // Mock stats
  const stats = [
    { name: 'My Students', value: '45', change: '+2', changeType: 'positive' },
    { name: 'My Courses', value: '4', change: '+1', changeType: 'positive' },
    { name: 'Avg. Attendance', value: '92%', change: '-1%', changeType: 'negative' },
    { name: 'Assignments', value: '12', change: '+4', changeType: 'positive' },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Inner Sidebar for Teacher Tools */}
      <div className="w-64 bg-white border-r border-gray-200 p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-[#fccc42] flex items-center justify-center">
              <span className="text-sm font-bold">T</span>
            </div>
            <div>
              <p className="font-medium">Teacher Hub</p>
              <p className="text-xs text-gray-500">{userRole === 'supervisor' ? 'Supervisor' : 'Instructor'}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('progress')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'progress'
                  ? 'bg-[#fff8dc] text-[#b45309]'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0116 8H4a5 5 0 014.5 2.67A6.97 6.97 0 007 16c0 .34.024.673.07 1h5.86z" />
              </svg>
              My Students
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'courses'
                  ? 'bg-[#fff8dc] text-[#b45309]'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 01.812 0l7 3.5a1 1 0 010 1.84l-7 3.5a1 1 0 01-.812 0l-7-3.5a1 1 0 010-1.84l7-3.5z" />
                <path d="M3 11.5a1 1 0 011.447.894l2.5-6.5a1 1 0 011.894 0l2.5 6.5a1 1 0 11-1.895.789L8.5 9.118l-1.947 5.065A1 1 0 015 11.5z" />
              </svg>
              My Courses
            </button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === 'progress' && 'Student Progress Tracking'}
            {activeTab === 'courses' && 'Course & Resource Management'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'progress' && 'Monitor performance of students in your assigned courses'}
            {activeTab === 'courses' && 'Create and update learning materials'}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.name} className="bg-white rounded-xl shadow-sm border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stat.changeType === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {stat.change}
                  </span>
                </div>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stat.value}</p>
                <div className="mt-2">
                  <Progress value={Math.random() * 100} className="h-2 bg-gray-100" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          {activeTab === 'progress' && <StudentProgress userRole={userRole} />}
          {activeTab === 'courses' && <CourseManagement />}
        </div>
      </div>
    </div>
  );
}
