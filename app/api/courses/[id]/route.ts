import { NextResponse } from 'next/server';
import {
  getCourseById,
  updateCourse,
} from '@/lib/server/courseStore';

export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const course = await getCourseById(id);
  if (!course) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(course);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

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
    updatedData.progress =
      total === 0
        ? 0
        : Math.round((completed / total) * 100);
  }

  const updatedCourse = await updateCourse(id, updatedData);
  return NextResponse.json(updatedCourse);
}
