const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('🧪 Testing email configuration...');
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    // Test connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Send test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM_DEFAULT || 'test@example.com',
      to: 'test@example.com', // Change this to your email
      subject: 'Kocky\'s Email Marketing Test',
      html: `
        <h1>🎉 Email Marketing System Test</h1>
        <p>This is a test email from Kocky's email marketing system!</p>
        <p>If you receive this, the SMTP configuration is working correctly.</p>
        <hr>
        <p><small>Kocky's Bar & Grill - Email Marketing System</small></p>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check SMTP credentials in .env file');
    console.log('2. For Gmail: Enable 2FA and use App Password');
    console.log('3. For other providers: Check SMTP settings');
  }
}

testEmail();




