'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import {
  BookOpen,
  FileText,
  Play,
  Newspaper,
  ChevronLeft,
  ExternalLink,
  Download,
  Loader2,
  Calendar,
  Users,
  Shield,
  X,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'pdf' | 'blog';
  resource_url: string;
  thumbnail_color: string;
  tags: string[];
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  points: number;
  submission?: {
    status: string;
    submitted_at: string;
    grade?: string;
  };
}

interface Test {
  id: string;
  title: string;
  questions: any[];
  duration_minutes: number;
  attempt?: {
    score: number;
    completed_at: string;
  };
}

interface Classroom {
  id: string;
  name: string;
  description: string | null;
}

export default function ClassroomDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const [params, setParams] = useState<{
    id: string;
  } | null>(null);

  useEffect(() => {
    paramsPromise.then(setParams);
  }, [paramsPromise]);

  const [classroom, setClassroom] =
    useState<Classroom | null>(null);
  const [resources, setResources] = useState<Resource[]>(
    []
  );
  const [assignments, setAssignments] = useState<
    Assignment[]
  >([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'library' | 'assignments' | 'tests'
  >('library');

  // Modal states
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [selectedTest, setSelectedTest] =
    useState<Test | null>(null);
  const [showSubmitModal, setShowSubmitModal] =
    useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignmentUrl, setAssignmentUrl] = useState('');
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  // Test specific state
  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);
  const [userAnswers, setUserAnswers] = useState<any>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testResult, setTestResult] = useState<{
    score: number;
    total: number;
  } | null>(null);

  // Timer effect
  useEffect(() => {
    let timer: any;
    if (showTestModal && timeLeft > 0 && !testResult) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (
      timeLeft === 0 &&
      showTestModal &&
      !testResult
    ) {
      handleFinishTest();
    }
    return () => clearInterval(timer);
  }, [showTestModal, timeLeft, testResult]);

  const handleStartTest = (test: Test) => {
    setSelectedTest(test);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeLeft(test.duration_minutes * 60);
    setTestResult(null);
    setShowTestModal(true);
  };

  const handleAnswerSelect = (
    questionIndex: number,
    answer: any
  ) => {
    setUserAnswers((prev: any) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleFinishTest = async () => {
    if (!selectedTest) return;

    // Calculate score
    let correctCount = 0;
    selectedTest.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round(
      (correctCount / selectedTest.questions.length) * 100
    );
    setTestResult({
      score,
      total: selectedTest.questions.length,
    });

    try {
      if (!params) return;
      setIsSubmitting(true);
      await fetch(
        `/api/student/classrooms/${params.id}/tests/attempt`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            test_id: selectedTest.id,
            score,
            answers: userAnswers,
          }),
        }
      );
      fetchClassroomData(); // Refresh test status
    } catch (error) {
      console.error(
        'Failed to submit test attempt:',
        error
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (params?.id) fetchClassroomData();
  }, [params?.id]);

  const fetchClassroomData = async () => {
    if (!params) return;
    try {
      setLoading(true);
      // Fetch classroom details
      const classRes = await fetch(
        `/api/teacher/classrooms/${params.id}`
      );
      const classData = await classRes.json();

      if (classRes.ok) {
        setClassroom(classData.classroom || classData);
      }

      // Fetch all contents in parallel
      const [libRes, assignRes, testRes] =
        await Promise.all([
          fetch(
            `/api/teacher/classrooms/${params.id}/library`
          ),
          fetch(
            `/api/teacher/classrooms/${params.id}/assignments`
          ),
          fetch(
            `/api/teacher/classrooms/${params.id}/tests`
          ),
        ]);

      if (libRes.ok) setResources(await libRes.json());
      if (assignRes.ok)
        setAssignments(await assignRes.json());
      if (testRes.ok) setTests(await testRes.json());
    } catch (error) {
      console.error(
        'Error fetching classroom data:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (
      !selectedAssignment ||
      !params ||
      (!assignmentUrl && !selectedFile)
    )
      return;

    try {
      setIsSubmitting(true);
      let finalUrl = assignmentUrl;

      // Handle file upload if present
      if (selectedFile) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('Auth required');

        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { data, error: uploadError } =
          await supabase.storage
            .from('submissions')
            .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage
          .from('submissions')
          .getPublicUrl(fileName);

        finalUrl = publicUrl;
      }

      const res = await fetch(
        `/api/student/classrooms/${params.id}/assignments/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assignment_id: selectedAssignment.id,
            file_url: finalUrl,
          }),
        }
      );

      if (res.ok) {
        setShowSubmitModal(false);
        setAssignmentUrl('');
        setSelectedFile(null);
        fetchClassroomData(); // Refresh to show submission status
      }
    } catch (error) {
      console.error('Submission failed:', error);
      alert(
        'Failed to submit assignment. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Play;
      case 'pdf':
        return FileText;
      case 'article':
      case 'blog':
        return Newspaper;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <Sidebar userRole="student" />
      <div className="ml-20">
        <Topbar userName="Learner" />

        <main className="p-8 max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <Link
            href="/dashboard/classrooms"
            className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to My Classrooms
          </Link>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#D8C4FB]" />
              <p className="text-gray-500 mt-4 font-medium">
                Loading classroom contents...
              </p>
            </div>
          ) : !classroom ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-gray-900">
                Classroom not found
              </h2>
              <p className="text-gray-500 mt-2">
                The classroom might have been deleted or you
                don't have access.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Header */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-[#D8C4FB]/20 text-[#151313] text-xs font-bold rounded-full border border-[#D8C4FB]/30 uppercase tracking-wider">
                      Classroom
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold text-[#151313]">
                    {classroom.name}
                  </h1>
                  {classroom.description && (
                    <p className="text-gray-500 mt-2 font-medium max-w-2xl">
                      {classroom.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-4">
                  <div className="bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 text-center min-w-[100px]">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Resources
                    </p>
                    <p className="text-2xl font-bold text-[#151313]">
                      {resources.length}
                    </p>
                  </div>
                  <div className="bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 text-center min-w-[100px]">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Assignments
                    </p>
                    <p className="text-2xl font-bold text-[#151313]">
                      {assignments.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-2 p-1 bg-white rounded-2xl border border-gray-100 w-fit">
                {[
                  {
                    id: 'library',
                    label: 'Library',
                    icon: BookOpen,
                  },
                  {
                    id: 'assignments',
                    label: 'Assignments',
                    icon: FileText,
                  },
                  {
                    id: 'tests',
                    label: 'Tests',
                    icon: Shield,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(tab.id as any)
                    }
                    className={cn(
                      'flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all',
                      activeTab === tab.id
                        ? 'bg-[#D8C4FB] text-[#151313] shadow-sm'
                        : 'text-gray-500 hover:bg-gray-50'
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="min-h-[400px]">
                {activeTab === 'library' && (
                  <div className="space-y-6">
                    {resources.length === 0 ? (
                      <EmptyState
                        icon={BookOpen}
                        title="No resources yet"
                        description="Your teacher hasn't shared any resources."
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resources.map((resource) => (
                          <ResourceCard
                            key={resource.id}
                            resource={resource}
                            getIcon={getIcon}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'assignments' && (
                  <div className="space-y-4">
                    {assignments.length === 0 ? (
                      <EmptyState
                        icon={FileText}
                        title="No assignments"
                        description="You have no pending assignments."
                      />
                    ) : (
                      <div className="grid gap-4">
                        {assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-500" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-[#151313]">
                                  {assignment.title}
                                </h3>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Due:{' '}
                                    {new Date(
                                      assignment.due_date
                                    ).toLocaleDateString()}
                                  </span>
                                  <span className="text-sm text-gray-500 font-medium">
                                    {assignment.points}{' '}
                                    Points
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedAssignment(
                                  assignment
                                );
                                setShowSubmitModal(true);
                              }}
                              className="px-6 py-2 bg-[#151313] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                            >
                              Submit Assignment
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'tests' && (
                  <div className="space-y-4">
                    {tests.length === 0 ? (
                      <EmptyState
                        icon={Shield}
                        title="No tests available"
                        description="No tests have been scheduled."
                      />
                    ) : (
                      <div className="grid gap-4">
                        {tests.map((test) => (
                          <div
                            key={test.id}
                            className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-purple-500" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-[#151313]">
                                  {test.title}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  {test.questions.length}{' '}
                                  Questions •{' '}
                                  {test.duration_minutes}{' '}
                                  Minutes
                                </p>
                              </div>
                            </div>
                            <button
                              disabled={!!test.attempt}
                              onClick={() =>
                                handleStartTest(test)
                              }
                              className={cn(
                                'px-6 py-2 rounded-xl font-bold text-sm transition-all',
                                test.attempt
                                  ? 'bg-green-100 text-green-700 cursor-default'
                                  : 'bg-[#D8C4FB] text-[#151313] hover:opacity-90'
                              )}
                            >
                              {test.attempt
                                ? `Completed (${test.attempt.score}%)`
                                : 'Start Test'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Submission Modal */}
      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 bg-[#151313]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#151313]">
                    Submit Assignment
                  </h2>
                  <p className="text-gray-500 font-medium mt-1">
                    {selectedAssignment.title}
                  </p>
                </div>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <p className="text-sm text-blue-700 font-medium">
                    {selectedAssignment.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#151313] uppercase tracking-wider ml-1">
                      Upload File (Images/PDF)
                    </label>
                    {selectedFile ? (
                      <div className="relative group border-2 border-green-200 bg-green-50 rounded-2xl p-6 transition-all flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-green-700 truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-[10px] text-green-600 font-black uppercase tracking-widest">
                            {(
                              selectedFile.size /
                              1024 /
                              1024
                            ).toFixed(2)}{' '}
                            MB • Ready
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                          className="p-2 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-full transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="relative group border-2 border-dashed border-gray-200 bg-gray-50 rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#D8C4FB] hover:bg-white"
                        onClick={() =>
                          document
                            .getElementById('file-upload')
                            ?.click()
                        }
                      >
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept="image/*,application/pdf"
                          onChange={(e) =>
                            setSelectedFile(
                              e.target.files?.[0] || null
                            )
                          }
                        />
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 group-hover:text-[#D8C4FB]">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-sm text-gray-900">
                            Click to upload your work
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Max size 10MB. Supports Images
                            and PDF.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative flex items-center gap-4 py-2">
                    <div className="h-[1px] bg-gray-100 flex-grow" />
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                      OR
                    </span>
                    <div className="h-[1px] bg-gray-100 flex-grow" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#151313] uppercase tracking-wider ml-1">
                      Or Paste Document URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/your-submission.jpg"
                      value={assignmentUrl}
                      onChange={(e) =>
                        setAssignmentUrl(e.target.value)
                      }
                      className="w-full bg-gray-50 border-2 border-transparent hover:bg-white hover:border-[#D8C4FB] focus:bg-white focus:border-[#D8C4FB] rounded-2xl px-5 py-4 font-medium transition-all outline-none text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmitAssignment}
                  disabled={isSubmitting || !assignmentUrl}
                  className="w-full bg-[#151313] text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-black/10 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Finish Submission'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Taking Modal */}
      {showTestModal && selectedTest && (
        <div className="fixed inset-0 bg-[#f7f7f5] z-[60] flex flex-col animate-in fade-in duration-300">
          {/* Test Header */}
          <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#D8C4FB]/20 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#D8C4FB]" />
              </div>
              <div>
                <h2 className="font-bold text-[#151313] leading-tight">
                  {selectedTest.title}
                </h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                  Question {currentQuestionIndex + 1} of{' '}
                  {selectedTest.questions.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold',
                  timeLeft < 60
                    ? 'bg-red-50 border-red-100 text-red-500 animate-pulse'
                    : 'bg-gray-50 border-gray-100 text-gray-700'
                )}
              >
                <Loader2
                  className={cn(
                    'w-4 h-4',
                    timeLeft > 0 && 'animate-spin'
                  )}
                />
                {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60)
                  .toString()
                  .padStart(2, '0')}
              </div>
              <button
                onClick={() => {
                  if (
                    confirm(
                      'Are you sure you want to exit? Your progress will not be saved.'
                    )
                  ) {
                    setShowTestModal(false);
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </header>

          <div className="flex-grow overflow-y-auto overflow-x-hidden">
            <div className="max-w-3xl mx-auto py-12 px-6">
              {testResult ? (
                <div className="text-center bg-white rounded-[40px] p-12 shadow-xl border border-gray-100 animate-in zoom-in duration-500">
                  <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Shield className="w-16 h-16 text-green-500" />
                  </div>
                  <h2 className="text-4xl font-black text-[#151313] mb-4">
                    Test Completed!
                  </h2>
                  <p className="text-gray-500 font-medium mb-8 text-lg">
                    Your submission has been received and
                    graded.
                  </p>

                  <div className="bg-gray-50 rounded-3xl p-8 mb-8 inline-block min-w-[200px]">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Your Score
                    </p>
                    <p className="text-6xl font-black text-[#151313]">
                      {testResult.score}%
                    </p>
                  </div>

                  <button
                    onClick={() => setShowTestModal(false)}
                    className="block w-full max-w-xs mx-auto bg-[#151313] text-white py-5 rounded-2xl font-bold text-xl hover:opacity-90 transition-all shadow-xl shadow-black/5 mt-4"
                  >
                    Return to Classroom
                  </button>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#D8C4FB] transition-all duration-500"
                      style={{
                        width: `${((currentQuestionIndex + 1) / selectedTest.questions.length) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D8C4FB]/5 rounded-bl-full" />
                    <h3 className="text-2xl font-bold text-[#151313] mb-8 relative z-10">
                      {
                        selectedTest.questions[
                          currentQuestionIndex
                        ].question
                      }
                    </h3>

                    <div className="grid gap-4 relative z-10">
                      {selectedTest.questions[
                        currentQuestionIndex
                      ].options.map(
                        (option: string, i: number) => (
                          <button
                            key={i}
                            onClick={() =>
                              handleAnswerSelect(
                                currentQuestionIndex,
                                option
                              )
                            }
                            className={cn(
                              'w-full text-left p-6 rounded-2xl border-2 font-bold transition-all flex items-center gap-4 group',
                              userAnswers[
                                currentQuestionIndex
                              ] === option
                                ? 'bg-[#D8C4FB]/10 border-[#D8C4FB] text-[#151313] shadow-md shadow-purple-500/5 translate-x-2'
                                : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50 hover:translate-x-1'
                            )}
                          >
                            <span
                              className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors',
                                userAnswers[
                                  currentQuestionIndex
                                ] === option
                                  ? 'bg-[#D8C4FB] text-[#151313]'
                                  : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                              )}
                            >
                              {String.fromCharCode(65 + i)}
                            </span>
                            {option}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <button
                      disabled={currentQuestionIndex === 0}
                      onClick={() =>
                        setCurrentQuestionIndex(
                          (prev) => prev - 1
                        )
                      }
                      className="px-8 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-30"
                    >
                      Previous
                    </button>

                    {currentQuestionIndex ===
                    selectedTest.questions.length - 1 ? (
                      <button
                        onClick={handleFinishTest}
                        disabled={
                          isSubmitting ||
                          userAnswers[
                            currentQuestionIndex
                          ] === undefined
                        }
                        className="flex-grow bg-[#151313] text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          'Complete Test'
                        )}
                      </button>
                    ) : (
                      <button
                        disabled={
                          userAnswers[
                            currentQuestionIndex
                          ] === undefined
                        }
                        onClick={() =>
                          setCurrentQuestionIndex(
                            (prev) => prev + 1
                          )
                        }
                        className="flex-grow bg-[#D8C4FB] text-[#151313] py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-purple-500/10 disabled:opacity-50"
                      >
                        Next Question
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Child Components for cleaner code
function EmptyState({
  icon: Icon,
  title,
  description,
}: any) {
  return (
    <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-100">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon className="w-10 h-10 text-gray-300" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 max-w-sm mx-auto">
        {description}
      </p>
    </div>
  );
}

function ResourceCard({ resource, getIcon }: any) {
  const Icon = getIcon(resource.type);
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      <div
        className="h-32 flex items-center justify-center relative"
        style={{
          backgroundColor:
            resource.thumbnail_color || '#D8C4FB',
        }}
      >
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-[10px] font-bold rounded-md shadow-sm uppercase tracking-wider text-[#151313]">
            {resource.type}
          </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-lg mb-1 leading-tight group-hover:text-[#D8C4FB] transition-colors line-clamp-2">
          {resource.title}
        </h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {resource.description}
        </p>
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex gap-1">
            {resource.tags
              ?.slice(0, 2)
              .map((tag: any, i: number) => (
                <span
                  key={i}
                  className="text-[10px] font-bold text-gray-400 uppercase tracking-wide bg-gray-50 px-2 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
          </div>
          <a
            href={resource.resource_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-gray-50 text-gray-400 hover:bg-[#D8C4FB] hover:text-[#151313] transition-all"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
