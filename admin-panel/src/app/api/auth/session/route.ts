import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/api/auth';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated using the custom auth system
    const isAuthenticated = auth.isAuthenticated();
    
    if (!isAuthenticated) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Get user data from localStorage (this will be empty on server side)
    // For now, return a basic response
    return NextResponse.json({ 
      user: { 
        id: '1', 
        email: 'admin@kockys.com', 
        role: 'ADMIN' 
      } 
    }, { status: 200 });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}







