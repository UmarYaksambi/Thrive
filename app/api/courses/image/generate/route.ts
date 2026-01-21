import { NextResponse } from 'next/server';
<<<<<<< HEAD
import { GoogleGenAI } from "@google/genai";
import { updateCourse, getCourseById, saveCourse } from '@/lib/server/courseStore'; 
=======
import { GoogleGenAI } from '@google/genai';
import {
  updateCourse,
  getCourseById,
  saveCourse,
} from '@/lib/server/courseStore';
>>>>>>> c9533bb3483ad1ba3a2aed747774efc92ac2d1bb
import { INITIAL_COURSES } from '@/lib/initial-data';
import fs from 'fs/promises';
import path from 'path';

<<<<<<< HEAD
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
=======
// Initialize GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// --- HELPER: GET RANDOM DEFAULT IMAGE ---
async function assignRandomDefaultImage(
  courseId: string
): Promise<string | null> {
  try {
    const defaultsDir = path.join(
      process.cwd(),
      'public',
      'default_pics'
    );

    // Check if folder exists
    try {
      await fs.access(defaultsDir);
    } catch {
      console.warn(
        "⚠️ 'public/default_pics' folder not found."
      );
      return '/placeholder.jpg';
    }

    const files = await fs.readdir(defaultsDir);
    const validImages = files.filter((file) =>
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );

    if (validImages.length === 0) return '/placeholder.jpg';

    const randomImage =
      validImages[
        Math.floor(Math.random() * validImages.length)
      ];
    const publicUrl = `/default_pics/${randomImage}`;

    // PERSISTENCE FIX:
    // If we assign a default image, we must ensure the course exists in the DB
    let course = await getCourseById(courseId);

    if (course) {
      // It's in the DB, just update
      await updateCourse(courseId, { imageUrl: publicUrl });
    } else {
      // It's a Dummy Course not in DB yet. Find it and Save it.
      const dummyCourse = INITIAL_COURSES.find(
        (c) => c.id === courseId
      );
      if (dummyCourse) {
        await saveCourse({
          ...dummyCourse,
          imageUrl: publicUrl,
        });
      }
    }

    return publicUrl;
  } catch (error) {
    console.error('Error assigning default image:', error);
    return null;
>>>>>>> c9533bb3483ad1ba3a2aed747774efc92ac2d1bb
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

<<<<<<< HEAD
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', 
      contents: { parts: [{ text: imagePrompt }] },
      config: { responseModalities: ["IMAGE"] }
=======
    // 2. Call Google GenAI (Imagen/Gemini Model)
    const response = await ai.models.generateContent({
      model: 'imagen-3.0-generate-001',
      contents: {
        parts: [{ text: imagePrompt }],
      },
      config: {
        responseModalities: ['IMAGE'],
      },
>>>>>>> c9533bb3483ad1ba3a2aed747774efc92ac2d1bb
    });

    let imageBuffer: Buffer | null = null;
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          imageBuffer = Buffer.from(
            part.inlineData.data,
            'base64'
          );
          break;
        }
      }
    }

<<<<<<< HEAD
    if (!imageBuffer) throw new Error("No image data from Gemini");

    // --- 3. SAVE IMAGE ---
    await fs.mkdir(publicDir, { recursive: true });
    await fs.writeFile(filePath, new Uint8Array(imageBuffer));
=======
    if (!imageBuffer) {
      throw new Error(
        'No image data received from Gemini API'
      );
    }

    // 3. Save Image Locally
    const publicDir = path.join(
      process.cwd(),
      'public',
      'course-images'
    );
    await fs.mkdir(publicDir, { recursive: true });

    const fileName = `${courseId}.png`;
    const filePath = path.join(publicDir, fileName);

    await fs.writeFile(
      filePath,
      new Uint8Array(imageBuffer)
    );
    const localUrl = `/course-images/${fileName}`;

    // 4. UPDATE DATABASE (CRITICAL FIX)
    let course = await getCourseById(courseId);
>>>>>>> c9533bb3483ad1ba3a2aed747774efc92ac2d1bb

    // Update DB
    const course = await getCourseById(courseId);
    if (course) {
<<<<<<< HEAD
      await updateCourse(courseId, { imageUrl: localUrl });
    } else {
      const dummy = INITIAL_COURSES.find(c => c.id === courseId);
      if (dummy) await saveCourse({ ...dummy, imageUrl: localUrl });
=======
      // Case A: Course already exists in DB (User generated). Update it.
      await updateCourse(courseId, { imageUrl: localUrl });
    } else {
      // Case B: Course is a Dummy/Initial course not yet in DB.
      // We must fetch the full object from INITIAL_COURSES and SAVE it to DB
      // so this change persists.
      const dummyCourse = INITIAL_COURSES.find(
        (c) => c.id === courseId
      );
      if (dummyCourse) {
        await saveCourse({
          ...dummyCourse,
          imageUrl: localUrl,
        });
      } else {
        console.warn(
          `Course ${courseId} not found in DB or Initial Data.`
        );
      }
>>>>>>> c9533bb3483ad1ba3a2aed747774efc92ac2d1bb
    }

    return NextResponse.json({
      success: true,
      imageUrl: localUrl,
    });
  } catch (error: any) {
<<<<<<< HEAD
    console.warn("⚠️ AI Generation failed/skipped:", error.message || error);
    
    // Fallback to default pics
    const fallbackUrl = await assignRandomDefaultImage(courseId);
    return NextResponse.json({ success: true, imageUrl: fallbackUrl });
=======
    console.warn(
      '⚠️ AI Generation failed, switching to default pics:',
      error.message || error
    );

    const fallbackUrl =
      await assignRandomDefaultImage(courseId);

    return NextResponse.json({
      success: true,
      imageUrl: fallbackUrl,
      note: 'Used fallback image from default_pics',
    });
>>>>>>> c9533bb3483ad1ba3a2aed747774efc92ac2d1bb
  }
}
