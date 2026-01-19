'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  Brain,
  Users,
  Award,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Anton } from 'next/font/google';

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
});

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const handleOffline = () => {
      router.push('/downloads');
    };

    if (
      typeof navigator !== 'undefined' &&
      !navigator.onLine
    ) {
      handleOffline();
    }

    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  return (
    <div className="min-h-screen from-[#f7f7f5] via-[#fef9f3] to-[#f5f3fe] bg-[linear-gradient(90deg,#e5d6ff40_1px,transparent_1px),linear-gradient(#e5d6ff40_1px,transparent_1px)] bg-[size:34px_34px] overflow-hidden">
<<<<<<< HEAD
      <style dangerouslySetInnerHTML={{
        __html: `
=======
      <style
        dangerouslySetInnerHTML={{
          __html: `
>>>>>>> origin/main
        @keyframes rocketFly {
          0% {
            transform: translate(0, 400px) rotate(0deg) scale(0.5);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translate(0, 0) rotate(720deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes drawTrail {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes floatStar {
          0% {
            transform: translateY(100px) rotate(0deg) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
            transform: translateY(0) rotate(180deg) scale(1.2);
          }
          100% {
            transform: translateY(-20px) rotate(360deg) scale(1);
            opacity: 0.8;
          }
        }

        @keyframes floatIn {
          0% {
            transform: translateY(80px) rotate(-20deg) scale(0.5);
            opacity: 0;
          }
          60% {
            transform: translateY(-10px) rotate(5deg) scale(1.1);
          }
          100% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(60px) rotate(0deg);
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: rotate(360deg) translateX(60px) rotate(-360deg);
            opacity: 0.4;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes zigzag {
          0% {
            transform: translate(0, 100px) scale(0);
            opacity: 0;
          }
          25% {
            transform: translate(-30px, 60px) scale(0.7);
            opacity: 0.7;
          }
          50% {
            transform: translate(20px, 30px) scale(1);
            opacity: 1;
          }
          75% {
            transform: translate(-15px, 10px) scale(1.1);
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
        }

        @keyframes sparkle {
          0%, 100% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 1;
          }
        }

        @keyframes bounceIn {
          0% {
            transform: scale(0) translateY(100px);
            opacity: 0;
          }
          60% {
            transform: scale(1.2) translateY(-20px);
            opacity: 1;
          }
          80% {
            transform: scale(0.9) translateY(10px);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes morph {
          0%, 100% {
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          }
          50% {
            border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%;
          }
        }

        .rocket-container {
          position: absolute;
          left: -30%;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        .rocket {
          position: absolute;
          left: 70px;
          top: 0;
          animation: rocketFly 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          z-index: 2;
          filter: drop-shadow(0 4px 12px rgba(216, 196, 251, 0.6));
        }

        .trail {
          position: absolute;
          left: 0;
          top: -50px;
          z-index: 1;
        }

        .trail path {
          animation: drawTrail 2.5s ease-out forwards;
        }

        .trail path:nth-child(2) {
          animation-delay: 0.15s;
        }

        .star {
          position: absolute;
          font-size: 2.5rem;
          animation: floatStar 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
        }

        .star-1 {
          left: 20%;
          top: 25%;
          animation-delay: 0.8s;
        }

        .star-2 {
          left: 70%;
          top: 25%;
          animation-delay: 1.2s;
        }

        .star-3 {
          left: 65%;
          top: 55%;
          animation-delay: 1.6s;
        }

        .star-4 {
          left: 25%;
          top: 55%;
          animation-delay: 2s;
          font-size: 1.8rem;
        }

        .float-item {
          position: absolute;
          animation: floatIn 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
        }

        .float-item-alt {
          animation: zigzag 2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .float-item-bounce {
          animation: bounceIn 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .book-1 {
          right: 15%;
          top: 80%;
          animation-delay: 0.4s;
        }

        .lightbulb {
          right: 50%;
          top: 37%;
          animation-delay: 1s;
        }

        .certificate {
          right: 25%;
          top: 70%;
          animation-delay: 1.6s;
        }

        .brain-icon {
          right: 0%;
          top: 40%;
          animation-delay: 0.7s;
        }

        .pencil {
          right: 10%;
          top: 35%;
          animation-delay: 1.3s;
        }

        .orbit-container {
          position: absolute;
          right: 40%;
          top: 30%;
          width: 120px;
          height: 120px;
        }

        .orbit-dot {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #FF5734;
          left: 50%;
          top: 50%;
          margin: -5px 0 0 -5px;
          box-shadow: 0 0 15px currentColor;
        }

        .dot-1 {
          animation: orbit 4s linear infinite;
          animation-delay: 2s;
          background: #D8C4FB;
        }

        .dot-2 {
          animation: orbit 4s linear infinite;
          animation-delay: 2.5s;
          background: #FF5734;
        }

        .dot-3 {
          animation: orbit 4s linear infinite;
          animation-delay: 3s;
          background: #FFE5B4;
        }

        .dot-4 {
          animation: orbit 4s linear infinite reverse;
          animation-delay: 2.2s;
          background: #C2AAFB;
        }

        .pulse-ring {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid #D8C4FB;
          animation: pulse 2s ease-out infinite;
        }

        .pulse-ring-1 {
          left: 40%;
          top: 75%;
          animation-delay: 2.5s;
        }

        .pulse-ring-2 {
          left: 40%;
          top: 75%;
          animation-delay: 3s;
        }

        .float-gentle {
          animation: float 3s ease-in-out infinite;
        }

        .float-gentle-delayed {
          animation: float 3s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        .sparkle-item {
          position: absolute;
          font-size: 1.5rem;
          animation: sparkle 2s ease-in-out forwards;
        }

        .sparkle-1 {
          left: 10%;
          top: 10%;
          animation-delay: 1.8s;
        }

        .sparkle-2 {
          left: 80%;
          top: 50%;
          animation-delay: 2.2s;
        }

        .sparkle-3 {
          right: 15%;
          top: 80%;
          animation-delay: 2.6s;
        }

        .morph-blob {
          position: absolute;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #D8C4FB 0%, #C2AAFB 100%);
          opacity: 0.15;
          animation: morph 8s ease-in-out infinite, float 6s ease-in-out infinite;
        }

        .blob-1 {
          left: 10%;
          top: 25%;
          animation-delay: 0s, 0s;
        }

        .blob-2 {
          right: 0%;
          top: 70%;
          animation-delay: 2s, 1s;
        }
      `,
        }}
      />

      <nav className="p-6 flex items-center justify-between max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold">
          <span className="text-[#D8C4FB]">Th</span>
          <span className="text-[#151313]">rive</span>
        </h1>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-6 py-2.5 text-[#151313] font-semibold hover:text-[#C2AAFB] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 bg-[#D8C4FB] text-[#151313] font-semibold rounded-full hover:bg-[#C2AAFB] transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16 relative">
          {/* Left side animation */}
          <div className="absolute left-0 top-0 w-64 h-full pointer-events-none hidden lg:block">
            {/* Morphing blobs */}
            <div className="morph-blob blob-1"></div>

            {/* Rocket with spiral trail */}
            <div className="rocket-container">
<<<<<<< HEAD
              <svg className="rocket" width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30 5L35 20L30 15L25 20L30 5Z" fill="#FF5734" />
                <ellipse cx="30" cy="25" rx="8" ry="12" fill="#D8C4FB" />
                <circle cx="30" cy="22" r="3" fill="#151313" />
                <path d="M22 30L18 40L22 35L22 30Z" fill="#C2AAFB" />
                <path d="M38 30L42 40L38 35L38 30Z" fill="#C2AAFB" />
                <rect x="27" y="35" width="6" height="8" rx="1" fill="#151313" />
              </svg>
              <svg className="trail" width="200" height="400" viewBox="0 0 200 400">
=======
              <svg
                className="rocket"
                width="60"
                height="60"
                viewBox="0 0 60 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M30 5L35 20L30 15L25 20L30 5Z"
                  fill="#FF5734"
                />
                <ellipse
                  cx="30"
                  cy="25"
                  rx="8"
                  ry="12"
                  fill="#D8C4FB"
                />
                <circle
                  cx="30"
                  cy="22"
                  r="3"
                  fill="#151313"
                />
                <path
                  d="M22 30L18 40L22 35L22 30Z"
                  fill="#C2AAFB"
                />
                <path
                  d="M38 30L42 40L38 35L38 30Z"
                  fill="#C2AAFB"
                />
                <rect
                  x="27"
                  y="35"
                  width="6"
                  height="8"
                  rx="1"
                  fill="#151313"
                />
              </svg>
              <svg
                className="trail"
                width="200"
                height="400"
                viewBox="0 0 200 400"
              >
>>>>>>> origin/main
                <path
                  d="M100,350 Q80,300 100,250 T100,150 T100,50"
                  stroke="#D8C4FB"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="1000"
                  strokeDashoffset="1000"
                  opacity="0.7"
                  strokeLinecap="round"
                />
                <path
                  d="M100,350 Q120,300 100,250 T100,150 T100,50"
                  stroke="#FF5734"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="1000"
                  strokeDashoffset="1000"
                  opacity="0.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Enhanced floating stars/sparkles */}
            <div className="pulse-ring pulse-ring-1"></div>
            <div className="pulse-ring pulse-ring-2"></div>
            <div className="star star-1">⭐</div>
            <div className="star star-2">✨</div>
            <div className="star star-3">💫</div>
            <div className="star star-4">🌟</div>

            {/* Pencil */}
            <div className="float-item-alt pencil">
              <div className="text-4xl float-gentle">
                ✏️
              </div>
            </div>

            {/* Sparkle effects */}
            <div className="sparkle-item sparkle-1">✦</div>
          </div>

          {/* Right side animation */}
          <div className="absolute right-0 top-0 w-64 h-full pointer-events-none hidden lg:block">
            {/* Morphing blob */}
            <div className="morph-blob blob-2"></div>

            {/* Floating book icon */}
            <div className="float-item book-1">
<<<<<<< HEAD
              <div className="text-5xl float-gentle">📖</div>
            </div>


            {/* Brain icon */}
            <div className="relative">
              <div className="absolute right-[15%] top-[70%] float-item-alt brain-icon">
                <div className="text-5xl float-gentle-delayed">🧠</div>
              </div>
            </div>


            {/* Lightbulb with glow */}
            <div className="float-item lightbulb">
              <div className="text-6xl float-gentle" style={{ filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))' }}>💡</div>
=======
              <div className="text-5xl float-gentle">
                📖
              </div>
            </div>

            {/* Brain icon */}
            <div className="relative">
              <div className="absolute right-[15%] top-[70%] float-item-alt brain-icon">
                <div className="text-5xl float-gentle-delayed">
                  🧠
                </div>
              </div>
            </div>

            {/* Lightbulb with glow */}
            <div className="float-item lightbulb">
              <div
                className="text-6xl float-gentle"
                style={{
                  filter:
                    'drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))',
                }}
              >
                💡
              </div>
>>>>>>> origin/main
            </div>

            {/* Certificate with bounce */}
            <div className="float-item-bounce certificate">
              <div className="w-20 h-14 bg-gradient-to-br from-[#FFE5B4] to-[#FFD700] rounded-lg shadow-xl border-3 border-[#FF5734] flex items-center justify-center float-gentle relative">
                <div className="text-3xl">🏆</div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#FF5734] rounded-full flex items-center justify-center text-white text-xs font-bold">
                  ★
                </div>
              </div>
            </div>

            {/* Enhanced orbiting dots with pulse rings */}
            <div className="orbit-container">
              <div className="orbit-dot dot-1"></div>
              <div className="orbit-dot dot-2"></div>
              <div className="orbit-dot dot-3"></div>
              <div className="orbit-dot dot-4"></div>
            </div>

            {/* Additional sparkles */}
            <div className="sparkle-item sparkle-2">✦</div>
            <div className="sparkle-item sparkle-3">✦</div>
          </div>

          <h2
            className={`${anton.className} text-6xl font-bold text-[#151313] mb-6 leading-tight`}
          >
            Your Personalized
            <br />
            <span className="text-[#D8C4FB] text-8xl tracking-[-0.04em] leading-none">
              Learning Journey
            </span>
            <br />
            Starts Here
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Master any skill with AI-powered personalized
            learning paths, expert-led courses, and
            real-time progress tracking.
          </p>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <Input
                placeholder="What do you want to learn today?"
                className="pl-16 h-16 rounded-full border-2 border-gray-200 focus:border-[#C2AAFB] bg-white text-lg shadow-lg"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3 bg-[#D8C4FB] text-[#151313] font-semibold rounded-full hover:bg-[#C2AAFB] transition-colors">
                Search
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="text-gray-500 font-medium">
              Popular:
            </span>
            {[
              'React.js',
              'Python',
              'UI/UX Design',
              'Public Speaking',
              'Data Science',
            ].map((topic) => (
              <button
                key={topic}
                className="px-6 py-2 bg-white border-2 border-gray-200 rounded-full font-semibold text-[#151313] hover:border-[#ff5734] hover:text-[#ff5734] transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            {
              icon: Brain,
              title: 'AI-Powered Learning',
              description:
                'Get personalized learning paths tailored to your goals and pace',
              color: 'learnify-purple',
            },
            {
              icon: BookOpen,
              title: 'Expert-Led Courses',
              description:
                'Learn from industry professionals with real-world experience',
              color: 'learnify-yellow',
            },
            {
              icon: Users,
              title: 'Community Support',
              description:
                'Join thousands of learners and grow together',
              color: 'learnify-blue',
            },
            {
              icon: Award,
              title: 'Track Progress',
              description:
                'Monitor your achievements and stay motivated',
              color: 'learnify-coral',
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`${feature.color} learnify-card p-8 hover:scale-105 transition-transform`}
              >
                <div className="w-16 h-16 bg-[#151313] rounded-2xl flex items-center justify-center mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#151313] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#151313]/80">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <h3 className="text-4xl font-bold text-[#151313] mb-6">
            Ready to Transform Your Learning?
          </h3>
          <Link
            href="/dashboard"
            className="inline-block px-12 py-4 bg-[#D8C4FB] text-[#151313] text-xl font-bold rounded-full hover:bg-[#C2AAFB] transition-colors shadow-lg hover:shadow-xl"
          >
            Start Learning Now
          </Link>
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
<<<<<<< HEAD
          <p>&copy; 2025 Thrive. Empowering learners worldwide.</p>
          <Link
            href="/admin/signup"
            className="mt-4 inline-block text-sm text-gray-400 hover:text-[#D8C4FB] transition-colors"
          >
            Admin Access →
          </Link>
=======
          <p>
            &copy; 2025 Thrive. Empowering learners
            worldwide.
          </p>
>>>>>>> origin/main
        </div>
      </footer>
    </div>
  );
}
