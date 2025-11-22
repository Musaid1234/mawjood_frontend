import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Extract the index from the pathname (e.g., "1" from "/sitemap-chunk?index=1")
    // Or from the referer/request path
    const searchParams = url.searchParams;
    let index = searchParams.get('index');
    
    // If not in query, try to extract from referer or path
    if (!index) {
      const referer = request.headers.get('referer');
      if (referer) {
        const match = referer.match(/sitemap-(\d+)\.xml/);
        if (match) {
          index = match[1];
        }
      }
    }
    
    // Fallback: try to get from the request URL if it was rewritten
    if (!index && pathname.includes('sitemap')) {
      const pathMatch = pathname.match(/sitemap-?(\d+)/);
      if (pathMatch) {
        index = pathMatch[1];
      }
    }
    
    if (!index || !/^\d+$/.test(index)) {
      return new NextResponse('Invalid sitemap index', { status: 400 });
    }
    
    // Fetch sitemap chunk from backend API
    const response = await fetch(`${API_BASE_URL}/sitemap-${index}.xml`, {
      next: { revalidate: 3600 }, // Revalidate every hour
      headers: {
        'Content-Type': 'application/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend sitemap chunk API returned ${response.status}`);
    }

    const xml = await response.text();

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error(`Error fetching sitemap chunk from backend:`, error);
    return new NextResponse('Sitemap chunk not found', { status: 404 });
  }
}

