import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value;
    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
    const isAdmin = request.nextUrl.pathname.startsWith('/admin');
    const pathname = request.nextUrl.pathname;
  
    const sitemapMatch = pathname.match(/^\/sitemap-(\d+)\.xml$/);
    if (sitemapMatch) {
      const index = sitemapMatch[1];
      const url = request.nextUrl.clone();
      url.pathname = '/sitemap-chunk';
      url.searchParams.set('index', index);
      return NextResponse.rewrite(url);
    }
  
    if ((isDashboard || isAdmin) && !token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  
    return NextResponse.next();
  }
  
  export const config = {
    // Run middleware on all paths except static files and API routes
    matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - api (API routes)
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       */
      '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
  };