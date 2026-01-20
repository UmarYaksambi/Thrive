import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { updateCourse, getCourseById } from '@/lib/server/courseStore';
import { Course } from '@/lib/types'; // Ensure saveCourse is exported
import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper: Download and save to public folder
async function saveImageLocally(url: string, courseId: string): Promise<string> {
  const publicDir = path.join(process.cwd(), 'public', 'course-images');
  await fs.ensureDir(publicDir);
  const fileName = `${courseId}.jpg`;
  const filePath = path.join(publicDir, fileName);

  const response = await axios({ url, method: 'GET', responseType: 'arraybuffer' });
  await fs.writeFile(filePath, response.data);
  return `/course-images/${fileName}`;
}

export async function POST(req: Request) {
  try {
    const { courseId, title, category } = await req.json();

    // 1. Check if course exists in DB (if not, it might be a dummy course we need to persist)
    let course = await getCourseById(courseId);

    // 2. Ask Gemini for a visual prompt
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Create a short, vivid, comma-separated visual description for a high-quality 3D digital art cover image for a course titled "${title}" in the category of "${category}". No text in image. Minimalist, modern style.`;

    const result = await model.generateContent(prompt);
    const visualKeywords = result.response.text();

    // 3. Generate Image URL (Pollinations)
    const encodedPrompt = encodeURIComponent(visualKeywords);
    const remoteUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;

    // 4. Save to Local Filesystem
    const localUrl = await saveImageLocally(remoteUrl, courseId);

    // 5. Update Database
    if (course) {
      await updateCourse(courseId, { imageUrl: localUrl });
    } else {
      // If it's a dummy course not yet in DB, we can't easily update the static file.
      // But we can return the local URL for the frontend to use temporarily/cache.
    }

    return NextResponse.json({ success: true, imageUrl: localUrl });

  } catch (error) {
    console.error("Image Auto-Gen Failed:", error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}