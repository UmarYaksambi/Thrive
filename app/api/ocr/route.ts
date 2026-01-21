import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Use Gemini 1.5 Flash for fast OCR
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    // Fetch the image from the URL
    const imageResp = await fetch(imageUrl);
    const imageData = await imageResp.arrayBuffer();

    const result = await model.generateContent([
      'Extract all handwritten or printed text from this image. Only return the extracted text, no explanations.',
      {
        inlineData: {
          data: Buffer.from(imageData).toString('base64'),
          mimeType: 'image/jpeg', // Assuming jpeg, could be improved to detect
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('OCR Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
