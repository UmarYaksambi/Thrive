import { NextResponse } from 'next/server';
import { getCourseById, updateCourse, Course } from '@/lib/server/courseStore';

// GET specific course
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const course = await getCourseById(params.id);
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(course);
}

// PATCH to update progress (mark lesson complete, save notes, etc)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  // body expects: { modules: [...] } or { progress: ... }
  
  // Recalculate progress percentage server-side for safety
  let updatedData = { ...body };
  
  if (body.modules) {
    const modules = body.modules;
    let total = 0;
    let completed = 0;
    
    modules.forEach((m: any) => {
      m.lessons.forEach((l: any) => {
        total++;
        if (l.completed) completed++;
      });
    });
    
    updatedData.totalLessons = total;
    updatedData.completedLessons = completed;
    updatedData.progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  }

  const updatedCourse = await updateCourse(params.id, updatedData);
  return NextResponse.json(updatedCourse);
}