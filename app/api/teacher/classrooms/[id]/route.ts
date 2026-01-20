import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/* -------------------- SUPABASE HELPERS -------------------- */

async function createSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }: any) => {
                cookieStore.set({
                  name,
                  value,
                  ...options,
                });
              }
            );
          } catch {}
        },
      },
    }
  );
}

/* ---------------------------------------------------------
   GET: Fetch single classroom
---------------------------------------------------------- */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params; // ✅ REQUIRED in Next 16

    const supabase = await createSupabase();

    const { data: classroom, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!classroom) {
      return NextResponse.json(
        { error: 'Classroom not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(classroom);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
