'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, BookOpen, Check } from 'lucide-react';
import Link from 'next/link';

interface Membership {
  id: string;
  classroom: {
    id: string;
    name: string;
    description: string | null;
  };
}

interface JoinClassroomProps {
  userId: string;
  existingMemberships: Membership[];
}

export function JoinClassroom({
  userId,
  existingMemberships,
}: JoinClassroomProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [memberships, setMemberships] = useState(
    existingMemberships
  );

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      setMessage({
        type: 'error',
        text: 'Please enter an invite code',
      });
      return;
    }

    setJoining(true);
    setMessage(null);

    try {
      const response = await fetch('/api/classrooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode: inviteCode.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: result.message,
        });
        setInviteCode('');
        // Refresh page to show new classroom
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      console.error('Error joining:', error);
      setMessage({
        type: 'error',
        text: 'Failed to join classroom',
      });
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          My Classrooms
        </h1>
        <p className="text-gray-500">
          Join classrooms and access course materials
        </p>
      </div>

      {/* Join Classroom Card */}
      <Card className="border-2 border-dashed border-[#D8C4FB]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D8C4FB]" />
            Join a Classroom
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-4">
            Enter the invite code provided by your teacher
            to join their classroom.
          </p>

          <div className="flex gap-3">
            <Input
              value={inviteCode}
              onChange={(e) =>
                setInviteCode(e.target.value.toUpperCase())
              }
              placeholder="Enter 6-character code (e.g., ABC123)"
              maxLength={6}
              className="font-mono text-lg tracking-widest uppercase"
            />
            <Button
              onClick={handleJoin}
              disabled={joining || !inviteCode.trim()}
              className="bg-[#D8C4FB] hover:bg-[#C2AAFB] text-[#151313] shrink-0"
            >
              {joining ? 'Joining...' : 'Join'}
            </Button>
          </div>

          {message && (
            <div
              className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {message.type === 'success' && (
                <Check className="w-4 h-4" />
              )}
              {message.text}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enrolled Classrooms */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Enrolled Classrooms ({memberships.length})
        </h2>

        {memberships.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="py-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                You haven't joined any classrooms yet
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Ask your teacher for an invite code
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memberships.map((membership) => (
              <Link
                key={membership.id}
                href={`/dashboard/classrooms/${membership.classroom?.id}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow hover:border-[#D8C4FB] cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#D8C4FB] flex items-center justify-center shrink-0">
                        <BookOpen className="w-6 h-6 text-[#151313]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {membership.classroom?.name ||
                            'Unknown Classroom'}
                        </h3>
                        {membership.classroom
                          ?.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {
                              membership.classroom
                                .description
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
