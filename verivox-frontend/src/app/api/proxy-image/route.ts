import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Proxy image error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
