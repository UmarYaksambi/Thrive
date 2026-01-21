import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  try {
    const { topic, difficulty, questionCount } =
      await req.json();

    const prompt = `Generate a generic multiple-choice quiz about "${topic}".
    Difficulty: ${difficulty}.
    Number of Questions: ${questionCount || 5}.
    
    Output STRICT JSON format only:
    {
      "title": "Quiz Title",
      "questions": [
        {
          "id": "1",
          "question": "Question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "Option A" (Must match exactly one option),
          "explanation": "Brief explanation of why this is correct."
        }
      ]
    }`;

    const completion = await openai.chat.completions.create(
      {
        messages: [
          {
            role: 'system',
            content:
              'You are a strict JSON quiz generator.',
          },
          { role: 'user', content: prompt },
        ],
        model: 'gpt-3.5-turbo-1106',
        response_format: { type: 'json_object' },
      }
    );

    const quizData = JSON.parse(
      completion.choices[0].message.content || '{}'
    );

    return NextResponse.json(quizData);
  } catch (error) {
    console.error('Quiz generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
