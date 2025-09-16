import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Handle auth logging requests
    // For now, just return success
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Auth log error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}







