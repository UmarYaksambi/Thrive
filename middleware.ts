import { createServerClient } from '@supabase/ssr';
import {
  NextResponse,
  type NextRequest,
} from 'next/server';

// Authenticated routes
const protectedRoutes = [
  '/dashboard',
  '/chat',
  '/library',
  '/planner',
  '/calendar',
  '/settings',
  '/course',
  '/admin',
  '/teacher',
];

// Public routes
const publicRoutes = [
  '/',
  '/downloads',
  '/login',
  '/admin/login',
  '/admin/signup',
];

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const path = request.nextUrl.pathname;

  if (
    publicRoutes.some(
      (route) =>
        path === route || path.startsWith(route + '/')
    )
  ) {
    if (
      path === '/admin/login' ||
      path === '/admin/signup'
    ) {
      return res;
    }
    if (path === '/' || path === '/login') {
      return res;
    }
  }

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      path === route || path.startsWith(route + '/')
  );

  if (!isProtectedRoute) {
    return res;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value, options }: any) => {
              res.cookies.set(name, value, options);
            }
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // === GLOBAL AUTH CHECK ===
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', path);
    return NextResponse.redirect(url);
  }

  // === ROLE-BASED PROTECTION ===

  // 1. Admin Routes Protection (stricter)
  if (
    path.startsWith('/admin') &&
    !path.startsWith('/admin/signup') &&
    !path.startsWith('/admin/login')
  ) {
    const { data: role, error: roleError } =
      await supabase.rpc('get_user_role');

    if (
      roleError ||
      !['admin', 'supervisor'].includes(String(role || ''))
    ) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  // 2. Teacher Routes Protection
  if (path.startsWith('/teacher')) {
    const { data: role, error: roleError } =
      await supabase.rpc('get_user_role');

    // Teachers AND Admins/Supervisors can access teacher routes
    if (
      roleError ||
      !['teacher', 'admin', 'supervisor'].includes(
        String(role || '')
      )
    ) {
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
