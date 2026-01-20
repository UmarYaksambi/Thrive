'use client';

import { login, signup } from './actions';
import { Anton } from 'next/font/google';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  GraduationCap,
  BookOpen,
  User,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const anton = Anton({ subsets: ['latin'], weight: '400' });

export default function LoginClient() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const [role, setRole] = useState<'student' | 'teacher'>(
    'student'
  );
  const [isLoginModel, setIsLoginModel] = useState(true);

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-10 shadow-2xl border border-gray-100 relative overflow-hidden">
        <div
          className={cn(
            'absolute top-0 left-0 w-full h-2 bg-gradient-to-r',
            role === 'teacher'
              ? 'from-[#fccc42] to-[#ffaa00]'
              : 'from-[#D8C4FB] to-[#a78bfa]'
          )}
        />

        <div className="text-center mb-8">
          <h1
            className={`${anton.className} text-5xl mb-2`}
          >
            <span className="text-[#D8C4FB]">Th</span>
            <span className="text-[#151313]">rive</span>
          </h1>
          <p className="text-gray-500 font-medium">
            {isLoginModel
              ? 'Welcome back to learning'
              : 'Join our learning community'}
          </p>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-full mb-8 relative">
          <div
            className={cn(
              'absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-all',
              role === 'teacher'
                ? 'translate-x-[calc(100%+4px)]'
                : 'translate-x-0'
            )}
          />
          <button
            type="button"
            onClick={() => setRole('student')}
            className={cn(
              'flex-1 py-3 font-bold z-10',
              role === 'student'
                ? 'text-[#151313]'
                : 'text-gray-500'
            )}
          >
            <User className="inline w-4 h-4 mr-2" />
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={cn(
              'flex-1 py-3 font-bold z-10',
              role === 'teacher'
                ? 'text-[#151313]'
                : 'text-gray-500'
            )}
          >
            <GraduationCap className="inline w-4 h-4 mr-2" />
            Teacher
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 font-semibold border border-red-100">
            {error}
          </div>
        )}

        <form className="space-y-5">
          <input type="hidden" name="role" value={role} />

          {!isLoginModel && (
            <input
              name="fullName"
              placeholder="Full Name"
              className="w-full px-6 py-4 rounded-full border-2 border-gray-100"
            />
          )}

          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full px-6 py-4 rounded-full border-2 border-gray-100"
          />

          <Input
            name="password"
            type="password"
            showPasswordToggle
            required
            className="w-full px-6 py-4 rounded-full border-2 border-gray-100"
          />

          {role === 'teacher' && !isLoginModel && (
            <input
              name="inviteCode"
              placeholder="Invite Code"
              className="w-full px-6 py-4 rounded-full border-2 border-amber-200 bg-amber-50"
            />
          )}

          {isLoginModel ? (
            <button
              formAction={login}
              className="w-full py-4 bg-[#151313] text-white font-bold rounded-full"
            >
              Sign In
            </button>
          ) : (
            <button
              formAction={signup}
              className="w-full py-4 bg-[#D8C4FB] font-bold rounded-full"
            >
              Create Account
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsLoginModel(!isLoginModel)}
            className="w-full text-sm font-bold text-gray-600"
          >
            {isLoginModel
              ? 'Create an account'
              : 'Already have an account?'}
          </button>

          <div className="pt-4 border-t border-gray-100 mt-4 text-center">
            <a
              href="/admin/login"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Administrator Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
