import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { updateCourse, getCourseById, saveCourse } from '@/lib/server/courseStore'; 
import { INITIAL_COURSES } from '@/lib/initial-data';
import fs from 'fs/promises';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper: Check if file exists
async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Helper: Get Default Image
async function assignRandomDefaultImage(courseId: string) {
  try {
    const defaultsDir = path.join(process.cwd(), 'public', 'default_pics');
    if (await fileExists(defaultsDir)) {
      const files = await fs.readdir(defaultsDir);
      const validImages = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
      if (validImages.length > 0) {
        const randomImage = validImages[Math.floor(Math.random() * validImages.length)];
        return `/default_pics/${randomImage}`;
      }
    }
    return '/placeholder.jpg';
  } catch (e) {
    return '/placeholder.jpg';
  }
}

export async function POST(req: Request) {
  const { courseId, title, category } = await req.json();
  const publicDir = path.join(process.cwd(), 'public', 'course-images');
  const fileName = `${courseId}.png`;
  const filePath = path.join(publicDir, fileName);
  const localUrl = `/course-images/${fileName}`;

  try {
    // --- 1. CHECK IF IMAGE ALREADY EXISTS LOCALLY ---
    if (await fileExists(filePath)) {
      console.log(`✅ Image already exists for ${courseId}. Skipping generation.`);
      
      // Ensure DB is synced with this existing file
      const course = await getCourseById(courseId);
      if (course) {
        if (course.imageUrl !== localUrl) {
           await updateCourse(courseId, { imageUrl: localUrl });
        }
      } else {
        // Handle Dummy Course persistence
        const dummy = INITIAL_COURSES.find(c => c.id === courseId);
        if (dummy) await saveCourse({ ...dummy, imageUrl: localUrl });
      }

      return NextResponse.json({ success: true, imageUrl: localUrl });
    }

    // --- 2. GENERATE NEW IMAGE (If not found locally) ---
    const imagePrompt = `Create a high-quality, minimalist 3D abstract digital art cover image for a course titled "${title}" in the category of "${category}". No text. Cinematic lighting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', 
      contents: { parts: [{ text: imagePrompt }] },
      config: { responseModalities: ["IMAGE"] }
    });

    let imageBuffer: Buffer | null = null;
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          imageBuffer = Buffer.from(part.inlineData.data, 'base64');
          break;
        }
      }
    }

    if (!imageBuffer) throw new Error("No image data from Gemini");

    // --- 3. SAVE IMAGE ---
    await fs.mkdir(publicDir, { recursive: true });
    await fs.writeFile(filePath, new Uint8Array(imageBuffer));

    // Update DB
    const course = await getCourseById(courseId);
    if (course) {
      await updateCourse(courseId, { imageUrl: localUrl });
    } else {
      const dummy = INITIAL_COURSES.find(c => c.id === courseId);
      if (dummy) await saveCourse({ ...dummy, imageUrl: localUrl });
    }

    return NextResponse.json({ success: true, imageUrl: localUrl });

  } catch (error: any) {
    console.warn("⚠️ AI Generation failed/skipped:", error.message || error);
    
    // Fallback to default pics
    const fallbackUrl = await assignRandomDefaultImage(courseId);
    return NextResponse.json({ success: true, imageUrl: fallbackUrl });
  }
}