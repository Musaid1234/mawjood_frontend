import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RESERVED_SLUGS = new Set([
  '',
  'about',
  'blog',
  'businesses',
  'categories',
  'contact',
  'dashboard',
  'admin',
  'privacy',
  'profile',
  'support',
  'terms',
  'favourites',
  'sitemap.xml',
]);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function middleware(request: NextRequest) {
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

  const singleSegment = pathname.match(/^\/([^\/]+)\/?$/);
  if (singleSegment) {
    const slug = decodeURIComponent(singleSegment[1]).toLowerCase();
    if (!RESERVED_SLUGS.has(slug) && !slug.includes('.')) {
      const baseUrl = API_BASE_URL || request.nextUrl.origin;
      try {
        const res = await fetch(`${baseUrl}/api/categories/slug/${slug}`, {
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.success) {
            const url = request.nextUrl.clone();
            url.pathname = `/category/${slug}`;
            return NextResponse.rewrite(url);
          }
        }
      } catch (error) {
        console.error('Category rewrite failed:', error);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};