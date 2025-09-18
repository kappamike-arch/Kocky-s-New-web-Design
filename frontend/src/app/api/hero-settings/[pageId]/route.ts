import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const { pageId } = params;
    
    // Proxy the request to the backend API
    const backendUrl = `https://staging.kockys.com/api/hero-settings/${pageId}`;
    
    const response = await fetch(backendUrl, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
      },
      cache: 'no-store' // Ensure no caching at Next.js level
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch from backend' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Add no-cache headers to response
    const responseHeaders = new Headers({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    return NextResponse.json(data, { headers: responseHeaders });
    
  } catch (error) {
    console.error('Frontend API proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
