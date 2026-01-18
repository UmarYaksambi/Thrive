import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch library items for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const search = searchParams.get('search') || '';

    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }: any) => {
                cookieStore.set({ name, value, ...options });
              });
            } catch {
              // Ignored
            }
          },
        },
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = roles?.some(r => r.role === 'admin' || r.role === 'supervisor');

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use service role to fetch all documents
    const serviceSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return []; },
          setAll() { },
        },
      }
    );

    let query = serviceSupabase
      .from('library_items')
      .select(`
        *,
        profile:profiles!submitted_by(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }

    return NextResponse.json({ documents: data || [] });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { documentId, action, rejectionReason } = await request.json();

    if (!documentId || !action) {
      return NextResponse.json({ error: 'Missing documentId or action' }, { status: 400 });
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 });
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }: any) => {
                cookieStore.set({ name, value, ...options });
              });
            } catch {
              // Ignored in server context
            }
          },
        },
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - not logged in' }, { status: 401 });
    }

    // Verify user has admin or supervisor role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = roles?.some(r => r.role === 'admin' || r.role === 'supervisor');

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - admin role required' }, { status: 403 });
    }

    // Perform the update using service role to bypass RLS
    const serviceSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return []; },
          setAll() { },
        },
      }
    );

    const updateData = action === 'approve'
      ? {
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        rejection_reason: null,
      }
      : {
        status: 'rejected',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
      };

    const { data, error } = await serviceSupabase
      .from('library_items')
      .update(updateData)
      .eq('id', documentId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Document ${action}d successfully`,
      document: data
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
