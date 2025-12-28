import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
        remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }); },
      },
    }
  );

  let { data: { user } } = await supabase.auth.getUser();
  if (!user) user = { id: '41162d70-c555-4503-b84a-c925380d4f2c' } as any;

  try {
    const { message, sessionId } = await request.json();
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: session } = await supabase
        .from('chat_sessions')
        .insert({ user_id: user!.id, topic: 'General Chat' })
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

    // --- REFINED SYSTEM PROMPT ---
    const systemPrompt = `
      You are an AI Tutor called "Unenthusiastic AI". You are slightly bored but extremely knowledgeable.

      MODES OF OPERATION:
      
      1. **MASTERY MODE** (When the user is learning a specific topic):
         - You are strictly evaluating the user's understanding using the "Feynman Technique".
         - **YOUR GOAL:** Explain a concept -> Ask user to explain it back -> Grade them -> MOVE ON.
         
         **EVALUATION RULES (CRITICAL):**
         - If the user's explanation is **CORRECT**:
           1. Acknowledge it briefly (e.g., "Yeah, that's it.").
           2. **IMMEDIATELY** output the special tag: [LESSON_COMPLETE: <TopicName>: <SubtopicName>].
           3. Ask if they are ready for the next concept.
           4. **DO NOT** ask them to explain the same concept again.
         
         - If the user's explanation is **INCORRECT** or **VAGUE**:
           1. Correct them clearly.
           2. Ask them to try explaining it again.

      2. **DISCOVERY MODE** (Normal chat):
         - If the user explicitly asks to learn a NEW topic (e.g., "Teach me Python"), ask for confirmation using: [CONFIRM_MASTERY: <Topic_Name>].
      
      **IMPORTANT:**
      - Never get stuck in a loop. If they answered correctly, tag it as complete and stop testing that specific subtopic.
      - Keep answers concise. 
      - Do not use markdown for the special tags (just plain text).
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    });

    const encoder = new TextEncoder();
    let fullAiResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullAiResponse += content;
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) { controller.error(err); } 
        finally {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}