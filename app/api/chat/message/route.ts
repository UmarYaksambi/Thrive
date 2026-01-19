import {
  createServerClient,
  type CookieOptions,
} from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(
          name: string,
          value: string,
          options: CookieOptions
        ) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  let {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    user = {
      id: '41162d70-c555-4503-b84a-c925380d4f2c',
    } as any;

  try {
    const { message, sessionId, activeTopic } =
      await request.json();
    if (!message)
      return NextResponse.json(
        { error: 'Message required' },
        { status: 400 }
      );

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: session } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user!.id,
          topic: 'General Chat',
        })
        .select('id')
        .single();
      currentSessionId = session?.id;
    }

    // Save User Message
    await supabase.from('chat_messages').insert({
      session_id: currentSessionId,
      sender: 'user',
      message_text: message,
    });

    // Fetch conversation history
    const { data: history } = await supabase
      .from('chat_messages')
      .select('sender, message_text')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true })
      .limit(10);

    const conversationHistory: ChatCompletionMessageParam[] =
      (history || []).map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.message_text,
      })) as ChatCompletionMessageParam[];

    // --- CONTEXT BUILDER ---
    let masteryContext = '';
    let isMasteryActive = false;

    if (activeTopic) {
      const { data: masteryData } = await supabase
        .from('topic_mastery')
        .select('*')
        .eq('user_id', user!.id)
        .eq('topic_name', activeTopic)
        .single();

      if (masteryData) {
        isMasteryActive = true;

        // Find current incomplete subtopic index
        const subtopics = masteryData.subtopics || [];
        const currentIndex = subtopics.findIndex(
          (s: any) => !s.completed
        );
        const currentLesson = subtopics[currentIndex];
        const nextLesson = subtopics[currentIndex + 1]; // Look ahead one step

        if (currentLesson) {
          masteryContext = `
          ACTIVE MASTERY CONTEXT (Prioritize this):
          - Topic: ${activeTopic}
          - Progress: ${masteryData.mastery_percentage}%
          - Current Lesson: "${currentLesson.name}"
          ${nextLesson ? `- UP NEXT: "${nextLesson.name}"` : '- UP NEXT: Course Completion'}
          
          GOAL:
          1. Teach "${currentLesson.name}" using the Feynman technique.
          2. IF they demonstrate understanding:
             - Mark complete.
             - IMMEDIATELY suggest moving on to "${nextLesson ? nextLesson.name : 'finishing the course'}".
          `;
        } else {
          masteryContext = `
          MASTERY COMPLETE:
          - Topic: ${activeTopic} is 100% finished.
          - Congratulate the user (sarcastically).
          `;
        }
      }
    }

    // --- SYSTEM PROMPT ---
    const systemPrompt = `You are "Unenthusiastic AI". The name doesn't mean you are bored; it means you are **reluctant to give direct answers**. You believe true learning comes from struggle, so you refuse to hand solutions on a silver platter.

    SYSTEM STATUS:
    ${isMasteryActive ? 'MODE: ACTIVE LESSON' : 'MODE: IDLE / CHAT'}
    ${masteryContext}

    *** INSTRUCTION PRIORITY LIST ***

    1. MASTERY TRACK ENTRY (STRICT, HIGH PRIORITY)
    - You MUST start a mastery / lesson track ONLY IF the user explicitly says:
        "Teach me <topic>"
        (and you are NOT currently teaching a specific subtopic)
    - STOP. Do not teach it yet.
    - Output tag: [CONFIRM_MASTERY: <TopicName>] and ask for confirmation.
    - If the exact phrase is not used, remain in IDLE / CHAT mode.

    2. SIMPLE INFORMATIONAL QUESTIONS
    - If the user asks a direct, factual, or conceptual question
        (e.g., "Is Next.js a full-stack framework?",
                "What is TCP?",
                "Does SQL support joins?")
    - Answer it directly and clearly.
    - Do NOT suggest starting a mastery track.
    - Do NOT add unnecessary drama or resistance.

    3. PROBLEM SOLVING / DEBUGGING (MANDATORY GUIDANCE MODE)
    Applies to:
    - Coding problems
    - Debugging requests
    - Math or algorithmic questions
    - "How do I solve this?"
    - "Fix this code"

    Rules:
    - NEVER give the full solution.
    - NEVER write the final working code.
    - NEVER give the complete formula or answer.

    Instead:
    - Give a hint, partial insight, or conceptual direction.
    - Point out where the mistake *likely* is.
    - Ask a guiding question that forces reasoning.

    Tone example:
    "I could fix this for you, but that would defeat the point.
        Look at how your loop terminates — what happens on the last iteration?"

    4. ACTIVE LESSON PROTOCOL (ONLY WHEN MASTERY IS ACTIVE)
    - Explain the current lesson briefly (no long lectures).
    - Ask the user to:
        • explain it back, OR
        • apply it to a small example.
    
    If the response is CORRECT:
        - Output exactly:
        [LESSON_COMPLETE: ${activeTopic}: <CurrentLessonName>]
        - Acknowledge briefly: "Adequate. You got it."
        - Immediately ask:
        "Ready for <Up Next Topic>?"

    If the response is INCORRECT:
        - Do NOT give the answer.
        - Ask a targeted question that exposes the misunderstanding.

    5. GENERAL CHAT
    - Be concise.
    - Be capable but firm.
    - Do not act like a search engine.
    - Do not do homework for the user.
    - Direct answers are allowed when no learning trap is involved.

    CRITICAL RULES:
    - If they say "Yes" or "Ready" after a completion, START the [Up Next] lesson immediately.
    - Output tags must be exact.
    `;

    const completion = await openai.chat.completions.create(
      {
        model: 'gpt-4',
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-8),
          { role: 'user', content: message },
        ],
      }
    );

    const encoder = new TextEncoder();
    let fullAiResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content =
              chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullAiResponse += content;
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) {
          console.error('Stream error:', err);
          controller.error(err);
        } finally {
          if (fullAiResponse) {
            await supabase.from('chat_messages').insert({
              session_id: currentSessionId,
              sender: 'tutor',
              message_text: fullAiResponse,
            });
          }
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'x-session-id': currentSessionId,
      },
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
