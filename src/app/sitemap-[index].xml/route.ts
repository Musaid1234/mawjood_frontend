import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Extract index from URL pathname since Next.js doesn't recognize [index] in folder name
    const url = new URL(request.url);
    const pathname = url.pathname;
    const match = pathname.match(/\/sitemap-([^/]+)\.xml$/);
    const index = match ? match[1] : '';
    
    if (!index) {
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

