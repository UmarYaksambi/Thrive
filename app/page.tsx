import Link from 'next/link';
import { Search, BookOpen, Brain, Users, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f7f5] via-[#fef9f3] to-[#f5f3fe]">
      <nav className="p-6 flex items-center justify-between max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold">
          <span className="text-[#ff5734]">Learn</span>
          <span className="text-[#151313]">ify</span>
        </h1>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="px-6 py-2.5 text-[#151313] font-semibold hover:text-[#ff5734] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 bg-[#ff5734] text-white font-semibold rounded-full hover:bg-[#e64d2d] transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-6xl font-bold text-[#151313] mb-6 leading-tight">
            Your Personalized
            <br />
            <span className="text-[#ff5734]">Learning Journey</span>
            <br />
            Starts Here
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Master any skill with AI-powered personalized learning paths, expert-led courses, and real-time progress tracking.
          </p>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <Input
                placeholder="What do you want to learn today?"
                className="pl-16 h-16 rounded-full border-2 border-gray-200 focus:border-[#ff5734] bg-white text-lg shadow-lg"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3 bg-[#ff5734] text-white font-semibold rounded-full hover:bg-[#e64d2d] transition-colors">
                Search
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="text-gray-500 font-medium">Popular:</span>
            {['React.js', 'Python', 'UI/UX Design', 'Public Speaking', 'Data Science'].map((topic) => (
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
              description: 'Get personalized learning paths tailored to your goals and pace',
              color: 'learnify-purple',
            },
            {
              icon: BookOpen,
              title: 'Expert-Led Courses',
              description: 'Learn from industry professionals with real-world experience',
              color: 'learnify-yellow',
            },
            {
              icon: Users,
              title: 'Community Support',
              description: 'Join thousands of learners and grow together',
              color: 'learnify-blue',
            },
            {
              icon: Award,
              title: 'Track Progress',
              description: 'Monitor your achievements and stay motivated',
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
                <h3 className="text-xl font-bold text-[#151313] mb-2">{feature.title}</h3>
                <p className="text-[#151313]/80">{feature.description}</p>
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
            className="inline-block px-12 py-4 bg-[#ff5734] text-white text-xl font-bold rounded-full hover:bg-[#e64d2d] transition-colors shadow-lg hover:shadow-xl"
          >
            Start Learning Now
          </Link>
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <p>&copy; 2025 Learnify. Empowering learners worldwide.</p>
        </div>
      </footer>
    </div>
  );
}
