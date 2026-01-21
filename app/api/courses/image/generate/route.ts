import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { updateCourse, getCourseById, saveCourse } from '@/lib/server/courseStore'; 
import { INITIAL_COURSES } from '@/lib/initial-data'; // <--- IMPORT THIS
import fs from 'fs/promises';
import path from 'path';

// Initialize GenAI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- HELPER: GET RANDOM DEFAULT IMAGE ---
async function assignRandomDefaultImage(courseId: string): Promise<string | null> {
  try {
    const defaultsDir = path.join(process.cwd(), 'public', 'default_pics');
    
    // Check if folder exists
    try {
      await fs.access(defaultsDir);
    } catch {
      console.warn("⚠️ 'public/default_pics' folder not found.");
      return '/placeholder.jpg';
    }

    const files = await fs.readdir(defaultsDir);
    const validImages = files.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

    if (validImages.length === 0) return '/placeholder.jpg';

    const randomImage = validImages[Math.floor(Math.random() * validImages.length)];
    const publicUrl = `/default_pics/${randomImage}`;

    // PERSISTENCE FIX:
    // If we assign a default image, we must ensure the course exists in the DB
    let course = await getCourseById(courseId);
    
    if (course) {
        // It's in the DB, just update
        await updateCourse(courseId, { imageUrl: publicUrl });
    } else {
        // It's a Dummy Course not in DB yet. Find it and Save it.
        const dummyCourse = INITIAL_COURSES.find(c => c.id === courseId);
        if (dummyCourse) {
            await saveCourse({ ...dummyCourse, imageUrl: publicUrl });
        }
    }

    return publicUrl;
  } catch (error) {
    console.error("Error assigning default image:", error);
    return null;
  }
}

export async function POST(req: Request) {
  const { courseId, title, category } = await req.json();

  try {
    // 1. Prepare Prompt
    const imagePrompt = `Create a high-quality, minimalist 3D abstract digital art cover image for a course titled "${title}" in the category of "${category}". No text. Cinematic lighting.`;

    // 2. Generate
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [{ text: imagePrompt }]
      },
      config: {
        responseModalities: ["IMAGE"] 
      }
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

    if (!imageBuffer) {
      throw new Error("No image data received from Gemini API");
    }

    // 3. Save Image Locally
    const publicDir = path.join(process.cwd(), 'public', 'course-images');
    await fs.mkdir(publicDir, { recursive: true });
    
    const fileName = `${courseId}.png`; 
    const filePath = path.join(publicDir, fileName);
    
    await fs.writeFile(filePath, new Uint8Array(imageBuffer));
    const localUrl = `/course-images/${fileName}`;

    // 4. UPDATE DATABASE (CRITICAL FIX)
    let course = await getCourseById(courseId);

    if (course) {
        // Case A: Course already exists in DB (User generated). Update it.
        await updateCourse(courseId, { imageUrl: localUrl });
    } else {
        // Case B: Course is a Dummy/Initial course not yet in DB.
        // We must fetch the full object from INITIAL_COURSES and SAVE it to DB
        // so this change persists.
        const dummyCourse = INITIAL_COURSES.find(c => c.id === courseId);
        if (dummyCourse) {
            await saveCourse({ ...dummyCourse, imageUrl: localUrl });
        } else {
            console.warn(`Course ${courseId} not found in DB or Initial Data.`);
        }
    }

    return NextResponse.json({ success: true, imageUrl: localUrl });

  } catch (error: any) {
    console.warn("⚠️ AI Generation failed, switching to default pics:", error.message || error);

    const fallbackUrl = await assignRandomDefaultImage(courseId);
    
    return NextResponse.json({ 
      success: true, 
      imageUrl: fallbackUrl, 
      note: "Used fallback image from default_pics" 
    });
  }
}