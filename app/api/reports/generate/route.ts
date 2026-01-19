import { NextResponse } from 'next/server';
import { getCourseById } from '@/lib/server/courseStore';

export async function POST(req: Request) {
  const { courseId } = await req.json();
  const course = await getCourseById(courseId);

  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

  // In a real app, use 'pdfkit' or 'react-pdf' to generate a binary stream.
  // Here we mock the JSON data required for the client to print/render the report.
  
  const reportData = {
    generatedAt: new Date().toISOString(),
    student: "Learner", // Get from session in real app
    courseTitle: course.title,
    progress: `${course.progress}%`,
    modulesCompleted: course.completedLessons,
    quizScores: course.modules
      .filter(m => m.quiz && m.quiz.completed)
      .map(m => ({ module: m.title, score: m.quiz?.score || 0 })),
    certificateId: `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  };

  return NextResponse.json(reportData);
}