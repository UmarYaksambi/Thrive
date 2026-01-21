'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Users,
  Copy,
  Trash2,
  RefreshCw,
  ChevronRight,
  X,
  Check,
  UserMinus,
  BookOpen,
  FileText,
  Play,
  Newspaper,
  Loader2,
  ExternalLink,
  Calendar,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_at: string;
  studentCount: number;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

interface ClassroomResource {
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
}

interface ClassroomTest {
  id: string;
  title: string;
  questions: any[];
  duration_minutes: number;
}

interface ClassroomManagementProps {
  userId: string;
}

export function ClassroomManagement({
  userId,
}: ClassroomManagementProps) {
  const [classrooms, setClassrooms] = useState<Classroom[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [selectedClassroom, setSelectedClassroom] =
    useState<Classroom | null>(null);
  const [activeTab, setActiveTab] = useState<
    'students' | 'library' | 'assignments' | 'tests'
  >('students');
  const [members, setMembers] = useState<Member[]>([]);
  const [resources, setResources] = useState<
    ClassroomResource[]
  >([]);
  const [assignments, setAssignments] = useState<
    Assignment[]
  >([]);
  const [tests, setTests] = useState<ClassroomTest[]>([]);

  const [showCreateModal, setShowCreateModal] =
    useState(false);
  const [showResourceModal, setShowResourceModal] =
    useState(false);
  const [showAssignmentModal, setShowAssignmentModal] =
    useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] =
    useState(false);
  const [showAttemptsModal, setShowAttemptsModal] =
    useState(false);
  const [
    selectedAssignmentForGrading,
    setSelectedAssignmentForGrading,
  ] = useState<Assignment | null>(null);
  const [
    selectedTestForGrading,
    setSelectedTestForGrading,
  ] = useState<ClassroomTest | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [gradingSubmission, setGradingSubmission] =
    useState<any | null>(null);
  const [loadingSubmissions, setLoadingSubmissions] =
    useState(false);

  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] =
    useState('');
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<
    string | null
  >(null);

  // Grading Form State
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submittingGrade, setSubmittingGrade] =
    useState(false);

  // Add Resource Form State
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'pdf' as const,
    resource_url: '',
    tags: '',
  });
  const [addingResource, setAddingResource] =
    useState(false);

  // Add Assignment Form State
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    due_date: '',
    points: 100,
  });
  const [addingAssignment, setAddingAssignment] =
    useState(false);

  // Add Test Form State
  const [newTest, setNewTest] = useState({
    title: '',
    duration_minutes: 30,
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
      },
    ],
  });
  const [addingTest, setAddingTest] = useState(false);

  const handleAddTest = async () => {
    if (!selectedClassroom || !newTest.title)
      return alert('Test title is required');
    setAddingTest(true);
    try {
      const response = await fetch(
        `/api/teacher/classrooms/${selectedClassroom.id}/tests`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTest),
        }
      );
      if (response.ok) {
        setShowTestModal(false);
        setNewTest({
          title: '',
          duration_minutes: 30,
          questions: [
            {
              question: '',
              options: ['', '', '', ''],
              correctAnswer: '',
            },
          ],
        });
        fetchTests(selectedClassroom.id);
      }
    } catch (error) {
      console.error('Error adding test:', error);
    } finally {
      setAddingTest(false);
    }
  };

  const addQuestion = () => {
    setNewTest({
      ...newTest,
      questions: [
        ...newTest.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: '',
        },
      ],
    });
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        '/api/teacher/classrooms'
      );
      const result = await response.json();

      if (response.ok) {
        setClassrooms(result.classrooms || []);
      } else {
        console.error(
          'Failed to fetch classrooms:',
          result.error
        );
      }
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (classroomId: string) => {
    try {
      const response = await fetch(
        `/api/teacher/classrooms/${classroomId}`
      );
      const result = await response.json();

      if (response.ok) {
        setMembers(result.members || []);
      } else {
        console.error(
          'Failed to fetch members:',
          result.error
        );
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchResources = async (classroomId: string) => {
    try {
      const response = await fetch(
        `/api/teacher/classrooms/${classroomId}/library`
      );
      const result = await response.json();
      if (response.ok) setResources(result || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const fetchAssignments = async (classroomId: string) => {
    try {
      const response = await fetch(
        `/api/teacher/classrooms/${classroomId}/assignments`
      );
      const result = await response.json();
      if (response.ok) setAssignments(result || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchTests = async (classroomId: string) => {
    try {
      const response = await fetch(
        `/api/teacher/classrooms/${classroomId}/tests`
      );
      const result = await response.json();
      if (response.ok) setTests(result || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const handleSelectClassroom = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    fetchMembers(classroom.id);
    if (activeTab === 'library')
      fetchResources(classroom.id);
    if (activeTab === 'assignments')
      fetchAssignments(classroom.id);
    if (activeTab === 'tests') fetchTests(classroom.id);
  };

  useEffect(() => {
    if (selectedClassroom) {
      if (activeTab === 'library')
        fetchResources(selectedClassroom.id);
      if (activeTab === 'assignments')
        fetchAssignments(selectedClassroom.id);
      if (activeTab === 'tests')
        fetchTests(selectedClassroom.id);
    }
  }, [activeTab, selectedClassroom]);

  const handleCreateClassroom = async () => {
    if (!newClassName.trim())
      return alert('Please enter a classroom name');
    setCreating(true);
    try {
      const response = await fetch(
        '/api/teacher/classrooms',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newClassName,
            description: newClassDescription,
          }),
        }
      );
      if (response.ok) {
        setShowCreateModal(false);
        setNewClassName('');
        setNewClassDescription('');
        fetchClassrooms();
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to create classroom');
      }
    } catch (error) {
      console.error('Error creating classroom:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleAddAssignment = async () => {
    if (!selectedClassroom || !newAssignment.title)
      return alert('Assignment title is required');
    setAddingAssignment(true);
    try {
      const response = await fetch(
        `/api/teacher/classrooms/${selectedClassroom.id}/assignments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAssignment),
        }
      );
      if (response.ok) {
        setShowAssignmentModal(false);
        setNewAssignment({
          title: '',
          description: '',
          due_date: '',
          points: 100,
        });
        fetchAssignments(selectedClassroom.id);
      }
    } catch (error) {
      console.error('Error adding assignment:', error);
    } finally {
      setAddingAssignment(false);
    }
  };

  const handleAddResource = async () => {
    if (
      !selectedClassroom ||
      !newResource.title ||
      !newResource.resource_url
    )
      return alert('Required fields missing');
    setAddingResource(true);
    try {
      const pastelColors = [
        '#D8C4FB',
        '#FFD8C4',
        '#C4FBD8',
        '#C4D8FB',
        '#FBC4D8',
      ];
      const randomColor =
        pastelColors[
          Math.floor(Math.random() * pastelColors.length)
        ];
      const response = await fetch(
        `/api/teacher/classrooms/${selectedClassroom.id}/library`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newResource,
            thumbnail_color: randomColor,
            tags: newResource.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
          }),
        }
      );
      if (response.ok) {
        setShowResourceModal(false);
        setNewResource({
          title: '',
          description: '',
          type: 'pdf',
          resource_url: '',
          tags: '',
        });
        fetchResources(selectedClassroom.id);
      }
    } catch (error) {
      console.error('Error adding resource:', error);
    } finally {
      setAddingResource(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleRegenerateCode = async (
    classroomId: string
  ) => {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await fetch(
        `/api/teacher/classrooms/${classroomId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ regenerateCode: true }),
        }
      );
      if (response.ok) {
        fetchClassrooms();
        const result = await response.json();
        if (selectedClassroom?.id === classroomId)
          setSelectedClassroom(result.classroom);
      }
    } catch (error) {
      console.error('Error regenerating code:', error);
    }
  };

  const handleDeleteClassroom = async (
    classroomId: string
  ) => {
    if (!confirm('Delete this classroom?')) return;
    try {
      const response = await fetch(
        `/api/teacher/classrooms/${classroomId}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        setSelectedClassroom(null);
        setMembers([]);
        fetchClassrooms();
      }
    } catch (error) {
      console.error('Error deleting classroom:', error);
    }
  };

  const handleRemoveStudent = async (
    studentUserId: string
  ) => {
    if (!selectedClassroom || !confirm('Remove student?'))
      return;
    try {
      const response = await fetch(
        `/api/teacher/classrooms/${selectedClassroom.id}/members`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: studentUserId }),
        }
      );
      if (response.ok) {
        fetchMembers(selectedClassroom.id);
        fetchClassrooms();
      }
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  const handleViewSubmissions = async (
    assignment: Assignment
  ) => {
    if (!selectedClassroom) return;
    setSelectedAssignmentForGrading(assignment);
    setShowSubmissionsModal(true);
    setLoadingSubmissions(true);
    try {
      const response = await fetch(
        `/api/teacher/classrooms/${selectedClassroom.id}/submissions?assignment_id=${assignment.id}`
      );
      const result = await response.json();
      if (response.ok) setSubmissions(result || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleViewAttempts = async (
    test: ClassroomTest
  ) => {
    if (!selectedClassroom) return;
    setSelectedTestForGrading(test);
    setShowAttemptsModal(true);
    setLoadingSubmissions(true);
    try {
      const response = await fetch(
        `/api/teacher/classrooms/${selectedClassroom.id}/tests/attempts?test_id=${test.id}`
      );
      const result = await response.json();
      if (response.ok) setAttempts(result || []);
    } catch (error) {
      console.error('Error fetching attempts:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedClassroom || !gradingSubmission) return;
    setSubmittingGrade(true);
    try {
      const response = await fetch(
        `/api/teacher/classrooms/${selectedClassroom.id}/submissions`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submission_id: gradingSubmission.id,
            grade,
            teacher_feedback: feedback,
            status: 'graded',
          }),
        }
      );
      if (response.ok) {
        setGradingSubmission(null);
        setGrade('');
        setFeedback('');
        if (selectedAssignmentForGrading)
          handleViewSubmissions(
            selectedAssignmentForGrading
          );
      }
    } catch (error) {
      console.error('Error grading submission:', error);
    } finally {
      setSubmittingGrade(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Classrooms
          </h1>
          <p className="text-gray-500">
            Manage your classrooms and curriculum
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#D8C4FB] hover:bg-[#C2AAFB] text-[#151313]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Classroom
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classrooms List */}
        <div className="lg:col-span-1 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : classrooms.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  No classrooms yet
                </p>
                <Button
                  variant="link"
                  onClick={() => setShowCreateModal(true)}
                  className="mt-2 text-[#D8C4FB]"
                >
                  Create your first classroom
                </Button>
              </CardContent>
            </Card>
          ) : (
            classrooms.map((classroom) => (
              <Card
                key={classroom.id}
                className={`cursor-pointer transition-all hover:shadow-md ${selectedClassroom?.id === classroom.id ? 'ring-2 ring-[#D8C4FB] bg-purple-50' : ''}`}
                onClick={() =>
                  handleSelectClassroom(classroom)
                }
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {classroom.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <Users className="w-4 h-4" />
                      {classroom.studentCount} student
                      {classroom.studentCount !== 1
                        ? 's'
                        : ''}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Classroom Details */}
        <div className="lg:col-span-2">
          {selectedClassroom ? (
            <Card className="flex flex-col h-full">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {selectedClassroom.name}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDeleteClassroom(
                        selectedClassroom.id
                      )
                    }
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {selectedClassroom.description && (
                  <p className="text-gray-500 text-sm">
                    {selectedClassroom.description}
                  </p>
                )}
              </CardHeader>

              {/* Tabs */}
              <div className="flex border-b overflow-x-auto">
                {[
                  'students',
                  'library',
                  'assignments',
                  'tests',
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? 'border-b-2 border-[#D8C4FB] text-[#151313]' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <CardContent className="p-6 flex-1 overflow-y-auto">
                {activeTab === 'students' && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-3">
                        Invite Code
                      </h4>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-white border-2 border-dashed border-[#D8C4FB] rounded-xl px-4 py-3">
                          <span className="font-mono text-3xl font-bold tracking-[0.2em] text-[#151313]">
                            {selectedClassroom.invite_code}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          className="h-14 w-14 rounded-xl"
                          onClick={() =>
                            handleCopyCode(
                              selectedClassroom.invite_code
                            )
                          }
                        >
                          {copiedCode ===
                          selectedClassroom.invite_code ? (
                            <Check className="text-green-600" />
                          ) : (
                            <Copy />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="h-14 w-14 rounded-xl"
                          onClick={() =>
                            handleRegenerateCode(
                              selectedClassroom.id
                            )
                          }
                        >
                          <RefreshCw />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-3 font-medium">
                        Students can join using this code
                        via their dashboard.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#D8C4FB]" />
                        Active Students ({members.length})
                      </h4>
                      <div className="space-y-2">
                        {members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D8C4FB] to-[#C2AAFB] flex items-center justify-center text-white font-bold text-lg">
                                {member.profile?.full_name?.charAt(
                                  0
                                ) || '?'}
                              </div>
                              <div>
                                <p className="font-bold text-[#151313]">
                                  {member.profile
                                    ?.full_name ||
                                    'Anonymous'}
                                </p>
                                <p className="text-xs text-gray-500 font-medium">
                                  {member.profile?.email}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRemoveStudent(
                                  member.user_id
                                )
                              }
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                            >
                              <UserMinus className="w-5 h-5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'library' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#151313]">
                        Available Resources (
                        {resources.length})
                      </h4>
                      <Button
                        size="sm"
                        onClick={() =>
                          setShowResourceModal(true)
                        }
                        className="bg-[#D8C4FB] text-[#151313] hover:bg-[#C2AAFB] font-bold"
                      >
                        <Plus className="w-4 h-4 mr-2" />{' '}
                        Add to Library
                      </Button>
                    </div>
                    {resources.length === 0 ? (
                      <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-bold text-gray-400">
                          Library is currently empty
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resources.map((res) => (
                          <Card
                            key={res.id}
                            className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow group"
                          >
                            <div className="flex h-24">
                              <div
                                className="w-24 h-full flex items-center justify-center"
                                style={{
                                  backgroundColor:
                                    res.thumbnail_color,
                                }}
                              >
                                {res.type === 'video' ? (
                                  <Play className="text-white" />
                                ) : (
                                  <FileText className="text-white" />
                                )}
                              </div>
                              <div className="flex-1 p-3 min-w-0">
                                <h5 className="font-bold text-gray-900 truncate">
                                  {res.title}
                                </h5>
                                <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                                  {res.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold border-none">
                                    {res.type}
                                  </Badge>
                                  <a
                                    href={res.resource_url}
                                    target="_blank"
                                    className="ml-auto text-blue-500 hover:text-blue-600"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'assignments' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#151313]">
                        Active Assignments (
                        {assignments.length})
                      </h4>
                      <Button
                        size="sm"
                        onClick={() =>
                          setShowAssignmentModal(true)
                        }
                        className="bg-[#D8C4FB] text-[#151313] hover:bg-[#C2AAFB] font-bold"
                      >
                        <Plus className="w-4 h-4 mr-2" />{' '}
                        New Assignment
                      </Button>
                    </div>
                    {assignments.length === 0 ? (
                      <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-bold text-gray-400">
                          No assignments created yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="p-5 bg-white border border-gray-100 rounded-2xl flex justify-between items-center hover:shadow-sm transition-all"
                          >
                            <div>
                              <h5 className="font-bold text-[#151313] text-lg">
                                {assignment.title}
                              </h5>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 font-medium">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-4 h-4" />{' '}
                                  Due:{' '}
                                  {assignment.due_date
                                    ? new Date(
                                        assignment.due_date
                                      ).toLocaleDateString()
                                    : 'No date'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Shield className="w-4 h-4" />{' '}
                                  {assignment.points} Points
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() =>
                                handleViewSubmissions(
                                  assignment
                                )
                              }
                              className="rounded-full border-[#D8C4FB] text-[#151313] font-bold"
                            >
                              View Submissions
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'tests' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#151313]">
                        Assessments ({tests.length})
                      </h4>
                      <Button
                        size="sm"
                        onClick={() =>
                          setShowTestModal(true)
                        }
                        className="bg-[#D8C4FB] text-[#151313] hover:bg-[#C2AAFB] font-bold"
                      >
                        <Plus className="w-4 h-4 mr-2" />{' '}
                        Create Test
                      </Button>
                    </div>
                    {tests.length === 0 ? (
                      <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-bold text-gray-400">
                          No tests created yet
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tests.map((test) => (
                          <Card
                            key={test.id}
                            className="p-5 border-gray-100 hover:border-[#D8C4FB] transition-all"
                          >
                            <h5 className="font-bold text-[#151313] text-lg mb-2">
                              {test.title}
                            </h5>
                            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium mb-4">
                              <span>
                                {test.questions?.length ||
                                  0}{' '}
                                Questions
                              </span>
                              <span>•</span>
                              <span>
                                {test.duration_minutes} Mins
                              </span>
                            </div>
                            <Button
                              onClick={() =>
                                handleViewAttempts(test)
                              }
                              className="w-full bg-gray-50 text-gray-900 border-none hover:bg-gray-100 font-bold"
                            >
                              View Attempts
                            </Button>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center border-none bg-white/50">
              <div className="text-center py-20">
                <Users className="w-20 h-20 mx-auto text-gray-200 mb-6" />
                <h3 className="text-xl font-bold text-gray-400">
                  Select a classroom to get started
                </h3>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in duration-200 rounded-3xl overflow-hidden">
            <CardHeader className="bg-[#D8C4FB] text-[#151313]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">
                  New Assignment
                </CardTitle>
                <button
                  onClick={() =>
                    setShowAssignmentModal(false)
                  }
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                    Assignment Title
                  </label>
                  <Input
                    value={newAssignment.title}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        title: e.target.value,
                      })
                    }
                    placeholder="e.g. Weekly Writing Prompt"
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                    Description
                  </label>
                  <textarea
                    className="w-full h-24 rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-[#D8C4FB] focus:outline-none"
                    value={newAssignment.description}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        description: e.target.value,
                      })
                    }
                    placeholder="Detailed instructions for the assignment"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                      Due Date
                    </label>
                    <Input
                      type="date"
                      value={newAssignment.due_date}
                      onChange={(e) =>
                        setNewAssignment({
                          ...newAssignment,
                          due_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                      Points
                    </label>
                    <Input
                      type="number"
                      value={newAssignment.points}
                      onChange={(e) =>
                        setNewAssignment({
                          ...newAssignment,
                          points: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <Button
                onClick={handleAddAssignment}
                disabled={addingAssignment}
                className="w-full bg-[#151313] text-white h-14 rounded-2xl font-bold text-lg mt-4"
              >
                {addingAssignment ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  'Create Assignment'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resource Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md rounded-3xl overflow-hidden">
            <CardHeader className="bg-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">
                  Add Library Resource
                </CardTitle>
                <button
                  onClick={() =>
                    setShowResourceModal(false)
                  }
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                    Resource Title
                  </label>
                  <Input
                    value={newResource.title}
                    onChange={(e) =>
                      setNewResource({
                        ...newResource,
                        title: e.target.value,
                      })
                    }
                    placeholder="Title"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                      Type
                    </label>
                    <select
                      className="w-full h-10 border rounded-lg px-2 text-sm"
                      value={newResource.type}
                      onChange={(e) =>
                        setNewResource({
                          ...newResource,
                          type: e.target.value as any,
                        })
                      }
                    >
                      <option value="pdf">PDF</option>
                      <option value="video">Video</option>
                      <option value="article">
                        Article
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                      Tags
                    </label>
                    <Input
                      value={newResource.tags}
                      onChange={(e) =>
                        setNewResource({
                          ...newResource,
                          tags: e.target.value,
                        })
                      }
                      placeholder="tag1, tag2"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                    Resource URL
                  </label>
                  <Input
                    value={newResource.resource_url}
                    onChange={(e) =>
                      setNewResource({
                        ...newResource,
                        resource_url: e.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>
              <Button
                onClick={handleAddResource}
                disabled={addingResource}
                className="w-full bg-[#151313] text-white h-12 rounded-xl font-bold mt-4"
              >
                {addingResource ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  'Add to Library'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Creation Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <CardHeader className="bg-[#D8C4FB] text-[#151313] p-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black">
                    Create Assessment
                  </CardTitle>
                  <p className="text-sm font-medium opacity-70">
                    Design a new test for your students
                  </p>
                </div>
                <button
                  onClick={() => setShowTestModal(false)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8 overflow-y-auto flex-1 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Test Title
                  </label>
                  <Input
                    value={newTest.title}
                    onChange={(e) =>
                      setNewTest({
                        ...newTest,
                        title: e.target.value,
                      })
                    }
                    placeholder="e.g. Midterm Physics Quiz"
                    className="h-12 rounded-xl focus:ring-[#D8C4FB] font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Duration (Mins)
                  </label>
                  <Input
                    type="number"
                    value={newTest.duration_minutes}
                    onChange={(e) =>
                      setNewTest({
                        ...newTest,
                        duration_minutes: parseInt(
                          e.target.value
                        ),
                      })
                    }
                    className="h-12 rounded-xl focus:ring-[#D8C4FB] font-bold"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-[#151313] uppercase tracking-widest text-xs">
                    Questions ({newTest.questions.length})
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addQuestion}
                    className="rounded-full border-[#D8C4FB] text-[#151313] font-bold px-4"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add
                    Question
                  </Button>
                </div>

                <div className="space-y-8">
                  {newTest.questions.map((q, qIndex) => (
                    <div
                      key={qIndex}
                      className="bg-gray-50 rounded-[32px] p-6 border border-gray-100 relative group animate-in slide-in-from-bottom-4 duration-300"
                    >
                      <div className="absolute -left-3 top-6 bg-white w-8 h-8 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center font-black text-sm text-[#D8C4FB]">
                        {qIndex + 1}
                      </div>

                      <div className="space-y-4">
                        <textarea
                          className="w-full bg-white rounded-2xl border border-gray-100 p-4 text-sm font-bold focus:ring-2 focus:ring-[#D8C4FB] outline-none transition-all shadow-sm"
                          value={q.question}
                          onChange={(e) => {
                            const qs = [
                              ...newTest.questions,
                            ];
                            qs[qIndex].question =
                              e.target.value;
                            setNewTest({
                              ...newTest,
                              questions: qs,
                            });
                          }}
                          placeholder="Type your question here..."
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map(
                            (option, oIndex) => (
                              <div
                                key={oIndex}
                                className="relative"
                              >
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const qs = [
                                      ...newTest.questions,
                                    ];
                                    qs[qIndex].options[
                                      oIndex
                                    ] = e.target.value;
                                    setNewTest({
                                      ...newTest,
                                      questions: qs,
                                    });
                                  }}
                                  className={cn(
                                    'h-11 pl-10 pr-10 rounded-xl transition-all',
                                    q.correctAnswer ===
                                      option &&
                                      option !== ''
                                      ? 'border-[#D8C4FB] bg-purple-50 ring-1 ring-[#D8C4FB]'
                                      : 'bg-white'
                                  )}
                                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase">
                                  {String.fromCharCode(
                                    65 + oIndex
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const qs = [
                                      ...newTest.questions,
                                    ];
                                    qs[
                                      qIndex
                                    ].correctAnswer =
                                      option;
                                    setNewTest({
                                      ...newTest,
                                      questions: qs,
                                    });
                                  }}
                                  className={cn(
                                    'absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all',
                                    q.correctAnswer ===
                                      option &&
                                      option !== ''
                                      ? 'bg-[#D8C4FB] text-[#151313]'
                                      : 'text-gray-200 hover:text-gray-400'
                                  )}
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {newTest.questions.length > 1 && (
                        <button
                          onClick={() => {
                            const qs =
                              newTest.questions.filter(
                                (_, i) => i !== qIndex
                              );
                            setNewTest({
                              ...newTest,
                              questions: qs,
                            });
                          }}
                          className="absolute -right-2 -top-2 w-8 h-8 bg-white rounded-full border border-gray-100 shadow-sm flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleAddTest}
                disabled={addingTest}
                className="w-full bg-[#151313] text-white h-16 rounded-2xl font-black text-xl hover:opacity-90 transition-all shadow-xl shadow-black/10 mt-4"
              >
                {addingTest ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  'Launch Assessment'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Submissions Modal */}
      {showSubmissionsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <CardHeader className="bg-[#D8C4FB] text-[#151313]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">
                    Submissions
                  </CardTitle>
                  <p className="text-sm font-medium opacity-70">
                    {selectedAssignmentForGrading?.title}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setShowSubmissionsModal(false)
                  }
                  className="p-2 hover:bg-black/5 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col md:flex-row bg-white">
              {/* Submissions List */}
              <div className="w-full md:w-1/3 border-r overflow-y-auto p-4 space-y-2 bg-gray-50/30">
                {loadingSubmissions ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-[#D8C4FB]" />
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <FileText className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                    <p className="text-sm text-gray-400 font-medium">
                      No one has submitted anything yet
                    </p>
                  </div>
                ) : (
                  submissions.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setGradingSubmission(sub);
                        setGrade(sub.grade || '');
                        setFeedback(
                          sub.teacher_feedback || ''
                        );
                      }}
                      className={cn(
                        'w-full text-left p-4 rounded-xl transition-all border group',
                        gradingSubmission?.id === sub.id
                          ? 'bg-[#D8C4FB] border-[#D8C4FB] text-[#151313] shadow-lg shadow-purple-500/10'
                          : 'bg-white border-gray-100 hover:border-[#D8C4FB] hover:shadow-sm'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold line-clamp-1">
                          {sub.student.full_name}
                        </p>
                        {sub.status === 'graded' && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-[10px] uppercase font-black opacity-40 tracking-wider">
                        {new Date(
                          sub.submitted_at
                        ).toLocaleDateString()}{' '}
                        at{' '}
                        {new Date(
                          sub.submitted_at
                        ).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {sub.status === 'graded' && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] font-black bg-white/50 px-2 py-0.5 rounded">
                            GRADE: {sub.grade}
                          </span>
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Grading Review Area */}
              <div className="flex-1 overflow-y-auto p-8 bg-white">
                {gradingSubmission ? (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D8C4FB] to-[#C2AAFB] flex items-center justify-center text-white font-black text-2xl shadow-lg ring-4 ring-purple-50">
                        {gradingSubmission.student.full_name.charAt(
                          0
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-2xl text-[#151313]">
                          {
                            gradingSubmission.student
                              .full_name
                          }
                        </h4>
                        <p className="text-sm text-gray-400 font-medium">
                          Submission Detail •{' '}
                          {gradingSubmission.status}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-6">
                      <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#D8C4FB]/5 rounded-bl-full" />
                        <h5 className="font-black text-[#151313] mb-4 uppercase tracking-widest text-[10px] flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#D8C4FB]" />
                          Submission View
                        </h5>

                        {gradingSubmission.file_url && (
                          <div className="mb-6">
                            <a
                              href={
                                gradingSubmission.file_url
                              }
                              target="_blank"
                              className="flex items-center justify-between p-5 bg-white border-2 border-dashed border-[#D8C4FB]/30 rounded-2xl hover:border-[#D8C4FB] hover:bg-purple-50/30 transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                                  <FileText className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                  <p className="font-bold text-[#151313]">
                                    View Full Draft
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Click to open in a new
                                    tab
                                  </p>
                                </div>
                              </div>
                              <ExternalLink className="w-5 h-5 text-[#D8C4FB]" />
                            </a>
                          </div>
                        )}

                        {gradingSubmission.ocr_text && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h6 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                AI Text Extraction
                              </h6>
                              <Badge className="bg-[#D8C4FB]/20 text-[#151313] border-none text-[9px]">
                                GEMINI OCR
                              </Badge>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 italic text-gray-600 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed shadow-inner">
                              {gradingSubmission.ocr_text}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-white rounded-3xl p-8 border-2 border-gray-100 shadow-xl shadow-black/5 space-y-6">
                        <h5 className="font-black text-[#151313] uppercase tracking-widest text-[10px] flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          Final Evaluation
                        </h5>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 ml-1">
                              Grade / Points
                            </label>
                            <Input
                              value={grade}
                              onChange={(e) =>
                                setGrade(e.target.value)
                              }
                              placeholder="e.g. 95/100"
                              className="h-12 rounded-xl focus:ring-[#D8C4FB]"
                            />
                          </div>
                          <div className="flex items-end">
                            <p className="text-xs text-gray-400 font-medium pb-3 ml-2 italic">
                              Max Points for this:{' '}
                              {
                                selectedAssignmentForGrading?.points
                              }
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 ml-1">
                            Teacher's Private Feedback
                          </label>
                          <textarea
                            className="w-full h-32 rounded-2xl border border-gray-200 p-4 text-sm focus:ring-2 focus:ring-[#D8C4FB] focus:border-transparent transition-all outline-none"
                            value={feedback}
                            onChange={(e) =>
                              setFeedback(e.target.value)
                            }
                            placeholder="Great job on the analysis! Focus more on the introduction next time..."
                          />
                        </div>

                        <Button
                          onClick={handleGradeSubmission}
                          disabled={submittingGrade}
                          className="w-full bg-[#151313] text-white h-14 rounded-2xl font-bold text-lg hover:scale-[0.98] transition-all shadow-xl shadow-black/10"
                        >
                          {submittingGrade ? (
                            <Loader2 className="animate-spin mr-2" />
                          ) : (
                            'Confirm Grade & Return to Student'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-gray-200">
                      <Users className="w-10 h-10 opacity-20" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-400">
                      Ready to Review
                    </h3>
                    <p className="text-sm font-medium mt-1">
                      Select a student from the left to
                      start grading
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Attempts Modal */}
      {showAttemptsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <CardHeader className="bg-purple-50 border-b border-purple-100 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-5 h-5 text-[#D8C4FB]" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#D8C4FB]">
                      Detailed Assessment
                    </span>
                  </div>
                  <CardTitle className="text-2xl font-black text-[#151313]">
                    Test Performance Tracker
                  </CardTitle>
                  <p className="text-sm font-medium text-gray-500 mt-1">
                    {selectedTestForGrading?.title}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setShowAttemptsModal(false)
                  }
                  className="p-2 hover:bg-purple-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-8 overflow-y-auto bg-white">
              {loadingSubmissions ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-[#D8C4FB] w-10 h-10" />
                </div>
              ) : attempts.length === 0 ? (
                <div className="text-center py-20 px-10">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-gray-300" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    Wait for Submissions
                  </h4>
                  <p className="text-gray-400 font-medium">
                    No students have completed this
                    assessment yet. Remind them about the
                    deadline!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {attempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 hover:border-[#D8C4FB] hover:shadow-xl hover:shadow-purple-500/5 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 flex items-center justify-center font-black text-[#151313] text-xl shadow-sm group-hover:scale-110 transition-transform">
                          {attempt.student.full_name.charAt(
                            0
                          )}
                        </div>
                        <div>
                          <p className="font-black text-[#151313] text-lg">
                            {attempt.student.full_name}
                          </p>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                            {new Date(
                              attempt.completed_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-[#151313]">
                          {attempt.score}%
                        </p>
                        <Badge
                          className={cn(
                            'bg-white border-none text-[10px] uppercase font-black shadow-sm px-3 rounded-full mt-1',
                            attempt.score >= 80
                              ? 'text-green-500 ring-1 ring-green-100'
                              : attempt.score >= 50
                                ? 'text-orange-500 ring-1 ring-orange-100'
                                : 'text-red-500 ring-1 ring-red-100'
                          )}
                        >
                          {attempt.score >= 50
                            ? 'Passed'
                            : 'Review Needed'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {/* Create Classroom Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <CardHeader className="bg-[#D8C4FB] text-[#151313] p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-black">
                  New Classroom
                </CardTitle>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6 bg-white">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Class Name
                </label>
                <Input
                  value={newClassName}
                  onChange={(e) =>
                    setNewClassName(e.target.value)
                  }
                  placeholder="e.g. Physics Group A"
                  className="h-12 rounded-xl focus:ring-[#D8C4FB] font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Description
                </label>
                <Input
                  value={newClassDescription}
                  onChange={(e) =>
                    setNewClassDescription(e.target.value)
                  }
                  placeholder="Curriculum overview"
                  className="h-12 rounded-xl focus:ring-[#D8C4FB] font-bold"
                />
              </div>
              <Button
                onClick={handleCreateClassroom}
                disabled={creating}
                className="w-full bg-[#151313] text-white h-14 rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-xl shadow-black/10"
              >
                {creating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  'Create Classroom'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
