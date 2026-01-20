import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveCourse } from '@/lib/server/courseStore';
import { Course, Module, Lesson, Quiz } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs-extra';
import path from 'path';
import axios from 'axios'; // You might need to install axios: npm install axios

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// --- HELPER: DOWNLOAD & SAVE IMAGE ---
async function downloadAndSaveImage(url: string, courseId: string): Promise<string> {
  try {
    // 1. Define where to save the image (public/course-images)
    const publicDir = path.join(process.cwd(), 'public', 'course-images');
    await fs.ensureDir(publicDir); // Ensure folder exists

    // 2. Define file name
    const fileName = `${courseId}.jpg`;
    const filePath = path.join(publicDir, fileName);

    // 3. Fetch image data
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer'
    });

    // 4. Write to file system
    await fs.writeFile(filePath, response.data);

    // 5. Return the public URL path
    return `/course-images/${fileName}`;
  } catch (error) {
    console.error("Failed to save image locally:", error);
    // Fallback to a default placeholder if download fails
    return '/images/placeholder-course.jpg';
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, domain, level, duration, includeQuizzes, existingKnowledge } = body;

    // --- STEP 1: Generate Curriculum (OpenAI) ---
    const systemPrompt = `You are an expert curriculum designer. Create a structured course JSON for: "${topic}" in the domain of "${domain}".
    Target Audience: ${level}. Duration: ${duration}.
    Context/Prerequisites: ${existingKnowledge || 'None'}.
    
    Output strictly valid JSON with this schema:
    {
      "title": "Engaging Course Title",
      "description": "2 sentence summary",
      "modules": [
        {
          "title": "Module Name",
          "duration": "e.g. 1h 20m",
          "lessons": [
             { "title": "Lesson Name", "duration": "15 min", "type": "video" }
          ],
          "quiz": { 
             "title": "Module Quiz",
             "questions": [
                { "question": "...", "options": ["A", "B", "C", "D"], "answer": "A" }
             ]
          } (optional - include if ${includeQuizzes})
        }
      ]
    }`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a strict JSON generator.' },
        { role: 'user', content: systemPrompt }
      ],
      model: 'gpt-3.5-turbo-1106',
      response_format: { type: 'json_object' },
    });

    const aiData = JSON.parse(completion.choices[0].message.content || '{}');

    // --- STEP 2: Generate Image Prompt (Gemini) ---
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const imagePromptQuery = `Describe a minimal, high-quality, 3D abstract digital art background image for a course titled "${aiData.title}". 
    The image should represent the concept of ${topic}. 
    Output ONLY the visual description keywords, separated by commas. No intro/outro.`;

    const imageResult = await model.generateContent(imagePromptQuery);
    const imageKeywords = imageResult.response.text();

    // Generate the external URL
    const encodedPrompt = encodeURIComponent(imageKeywords);
    const tempImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;

    // --- STEP 3: Download & Persist Image ---
    const courseId = uuidv4();
    const localImageUrl = await downloadAndSaveImage(tempImageUrl, courseId);

    // --- STEP 4: Save Course to DB ---
    const newCourse: Course = {
      id: courseId,
      title: aiData.title,
      description: aiData.description,
      category: domain,
      level: level,
      imageUrl: localImageUrl, // <--- SAVING THE LOCAL PATH
      startDate: new Date().toISOString(),
      progress: 0,
      completedLessons: 0,
      totalLessons: aiData.modules.reduce((acc: any, m: any) => acc + m.lessons.length, 0),
      colorCode: '#ff5734', // Default color for new courses
      modules: aiData.modules.map((m: any) => ({
        id: uuidv4(),
        title: m.title,
        duration: m.duration,
        lessons: m.lessons.map((l: any) => ({
          id: uuidv4(),
          title: l.title,
          duration: l.duration,
          type: 'video',
          completed: false,
          videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(l.title + ' ' + topic + ' tutorial')}`,
          notes: ''
        })),
        quiz: m.quiz ? {
          id: uuidv4(),
          title: m.quiz.title,
          questions: m.quiz.questions,
          completed: false,
          score: 0
        } : undefined
      }))
    };

    await saveCourse(newCourse);

    return NextResponse.json({ success: true, courseId: newCourse.id });

  } catch (error) {
    console.error('Course generation error:', error);
    return NextResponse.json({ error: 'Failed to generate course' }, { status: 500 });
  }
}