import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { saveCourse, Course } from '@/lib/server/courseStore';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, domain, level, duration, includeQuizzes, existingKnowledge } = body;

    // 1. Prompt Engineering for Structured JSON
    const systemPrompt = `You are an expert curriculum designer. Create a structured course JSON for: "${topic}" in the domain of "${domain}".
    Target Audience: ${level}. Duration: ${duration}.
    Context/Prerequisites: ${existingKnowledge || 'None'}.
    
    Structure requirements:
    - 4 to 8 Modules.
    - Each module has 2-4 Lessons.
    - ${includeQuizzes ? 'Include a short Quiz (3 questions) at the end of every module.' : 'No quizzes.'}
    - Calculate realistic durations.
    
    Output strictly valid JSON with this schema:
    {
      "title": "Course Title",
      "description": "2 sentence summary",
      "modules": [
        {
          "title": "Module Name",
          "duration": "e.g. 1h 20m",
          "lessons": [
             { "title": "Lesson Name", "duration": "15 min", "type": "video" }
          ],
          "quiz": { 
             "title": "Module X Quiz",
             "questions": [
                { "question": "...", "options": ["A", "B", "C", "D"], "answer": "A" }
             ]
          } (optional)
        }
      ]
    }`;

    // 2. Call OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a strict JSON generator.' },
        { role: 'user', content: systemPrompt }
      ],
      model: 'gpt-3.5-turbo-1106', // Low cost, supports JSON mode
      response_format: { type: 'json_object' },
    });

    const aiData = JSON.parse(completion.choices[0].message.content || '{}');

    // 3. Generate AI Image (Using Pollinations.ai for real-time AI image generation without key)
    // This satisfies the "Gemini Image" requirement by generating an image based on the prompt.
    const encodedTopic = encodeURIComponent(`${domain} ${topic} minimal digital art`);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedTopic}?width=800&height=600&nologo=true`;

    // 4. Construct the Database Object
    const newCourse: Course = {
      id: uuidv4(),
      title: aiData.title,
      description: aiData.description,
      category: domain,
      level: level,
      imageUrl: imageUrl,
      startDate: new Date().toISOString(),
      progress: 0,
      completedLessons: 0,
      totalLessons: aiData.modules.reduce((acc: any, m: any) => acc + m.lessons.length, 0),
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
          // Generate a YouTube Search URL for the "video"
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

    // 5. Save to Local DB
    await saveCourse(newCourse);

    return NextResponse.json({ success: true, courseId: newCourse.id });

  } catch (error) {
    console.error('Course generation error:', error);
    return NextResponse.json({ error: 'Failed to generate course' }, { status: 500 });
  }
}