'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Anton } from 'next/font/google';
import { Input } from '@/components/ui/input';

const anton = Anton({ subsets: ['latin'], weight: '400' });

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(searchParams.get('error'));

  const redirectTo = searchParams.get('redirectTo') || '/admin';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to sign in');
      }

      router.push(redirectTo);
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-10 shadow-2xl border border-gray-100">
        <div className="text-center mb-10">
          <h1 className={`${anton.className} text-5xl mb-2`}>
            <span className="text-[#D8C4FB]">Th</span>
            <span className="text-[#151313]">rive</span>
          </h1>
          <p className="text-gray-500 font-medium">Admin access</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 font-semibold border border-red-100">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-bold text-[#151313] mb-2 ml-4">Email Address</label>
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-full border-2 border-gray-100 focus:border-[#D8C4FB] outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#151313] text-white font-bold rounded-full hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <Link
              href="/admin/signup"
              className="w-full py-4 bg-[#D8C4FB] text-[#151313] font-bold rounded-full hover:bg-[#c2aafb] transition-all hover:scale-[1.02] active:scale-95 text-center"
            >
              Create Admin Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
