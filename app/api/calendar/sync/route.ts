import { NextResponse } from 'next/server';
import { getCourses, getQuizResults, getCalendarNotes } from '@/lib/server/courseStore';
import { INITIAL_COURSES } from '@/lib/initial-data';

export async function GET() {
  try {
    // 1. Fetch Data from DB
    const [dbCourses, results, notes] = await Promise.all([
      getCourses(),
      getQuizResults(),
      getCalendarNotes()
    ]);

    // 2. Merge Dummy Data with Real Data
    // We filter out duplicates based on ID just in case
    const dbCourseIds = new Set(dbCourses.map((c: any) => c.id));
    const mergedCourses = [
      ...INITIAL_COURSES.filter(c => !dbCourseIds.has(c.id)), 
      ...dbCourses
    ];
    
    return NextResponse.json({ courses: mergedCourses, results, notes });
  } catch (error) {
    console.error("Calendar Sync Error:", error);
    return NextResponse.json({ error: 'Failed to sync calendar' }, { status: 500 });
  }
}