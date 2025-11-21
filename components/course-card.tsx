'use client';

import Link from 'next/link';
import { Bookmark, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  id: string;
  title: string;
  category: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  students: { avatar?: string; name: string }[];
  colorCode: string;
  isBookmarked?: boolean;
}

const getCategoryBgClass = (category: string, colorCode?: string) => {
  if (colorCode === '#fccc42') return 'learnify-yellow';
  if (colorCode === '#be94f5') return 'learnify-purple';
  if (colorCode === '#a8d8ea') return 'learnify-blue';
  if (category.toLowerCase().includes('marketing')) return 'learnify-yellow';
  if (category.toLowerCase().includes('computer')) return 'learnify-purple';
  if (category.toLowerCase().includes('psychology')) return 'learnify-blue';
  return 'learnify-purple';
};

export function CourseCard({
  id,
  title,
  category,
  progress,
  totalLessons,
  completedLessons,
  students,
  colorCode,
  isBookmarked = false,
}: CourseCardProps) {
  const bgClass = getCategoryBgClass(category, colorCode);

  return (
    <div className={cn('learnify-card p-6 relative', bgClass)}>
      <div className="flex items-start justify-between mb-4">
        <span className="px-4 py-1.5 bg-[#151313] text-white text-xs font-semibold rounded-full">
          {category}
        </span>
        <button className={cn('w-8 h-8 rounded-lg flex items-center justify-center transition-colors', isBookmarked ? 'bg-[#151313] text-white' : 'bg-white/30 hover:bg-white/50')}>
          <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>

      <h3 className="text-xl font-bold text-[#151313] mb-6 min-h-[3.5rem] leading-tight">
        {title}
      </h3>

      <div className="mb-3">
        <div className="flex items-center justify-between text-sm font-semibold text-[#151313] mb-2">
          <span>Progress</span>
          <span>{completedLessons}/{totalLessons} lessons</span>
        </div>
        <div className="h-3 bg-[#151313]/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#151313] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center">
          {students.slice(0, 3).map((student, index) => (
            <div
              key={index}
              className="w-9 h-9 rounded-full bg-white border-2 border-white overflow-hidden -ml-2 first:ml-0"
            >
              {student.avatar ? (
                <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#be94f5] to-[#ff5734] flex items-center justify-center text-white text-xs font-bold">
                  {student.name.charAt(0)}
                </div>
              )}
            </div>
          ))}
          {students.length > 3 && (
            <div className="w-9 h-9 rounded-full bg-[#151313] text-[#fccc42] text-xs font-bold flex items-center justify-center -ml-2">
              +{students.length - 3}
            </div>
          )}
        </div>

        <Link
          href={`/course/${id}`}
          className="px-6 py-2.5 bg-[#ff5734] text-white font-semibold rounded-full hover:bg-[#e64d2d] transition-colors shadow-md hover:shadow-lg"
        >
          Continue
        </Link>
      </div>
    </div>
  );
}
