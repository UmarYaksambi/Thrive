import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { fileData, mimeType } = await req.json();

    if (!fileData) {
      return NextResponse.json(
        { error: 'File data is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
    });

    const prompt = `
      You are an expert educational assistant. 
      Analyze this image or PDF of a test/quiz and extract the questions into a structured JSON format.
      
      Requirements:
      1. Extract all multiple choice questions.
      2. For each question, identify:
         - question: The text of the question
         - options: An array of 4 possible answers
         - answer: The correct answer (if indicated, otherwise choose the most likely one)
      
      Output ONLY a JSON object in this format:
      {
        "questions": [
          {
            "question": "...",
            "options": ["...", "...", "...", "..."],
            "answer": "..."
          }
        ]
      }
      
      If there are no clear multiple choice questions, try to convert open questions into MCQs if possible, otherwise return as questions with empty options.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: fileData,
          mimeType: mimeType || 'image/jpeg',
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Clean up the response to ensure it's valid JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : text;

    try {
      const parsedData = JSON.parse(cleanedJson);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error('JSON Parse Error:', text);
      return NextResponse.json(
        {
          error: 'Failed to parse AI response into JSON',
          raw: text,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Test OCR Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
