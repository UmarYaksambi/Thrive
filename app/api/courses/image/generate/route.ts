import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { updateCourse, getCourseById } from '@/lib/server/courseStore'; 
import fs from 'fs-extra';
import path from 'path';

// Initialize the new GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { courseId, title, category } = await req.json();

    // 1. Prepare the Prompt
    const imagePrompt = `Create a high-quality, minimalist 3D abstract digital art cover image for a course titled "${title}" in the category of "${category}". No text. Cinematic lighting.`;

    // 2. Call Google GenAI (Imagen/Gemini Model)
    // Note: Ensure your API Key has access to the specific model you want to use.
    // 'imagen-3.0-generate-001' is standard for images, but I'm using your requested model string.
    const response = await ai.models.generateContent({
      model: 'imagen-3.0-generate-001', // Or 'gemini-2.0-flash-exp' if available for images
      contents: {
        parts: [{ text: imagePrompt }]
      }
    });

    let imageBuffer: Buffer | null = null;

    // 3. Extract Image Data from Response
    // The structure depends on the specific model response, handling standard inlineData
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

    // 4. Save to Public Folder
    const publicDir = path.join(process.cwd(), 'public', 'course-images');
    await fs.ensureDir(publicDir);
    
    const fileName = `${courseId}.png`; // Saving as PNG
    const filePath = path.join(publicDir, fileName);
    
    await fs.writeFile(filePath, imageBuffer);
    const localUrl = `/course-images/${fileName}`;

    // 5. Update Database
    // Check if course exists first (handle dummy vs real)
    const course = await getCourseById(courseId);
    if (course) {
      await updateCourse(courseId, { imageUrl: localUrl });
    }

    return NextResponse.json({ success: true, imageUrl: localUrl });

  } catch (error) {
    console.error("Gemini Image Gen Failed:", error);
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
  }
}