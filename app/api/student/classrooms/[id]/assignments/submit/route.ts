import { NextRequest, NextResponse } from 'next/server';
import {
  createClient,
  getSafeUser,
} from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// POST: Submit an assignment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: classroomId } = await params;
    const user = await getSafeUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { assignment_id, file_url } = body;
    let { ocr_text } = body;

    // Trigger OCR if it's an image or PDF and ocr_text isn't provided
    const isImage = /\.(jpg|jpeg|png|webp)$/i.test(
      file_url
    );
    const isPDF = /\.pdf$/i.test(file_url);

    if ((isImage || isPDF) && !ocr_text) {
      try {
        const genAI = new GoogleGenerativeAI(
          process.env.GEMINI_API_KEY!
        );
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash-exp',
        });

        const imageResp = await fetch(file_url);
        const imageData = await imageResp.arrayBuffer();

        const result = await model.generateContent([
          'Extract all handwritten or printed text from this file. Only return the extracted text, no explanations.',
          {
            inlineData: {
              data: Buffer.from(imageData).toString(
                'base64'
              ),
              mimeType: isPDF
                ? 'application/pdf'
                : 'image/jpeg',
            },
          },
        ]);

        const response = await result.response;
        ocr_text = response.text();
      } catch (ocrError) {
        console.error('Auto-OCR Failed:', ocrError);
      }
    }

    const supabase = await createClient();

    // Verify student is member of the classroom
    const { data: membership, error: memError } =
      await supabase
        .from('classroom_members')
        .select('id')
        .eq('classroom_id', classroomId)
        .eq('user_id', user.id)
        .single();

    if (memError || !membership) {
      return NextResponse.json(
        {
          error:
            'Forbidden: You are not a member of this classroom',
        },
        { status: 403 }
      );
    }

    // Upsert submission (handle unique constraint on assignment_id, student_id)
    const { data: submission, error: subError } =
      await supabase
        .from('assignment_submissions')
        .upsert(
          {
            assignment_id,
            student_id: user.id,
            file_url,
            ocr_text,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
          },
          {
            onConflict: 'assignment_id,student_id',
          }
        )
        .select()
        .single();

    if (subError) {
      return NextResponse.json(
        { error: subError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(submission);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
