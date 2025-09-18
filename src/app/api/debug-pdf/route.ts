import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Convert File to Buffer for pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse PDF and extract text
    const data = await pdf(buffer);
    const text = data.text;
    
    // Return the raw extracted text for debugging
    return NextResponse.json({
      filename: file.name,
      pages: data.numpages,
      textLength: text.length,
      rawText: text,
      first500Chars: text.substring(0, 500),
      last500Chars: text.substring(text.length - 500)
    });
    
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF file for debugging.' },
      { status: 500 }
    );
  }
} 