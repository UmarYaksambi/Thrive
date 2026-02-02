import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import {
  updateCourse,
  getCourseById,
  saveCourse,
} from '@/lib/server/courseStore';
import { INITIAL_COURSES } from '@/lib/initial-data';
import fs from 'fs/promises';
import path from 'path';

// Initialize GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// --- HELPER: CHECK IF FILE EXISTS ---
async function fileExists(
  filePath: string
): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// --- HELPER: GET RANDOM DEFAULT IMAGE ---
async function assignRandomDefaultImage(
  courseId: string
): Promise<string> {
  try {
    const defaultsDir = path.join(
      process.cwd(),
      'public',
      'default_pics'
    );

    // Check if folder exists
    if (!(await fileExists(defaultsDir))) {
      console.warn(
        "⚠️ 'public/default_pics' folder not found."
      );
      return '/placeholder.jpg';
    }

    const files = await fs.readdir(defaultsDir);
    const validImages = files.filter((f) =>
      /\.(jpg|jpeg|png|webp)$/i.test(f)
    );

    if (validImages.length === 0) return '/placeholder.jpg';

    const randomImage =
      validImages[
        Math.floor(Math.random() * validImages.length)
      ];
    const publicUrl = `/default_pics/${randomImage}`;

    // Persist choice to DB
    const course = await getCourseById(courseId);
    if (course) {
      await updateCourse(courseId, { imageUrl: publicUrl });
    } else {
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
    return '/placeholder.jpg';
  }
}

export async function POST(req: Request) {
  try {
    const { courseId, title, category } = await req.json();
    const publicDir = path.join(
      process.cwd(),
      'public',
      'course-images'
    );
    const fileName = `${courseId}.png`;
    const filePath = path.join(publicDir, fileName);
    const localUrl = `/course-images/${fileName}`;

    // --- 1. CHECK IF IMAGE ALREADY EXISTS LOCALLY ---
    if (await fileExists(filePath)) {
      const course = await getCourseById(courseId);
      if (course) {
        if (course.imageUrl !== localUrl) {
          await updateCourse(courseId, {
            imageUrl: localUrl,
          });
        }
      } else {
        const dummy = INITIAL_COURSES.find(
          (c) => c.id === courseId
        );
        if (dummy)
          await saveCourse({
            ...dummy,
            imageUrl: localUrl,
          });
      }
      return NextResponse.json({
        success: true,
        imageUrl: localUrl,
      });
    }

    // --- 2. GENERATE NEW IMAGE ---
    const imagePrompt = `Create a high-quality, minimalist 3D abstract digital art cover image for a course titled "${title}" in the category of "${category}". No text. Cinematic lighting.`;

    // Using the correct @google/genai syntax
    const response = await ai.models.generateContent({
      model: 'imagen-3.0-generate-001', // Or 'gemini-2.0-flash-exp' if supported
      contents: {
        parts: [{ text: imagePrompt }],
      },
      config: {
        responseModalities: ['IMAGE'],
      },
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

    if (!imageBuffer)
      throw new Error(
        'No image data received from Gemini API'
      );

    // --- 3. SAVE IMAGE LOCALLY ---
    await fs.mkdir(publicDir, { recursive: true });
    await fs.writeFile(
      filePath,
      new Uint8Array(imageBuffer)
    );

    // --- 4. UPDATE DATABASE ---
    const course = await getCourseById(courseId);
    if (course) {
      await updateCourse(courseId, { imageUrl: localUrl });
    } else {
      const dummyCourse = INITIAL_COURSES.find(
        (c) => c.id === courseId
      );
      if (dummyCourse) {
        await saveCourse({
          ...dummyCourse,
          imageUrl: localUrl,
        });
      }
    }

    return NextResponse.json({
      success: true,
      imageUrl: localUrl,
    });
  } catch (error: any) {
    console.warn(
      '⚠️ AI Generation failed/skipped:',
      error.message || error
    );

    // Fallback to random default image
    // Extracting courseId from request if available for the fallback logic
    const body = await req
      .clone()
      .json()
      .catch(() => ({}));
    const fallbackUrl = await assignRandomDefaultImage(
      body.courseId || ''
    );

    return NextResponse.json({
      success: true,
      imageUrl: fallbackUrl,
      note: 'Used fallback image',
    });
  }
}
