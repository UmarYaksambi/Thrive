import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use ANON key since you disabled RLS (or Service Role if you kept it private)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PASTEL_COLORS = ['#be94f5', '#fccc42', '#a8d8ea', '#ff9aa2', '#e2f0cb', '#b5ead7'];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const lang = searchParams.get('lang');
  const diff = searchParams.get('diff');
  const type = searchParams.get('type');

  let query = supabase.from('library_items').select('*').order('created_at', { ascending: false });

  // 1. Improved Search: Checks Title OR Creator OR if Tags contain the term
  if (search) {
    // Note: 'cs' means "contains" for arrays, 'ilike' is case-insensitive text match
    // This creates an OR condition: Title matches OR Creator matches OR Tags array contains the search term
    query = query.or(`title.ilike.%${search}%,creator.ilike.%${search}%,tags.cs.{${search}}`);
  }

  if (lang && lang !== 'All Languages') query = query.eq('language', lang);
  if (diff && diff !== 'All Difficulties') query = query.eq('difficulty', diff);
  
  if (type && type !== 'All') {
    const typeMap: Record<string, string> = { 'Videos': 'video', 'Articles': 'article', 'PDFs': 'pdf', 'Blogs': 'blog' };
    if (typeMap[type]) query = query.eq('type', typeMap[type]);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  // ... (Keep your existing POST logic exactly as it was)
  try {
    const formData = await req.formData();
    // ... extract fields ...
    const title = formData.get('title') as string;
    const creator = formData.get('creator') as string;
    const type = formData.get('type') as string;
    const difficulty = formData.get('difficulty') as string;
    const language = formData.get('language') as string;
    const tags = (formData.get('tags') as string).split(',').map(t => t.trim()).filter(t => t.length > 0); // Clean tags
    const file = formData.get('file') as File | null;
    let resourceUrl = formData.get('url') as string;

    // File handling logic...
    if (type === 'pdf' && file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from('library_assets')
        .upload(fileName, buffer, { contentType: file.type });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

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

    if (dbError) throw new Error(dbError.message);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}