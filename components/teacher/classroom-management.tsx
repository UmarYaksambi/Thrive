'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  UserMinus
} from 'lucide-react';

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

interface ClassroomManagementProps {
  userId: string;
}

export function ClassroomManagement({ userId }: ClassroomManagementProps) {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teacher/classrooms');
      const result = await response.json();

      if (response.ok) {
        setClassrooms(result.classrooms || []);
      } else {
        console.error('Failed to fetch classrooms:', result.error);
      }
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (classroomId: string) => {
    try {
      const response = await fetch(`/api/teacher/classrooms/${classroomId}`);
      const result = await response.json();

      if (response.ok) {
        setMembers(result.members || []);
      } else {
        console.error('Failed to fetch members:', result.error);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleSelectClassroom = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    fetchMembers(classroom.id);
  };

  const handleCreateClassroom = async () => {
    if (!newClassName.trim()) {
      alert('Please enter a classroom name');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/teacher/classrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClassName,
          description: newClassDescription,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        setNewClassName('');
        setNewClassDescription('');
        fetchClassrooms();
        alert('Classroom created successfully!');
      } else {
        alert(result.error || 'Failed to create classroom');
      }
    } catch (error) {
      console.error('Error creating classroom:', error);
      alert('Failed to create classroom');
    } finally {
      setCreating(false);
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

  const handleRegenerateCode = async (classroomId: string) => {
    if (!confirm('Are you sure? Students with the old code will need the new one.')) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/classrooms/${classroomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerateCode: true }),
      });

      const result = await response.json();

      if (response.ok) {
        fetchClassrooms();
        if (selectedClassroom?.id === classroomId) {
          setSelectedClassroom(result.classroom);
        }
      } else {
        alert(result.error || 'Failed to regenerate code');
      }
    } catch (error) {
      console.error('Error regenerating code:', error);
    }
  };

  const handleDeleteClassroom = async (classroomId: string) => {
    if (!confirm('Delete this classroom? All students will be removed.')) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/classrooms/${classroomId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSelectedClassroom(null);
        setMembers([]);
        fetchClassrooms();
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to delete classroom');
      }
    } catch (error) {
      console.error('Error deleting classroom:', error);
    }
  };

  const handleRemoveStudent = async (studentUserId: string) => {
    if (!selectedClassroom) return;
    if (!confirm('Remove this student from the classroom?')) return;

    try {
      const response = await fetch(`/api/teacher/classrooms/${selectedClassroom.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: studentUserId }),
      });

      if (response.ok) {
        fetchMembers(selectedClassroom.id);
        fetchClassrooms(); // Update count
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to remove student');
      }
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Classrooms</h1>
          <p className="text-gray-500">Manage your classrooms and students</p>
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
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : classrooms.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No classrooms yet</p>
                <Button
                  variant="link"
                  onClick={() => setShowCreateModal(true)}
                  className="mt-2"
                >
                  Create your first classroom
                </Button>
              </CardContent>
            </Card>
          ) : (
            classrooms.map((classroom) => (
              <Card
                key={classroom.id}
                className={`cursor-pointer transition-all hover:shadow-md ${selectedClassroom?.id === classroom.id
                    ? 'ring-2 ring-[#D8C4FB] bg-purple-50'
                    : ''
                  }`}
                onClick={() => handleSelectClassroom(classroom)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{classroom.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Users className="w-4 h-4" />
                        {classroom.studentCount} student{classroom.studentCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Classroom Details */}
        <div className="lg:col-span-2">
          {selectedClassroom ? (
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedClassroom.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClassroom(selectedClassroom.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {selectedClassroom.description && (
                  <p className="text-gray-500 text-sm">{selectedClassroom.description}</p>
                )}
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Invite Code Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Invite Code</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white border-2 border-dashed border-gray-300 rounded-lg px-4 py-3">
                      <span className="font-mono text-2xl font-bold tracking-widest text-[#151313]">
                        {selectedClassroom.invite_code}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleCopyCode(selectedClassroom.invite_code)}
                      className="shrink-0"
                    >
                      {copiedCode === selectedClassroom.invite_code ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRegenerateCode(selectedClassroom.id)}
                      className="shrink-0"
                      title="Generate new code"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Share this code with students so they can join your classroom
                  </p>
                </div>

                {/* Students List */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">
                    Students ({members.length})
                  </h4>
                  {members.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No students yet</p>
                      <p className="text-sm">Share the invite code to get students</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#D8C4FB] flex items-center justify-center text-[#151313] font-semibold">
                              {member.profile?.full_name?.charAt(0) || member.profile?.email?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {member.profile?.full_name || 'Unknown Student'}
                              </p>
                              <p className="text-sm text-gray-500">{member.profile?.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {member.role}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveStudent(member.user_id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500">Select a classroom to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Classroom Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create New Classroom</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classroom Name *
                </label>
                <Input
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g., Math 101 - Fall 2026"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <Input
                  value={newClassDescription}
                  onChange={(e) => setNewClassDescription(e.target.value)}
                  placeholder="Brief description of the classroom"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateClassroom}
                disabled={creating || !newClassName.trim()}
                className="bg-[#D8C4FB] hover:bg-[#C2AAFB] text-[#151313]"
              >
                {creating ? 'Creating...' : 'Create Classroom'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
