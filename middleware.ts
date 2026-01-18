import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/chat',
  '/library',
  '/planner',
  '/calendar',
  '/settings',
  '/downloads',
  '/course',
  '/admin',
  '/teacher',
];

// Routes that are always public (no auth required)
const publicRoutes = [
  '/',
  '/login',
  '/admin/login',
  '/admin/signup',
];

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const path = request.nextUrl.pathname;

  // Skip middleware for public routes
  if (publicRoutes.some(route => path === route || path.startsWith(route + '/'))) {
    // Exception: /admin/login and /admin/signup are public, but /admin itself is not
    if (path === '/admin/login' || path === '/admin/signup') {
      return res;
    }
    if (path === '/' || path === '/login') {
      return res;
    }
  }

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    path === route || path.startsWith(route + '/')
  );

  if (!isProtectedRoute) {
    return res; // Allow other routes (like API, static files, etc.)
  }

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }: any) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // === GLOBAL AUTH CHECK ===
  // If user is not logged in and trying to access a protected route, redirect to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', path);
    return NextResponse.redirect(url);
  }

  // === ROLE-BASED PROTECTION ===

  // 1. Admin Routes Protection (stricter)
  if (path.startsWith('/admin') && !path.startsWith('/admin/signup') && !path.startsWith('/admin/login')) {
    const { data: role, error: roleError } = await supabase.rpc('get_user_role');

    if (roleError || !['admin', 'supervisor'].includes(String(role || ''))) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  // 2. Teacher Routes Protection
  if (path.startsWith('/teacher')) {
    const { data: role, error: roleError } = await supabase.rpc('get_user_role');

    // Teachers AND Admins/Supervisors can access teacher routes
    if (roleError || !['teacher', 'admin', 'supervisor'].includes(String(role || ''))) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|api).*)',
  ],
};

