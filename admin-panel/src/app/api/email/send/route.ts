import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html } = await request.json();
    
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    // For now, just log the email data
    // In a real implementation, you'd integrate with your email service
    console.log('📧 Test Email Request:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML Length:', html.length);
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      to,
      subject
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
