import { NextResponse } from 'next/server';
import { getCourses, getQuizResults } from '@/lib/server/courseStore';

export async function GET() {
  try {
    const courses = await getCourses();
    const results = await getQuizResults();

    // Calculate aggregates
    const totalCourses = courses.length;
    const completedCourses = courses.filter((c: any) => c.progress === 100).length;
    
    const totalScore = results.reduce((acc: number, r: any) => acc + r.score, 0);
    const avgScore = results.length > 0 ? Math.round(totalScore / results.length) : 0;

    const report = {
      studentId: "LEARNER-001",
      generatedAt: new Date().toISOString(),
      summary: {
        totalCourses,
        completedCourses,
        averageTestScore: avgScore,
      },
      courses: courses.map((c: any) => ({
        title: c.title,
        category: c.category,
        progress: `${c.progress}%`,
        status: c.progress === 100 ? 'Completed' : 'In Progress',
        quizzesTaken: results.filter((r: any) => r.courseId === c.id).length
      })),
      testHistory: results.map((r: any) => ({
        date: r.dateTaken,
        score: r.score,
        passed: r.score >= 60
      }))
    };

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}