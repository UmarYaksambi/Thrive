import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 300; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PASTEL_COLORS = [
  // Lavender / Purple
  '#be94f5', '#d7c6f7', '#cdb4db', '#e0bbff', '#ede7f6', '#f3e8ff',

  // Pink / Rose
  '#ff9aa2', '#ffb7b2', '#ffc9de', '#f1c0e8', '#f8cdda', '#fde2e4',

  // Peach / Coral
  '#ffd6a5', '#ffdfba', '#ffe5b4', '#fcd5ce', '#f8edeb',

  // Yellow / Cream
  '#fccc42', '#fff1b6', '#fff3bf', '#fef9c3', '#faedcd',

  // Mint / Green
  '#b5ead7', '#caffbf', '#d9f8c4', '#e2f0cb', '#e8f5e9', '#dcfce7',

  // Teal / Aqua
  '#a8d8ea', '#bde0fe', '#cce3f6', '#d0f4ff', '#e0fbfc',

  // Blue / Sky
  '#cfe1f3', '#dbeafe', '#e0e7ff', '#eef2ff',

  // Neutrals / Soft Accents
  '#f1f5f9', '#f5f5f5', '#f7ede2', '#f8fafc', '#f3f4f6',
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const lang = searchParams.get('lang');
  const diff = searchParams.get('diff');
  const type = searchParams.get('type');

  let query = supabase
    .from('library_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`title.ilike.%${search}%,creator.ilike.%${search}%,tags.cs.{${search}}`);
  }

  if (lang && lang !== 'All Languages') {
    query = query.eq('language', lang);
  }
  
  if (diff && diff !== 'All Difficulties') {
    query = query.eq('difficulty', diff);
  }
  
  if (type && type !== 'All') {
    const typeMap: Record<string, string> = { 
      'Videos': 'video', 
      'Articles': 'article', 
      'PDFs': 'pdf', 
      'Blogs': 'blog' 
    };
    if (typeMap[type]) {
      query = query.eq('type', typeMap[type]);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Supabase Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const creator = formData.get('creator') as string;
    const type = formData.get('type') as string;
    const difficulty = formData.get('difficulty') as string;
    const language = formData.get('language') as string;
    const tags = (formData.get('tags') as string)
      ?.split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0) || [];

    const file = formData.get('file') as File | null;
    let resourceUrl = formData.get('url') as string;

    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from('library_assets')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Storage Upload Failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('library_assets')
        .getPublicUrl(fileName);
        
      resourceUrl = publicUrlData.publicUrl;
    }

    const { data, error: dbError } = await supabase
      .from('library_items')
      .insert({
        title,
        creator,
        type,
        difficulty,
        language,
        tags,
        resource_url: resourceUrl,
        thumbnail_color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database Insert Failed: ${dbError.message}`);
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}