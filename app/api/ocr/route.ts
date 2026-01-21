import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, fileUrl } = await req.json();
    const targetUrl = fileUrl || imageUrl;

    if (!targetUrl) {
      return NextResponse.json(
        { error: 'File/Image URL is required' },
        { status: 400 }
      );
    }

    const isPDF = /\.pdf$/i.test(targetUrl);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
    });

    // Fetch the file from the URL
    const fileResp = await fetch(targetUrl);
    const fileData = await fileResp.arrayBuffer();

    const result = await model.generateContent([
      'Extract all handwritten or printed text from this file. Only return the extracted text, no explanations.',
      {
        inlineData: {
          data: Buffer.from(fileData).toString('base64'),
          mimeType: isPDF
            ? 'application/pdf'
            : 'image/jpeg',
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('OCR API Error Detail:', {
      message: error.message,
      status: error.status,
      name: error.name,
    });
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
