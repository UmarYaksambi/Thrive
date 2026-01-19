'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentProgress } from './student-progress';
import { CourseManagement } from './course-management';
import { DocumentApproval } from './document-approval';

interface AdminDashboardProps {
  userId: string;
  userRole: 'admin' | 'teacher' | 'supervisor';
}

export function AdminDashboard({ userId, userRole }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('progress');
  const router = useRouter();

  // Mock data - replace with actual data fetching
  const stats = [
    { name: 'Total Students', value: '1,234', change: '+12%', changeType: 'positive' },
    { name: 'Active Courses', value: '24', change: '+2', changeType: 'positive' },
    { name: 'Pending Approvals', value: '15', change: '-3', changeType: 'negative' },
    { name: 'Completion Rate', value: '78%', change: '+5%', changeType: 'positive' },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-[#D8C4FB] flex items-center justify-center">
              <span className="text-sm font-bold">A</span>
            </div>
            <div>
              <p className="font-medium">Admin Dashboard</p>
              <p className="text-xs text-gray-500">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('progress')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'progress'
                  ? 'bg-[#f0e9ff] text-[#8b5cf6]'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <svg
                className="mr-3 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0116 8H4a5 5 0 014.5 2.67A6.97 6.97 0 007 16c0 .34.024.673.07 1h5.86z" />
              </svg>
              Student Progress
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'courses'
                  ? 'bg-[#f0e9ff] text-[#8b5cf6]'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <svg
                className="mr-3 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M10.394 2.08a1 1 0 01.812 0l7 3.5a1 1 0 010 1.84l-7 3.5a1 1 0 01-.812 0l-7-3.5a1 1 0 010-1.84l7-3.5z" />
                <path d="M3 11.5a1 1 0 011.447.894l2.5-6.5a1 1 0 011.894 0l2.5 6.5a1 1 0 11-1.895.789L8.5 9.118l-1.947 5.065A1 1 0 015 11.5z" />
              </svg>
              Course Management
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'documents'
                  ? 'bg-[#f0e9ff] text-[#8b5cf6]'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <svg
                className="mr-3 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2v12h8V8h-3a1 1 0 01-1-1V5H6z"
                  clipRule="evenodd"
                />
              </svg>
              Document Approval
            </button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === 'progress' && 'Student Progress'}
            {activeTab === 'courses' && 'Course Management'}
            {activeTab === 'documents' && 'Document Approval'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'progress' && 'Track and manage student progress across all courses'}
            {activeTab === 'courses' && 'Create, edit, and publish courses for students'}
            {activeTab === 'documents' && 'Review and approve documents for the library'}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.name} className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stat.changeType === 'positive'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stat.value}</p>
                <div className="mt-2">
                  <Progress value={78} className="h-2 bg-gray-100" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeTab === 'progress' && <StudentProgress userRole={userRole} />}
          {activeTab === 'courses' && <CourseManagement />}
          {activeTab === 'documents' && <DocumentApproval currentUserId={userId} />}
        </div>
      </div>
    </div>
  );
}
