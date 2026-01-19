'use client';;
import { use } from "react";

import Link from 'next/link';
import { Anton } from 'next/font/google';
import { Input } from '@/components/ui/input';
import { Shield } from 'lucide-react';
import { adminLogin } from './actions';
import { useSearchParams } from 'next/navigation';

const anton = Anton({ subsets: ['latin'], weight: '400' });

export default function AdminLoginPage(
  props: {
    searchParams: Promise<{ error?: string }>;
  }
) {
  const searchParams = use(props.searchParams);
  return (
    <div className="min-h-screen bg-[#151313] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-10 shadow-2xl border border-gray-100 relative overflow-hidden">

        {/* Red admin stripe */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-700" />

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className={`${anton.className} text-4xl mb-2`}>
            <span className="text-red-500">Admin</span>
            <span className="text-[#151313]"> Login</span>
          </h1>
          <p className="text-gray-500 font-medium">
            Secure access for administrators
          </p>
        </div>

        {searchParams?.error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 font-semibold border border-red-100 animate-in fade-in slide-in-from-top-2">
            {searchParams.error}
          </div>
        )}

        <form action={adminLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#151313] mb-2 ml-4">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-6 py-4 rounded-full border-2 border-gray-100 focus:border-red-400 outline-none transition-all placeholder:text-gray-300"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#151313] mb-2 ml-4">
              Password
            </label>
            <Input
              name="password"
              type="password"
              showPasswordToggle
              required
              className="w-full px-6 py-4 rounded-full border-2 border-gray-100 focus:border-red-400 outline-none transition-all"
            />
          </div>

          <div className="pt-6">
            <button
              type="submit"
              className="w-full py-4 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
            >
              Sign In to Dashboard
            </button>
          </div>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Need an account?{' '}
          <Link href="/admin/signup" className="text-[#151313] font-bold hover:underline">
            Use Invite Code
          </Link>
        </p>
      </div>
    </div>
  );
}
