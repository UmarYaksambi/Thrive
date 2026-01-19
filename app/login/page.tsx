'use client';

import { login, signup } from "./actions";
import { Anton } from "next/font/google";
import { Input } from '@/components/ui/input';
import { useState } from "react";
import { cn } from "@/lib/utils";
import { GraduationCap, BookOpen, User } from "lucide-react";

const anton = Anton({ subsets: ['latin'], weight: '400' });

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
    const [role, setRole] = useState<'student' | 'teacher'>('student');
    const [isLoginModel, setIsLoginModel] = useState(true);

    return (
        <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center p-6 transition-colors duration-500">
            <div className="w-full max-w-md bg-white rounded-[2rem] p-10 shadow-2xl border border-gray-100 relative overflow-hidden">

                {/* Decorative Background Element */}
                <div className={cn(
                    "absolute top-0 left-0 w-full h-2 bg-gradient-to-r",
                    role === 'teacher' ? "from-[#fccc42] to-[#ffaa00]" : "from-[#D8C4FB] to-[#a78bfa]"
                )} />

                <div className="text-center mb-8">
                    <h1 className={`${anton.className} text-5xl mb-2`}>
                        <span className="text-[#D8C4FB]">Th</span>
                        <span className="text-[#151313]">rive</span>
                    </h1>
                    <p className="text-gray-500 font-medium">
                        {isLoginModel ? "Welcome back to learning" : "Join our learning community"}
                    </p>
                </div>

                {/* Role Switcher */}
                <div className="flex p-1 bg-gray-100 rounded-full mb-8 relative">
                    <div className={cn(
                        "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-spring",
                        role === 'teacher' ? "translate-x-[calc(100%+4px)]" : "translate-x-0"
                    )} />
                    <button
                        onClick={() => setRole('student')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold z-10 transition-colors",
                            role === 'student' ? "text-[#151313]" : "text-gray-500 hover:text-gray-700"
                        )}
                        type="button"
                    >
                        <User className="w-4 h-4" /> Student
                    </button>
                    <button
                        onClick={() => setRole('teacher')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold z-10 transition-colors",
                            role === 'teacher' ? "text-[#151313]" : "text-gray-500 hover:text-gray-700"
                        )}
                        type="button"
                    >
                        <GraduationCap className="w-4 h-4" /> Teacher
                    </button>
                </div>

                {/* Main Error Display */}
                {searchParams.error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 font-semibold border border-red-100 animate-in fade-in slide-in-from-top-2">
                        {searchParams.error}
                    </div>
                )}

                <form className="space-y-5">
                    <input type="hidden" name="role" value={role} />

                    {/* Full Name - Only for Signup */}
                    <div className={cn(
                        "transition-all duration-300 overflow-hidden",
                        isLoginModel ? "max-h-0 opacity-0" : "max-h-24 opacity-100"
                    )}>
                        <label className="block text-sm font-bold text-[#151313] mb-2 ml-4">
                            Full Name
                        </label>
                        <input
                            name="fullName"
                            type="text"
                            disabled={isLoginModel} // Prevent submitting when hidden
                            className="w-full px-6 py-4 rounded-full border-2 border-gray-100 focus:border-[#D8C4FB] outline-none transition-all placeholder:text-gray-300"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#151313] mb-2 ml-4">
                            Email Address
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full px-6 py-4 rounded-full border-2 border-gray-100 focus:border-[#D8C4FB] outline-none transition-all placeholder:text-gray-300"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#151313] mb-2 ml-4">Password</label>
                        <Input
                            name="password"
                            type="password"
                            showPasswordToggle
                            required
                            className="w-full px-6 py-4 rounded-full border-2 border-gray-100 focus:border-[#D8C4FB] outline-none transition-all"
                        />
                    </div>

                    {/* Invite Code - Only for Teacher Signup */}
                    <div className={cn(
                        "transition-all duration-300 overflow-hidden",
                        (role === 'teacher' && !isLoginModel) ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
                    )}>
                        <label className="block text-sm font-bold text-[#151313] mb-2 ml-4 text-amber-600 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" /> Teacher Invite Code
                        </label>
                        <input
                            name="inviteCode"
                            type="password"
                            disabled={role !== 'teacher' || isLoginModel}
                            className="w-full px-6 py-4 rounded-full border-2 border-amber-200 focus:border-amber-400 bg-amber-50/50 outline-none transition-all placeholder:text-amber-300"
                            placeholder="Enter code provided by admin"
                        />
                    </div>

                    <div className="flex flex-col gap-4 pt-6">
                        {isLoginModel ? (
                            <>
                                <button
                                    formAction={login}
                                    className="w-full py-4 bg-[#151313] text-white font-bold rounded-full hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95 shadow-lg flex items-center justify-center gap-2"
                                >
                                    Sign In as {role === 'teacher' ? 'Teacher' : 'Student'}
                                </button>
                                <p className="text-center text-gray-500 text-sm">
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => setIsLoginModel(false)}
                                        className="text-[#151313] font-bold hover:underline"
                                    >
                                        Create one
                                    </button>
                                </p>
                            </>
                        ) : (
                            <>
                                <button
                                    formAction={signup}
                                    className={cn(
                                        "w-full py-4 font-bold rounded-full transition-all hover:scale-[1.02] active:scale-95 shadow-lg",
                                        role === 'teacher'
                                            ? "bg-[#fccc42] text-[#151313] hover:bg-[#eebb2d]"
                                            : "bg-[#D8C4FB] text-[#151313] hover:bg-[#c2aafb]"
                                    )}
                                >
                                    Create {role === 'teacher' ? 'Teacher' : 'Student'} Account
                                </button>
                                <p className="text-center text-gray-500 text-sm">
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => setIsLoginModel(true)}
                                        className="text-[#151313] font-bold hover:underline"
                                    >
                                        Sign in
                                    </button>
                                </p>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}