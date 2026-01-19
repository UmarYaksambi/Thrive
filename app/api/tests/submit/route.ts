import { NextResponse } from 'next/server';
import { saveQuizResult, QuizResult } from '@/lib/server/courseStore';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId, moduleId, userAnswers, originalQuestions } = body;

    let correctCount = 0;
    const gradedAnswers = originalQuestions.map((q: any) => {
      const isCorrect = q.answer === userAnswers[q.id];
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        questionText: q.question,
        selectedAnswer: userAnswers[q.id] || 'Skipped',
        correctAnswer: q.answer,
        isCorrect
      };
    });

    const score = Math.round((correctCount / originalQuestions.length) * 100);

    // Create the record
    const result: QuizResult = {
      id: uuidv4(),
      courseId,
      moduleId,
      studentId: "Learner", 
      score,
      totalQuestions: originalQuestions.length,
      dateTaken: new Date().toISOString(),
      answers: gradedAnswers,
      feedback: score > 80 ? "Excellent mastery of the topic." : "Review the material and try again."
    };

    // Store strictly in our "Folder" (JSON DB)
    await saveQuizResult(result);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: 'Failed to save results' }, { status: 500 });
  }
}