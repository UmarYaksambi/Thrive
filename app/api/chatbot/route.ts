import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getCourses, getCalendarNotes } from '@/lib/server/courseStore';
import { Course, CalendarNote } from '@/lib/types';
import { INITIAL_COURSES } from '@/lib/initial-data';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 1. Gather Context
    const dbCourses = await getCourses();
    const allCourses = [...INITIAL_COURSES, ...dbCourses];

    const courseSummary = allCourses.map(c =>
      `- ${c.title} (${c.category}): ${c.progress}% complete. Level: ${c.level}.`
    ).join('\n');

    // 2. System Prompt
    const systemMessage = {
      role: "system",
      content: `You are 'Spiked', an AI learning assistant.
      The user has the following courses in their dashboard:
      ${courseSummary}
      
      Answer questions based on these courses. If they ask about a topic not in the list, suggest they use the "Planner" to generate a new course for it. Keep answers concise and encouraging.`
    };

    // 3. Call OpenAI
    const completion = await openai.chat.completions.create({
      messages: [systemMessage, ...messages],
      model: "gpt-3.5-turbo",
    });

    return NextResponse.json({
      role: 'assistant',
      content: completion.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}