import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/image-proxy?url=https://scontent...
 * Proxies Instagram CDN images to avoid CORS/expiry issues.
 * The server fetches the image (server IPs are not blocked) and serves it.
 * Cached for 24h via Cache-Control.
 */
export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get('url');

  if (!imageUrl || !imageUrl.startsWith('http')) {
    return new NextResponse('Missing or invalid url parameter', { status: 400 });
  }

  // Only allow proxying Instagram CDN images
  const allowed = ['cdninstagram.com', 'fbcdn.net', 'instagram.com', 'scontent'];
  const isAllowed = allowed.some(domain => imageUrl.includes(domain));
  if (!isAllowed) {
    return new NextResponse('URL not allowed', { status: 403 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CriadoresBot/1.0)',
      },
    });

    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24h cache
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
