import { getCourses, saveCourse } from "@/lib/server/courseStore";

export async function GET() {
  const courses = await getCourses();
  return Response.json(courses);
}

export async function POST(req: Request) {
  const course = await req.json();
  await saveCourse(course);
  return Response.json({ success: true });
}
