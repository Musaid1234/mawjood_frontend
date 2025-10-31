import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// src/middleware.ts (already correct)
export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value;
    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  
    if (isDashboard && !token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  
    return NextResponse.next();
  }
  
  export const config = {
    matcher: ['/dashboard/:path*'],
  };