import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value;
    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
    const isAdmin = request.nextUrl.pathname.startsWith('/admin');
  
    if ((isDashboard || isAdmin) && !token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  
    return NextResponse.next();
  }
  
  export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*'],
  };