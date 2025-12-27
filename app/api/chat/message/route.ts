import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const cookieStore = cookies();
  
  // 1. Initialize Supabase
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

  // 2. Auth Check with Fallback
  let { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log("⚠️ Auth failed. Using fallback ID.");
    // Replace with your real User ID from Supabase
    user = { id: '41162d70-c555-4503-b84a-c925380d4f2c' } as any;
  }

  try {
    const { message, sessionId } = await request.json();
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    // 3. Ensure Session Exists
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert({ user_id: user!.id, topic: 'General Chat' })
        .select('id')
        .single();
      
      if (error) throw error;
      currentSessionId = session.id;
    }

    // 4. Save User Message
    await supabase.from('chat_messages').insert({
      session_id: currentSessionId,
      sender: 'user',
      message_text: message,
    });

    // 5. Start OpenAI Stream
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      stream: true,
      messages: [
        {
          role: 'system',
          content: `You are an AI tutor.
                    
                    IMPORTANT RULE: 
                    If the user explicitly asks to learn a NEW topic (e.g., "Teach me Python", "I want to learn React"), 
                    you MUST ask for confirmation to create a Mastery Track.
                    
                    To do this, you MUST output a special tag in your response: [CONFIRM_MASTERY: <Topic_Name>].
                    Example: "Sure! [CONFIRM_MASTERY: Python] Should I create a mastery track for Python?"
                    
                    For normal chat, just reply normally.
                    `,
        },
        { role: 'user', content: message },
      ],
    });

    // 6. Create a ReadableStream to pipe data to frontend
    const encoder = new TextEncoder();
    let fullAiResponse = ''; // We will collect text here to save to DB later

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullAiResponse += content;
              // Send chunk to frontend
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          // Stream finished: Save full response to Database
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

    // 7. Return Response with Header
    // We send currentSessionId in a header so frontend can grab it immediately
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'x-session-id': currentSessionId, 
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}