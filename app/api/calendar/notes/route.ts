import { NextResponse } from 'next/server';
import { saveCalendarNote } from '@/lib/server/courseStore';

export async function POST(req: Request) {
  try {
    const body = await req.json(); // Expects { date: 'YYYY-MM-DD', note: 'string' }
    await saveCalendarNote(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
  }
}