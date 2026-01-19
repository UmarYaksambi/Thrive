import { NextResponse } from 'next/server';
import { getCourses, getQuizResults, getCalendarNotes } from '@/lib/server/courseStore';

export async function GET() {
  try {
    const [courses, results, notes] = await Promise.all([
      getCourses(),
      getQuizResults(),
      getCalendarNotes()
    ]);
    
    return NextResponse.json({ courses, results, notes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to sync calendar' }, { status: 500 });
  }
}