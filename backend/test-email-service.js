#!/usr/bin/env node

/**
 * Email Service Test Script
 * 
 * This script tests the email service configuration
 * Run this after updating your .env file with email credentials
 */

const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

async function testEmailService() {
  console.log('🧪 Testing Email Service Configuration...\n');

  // Check SendGrid configuration
  const hasValidSendGrid = process.env.SENDGRID_API_KEY && 
    process.env.SENDGRID_API_KEY !== 'SG.your-sendgrid-api-key-here' &&
    process.env.SENDGRID_API_KEY.startsWith('SG.');

  // Check SMTP configuration
  const hasValidSMTP = process.env.SMTP_HOST && 
    process.env.SMTP_USER && 
    process.env.SMTP_PASS &&
    process.env.SMTP_USER !== 'your-email@gmail.com' &&
    process.env.SMTP_PASS !== 'your-app-specific-password';

  console.log('📋 Configuration Status:');
  console.log(`   SendGrid: ${hasValidSendGrid ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   SMTP: ${hasValidSMTP ? '✅ Configured' : '❌ Not configured'}\n`);

  if (!hasValidSendGrid && !hasValidSMTP) {
    console.log('❌ No email service configured!');
    console.log('\n🔧 To fix:');
    console.log('1. Get SendGrid API key from: https://sendgrid.com');
    console.log('2. Or configure Gmail SMTP with app password');
    console.log('3. Update .env file with credentials');
    console.log('4. Restart the server');
    return;
  }

  // Test SendGrid
  if (hasValidSendGrid) {
    console.log('📧 Testing SendGrid...');
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      const msg = {
        to: 'test@example.com',
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || 'noreply@kockysbar.com',
          name: process.env.SENDGRID_FROM_NAME || "Kocky's Bar & Grill",
        },
        subject: 'Test Email from Kocky\'s Bar & Grill',
        text: 'This is a test email to verify SendGrid configuration.',
        html: '<p>This is a test email to verify SendGrid configuration.</p>',
      };

      await sgMail.send(msg);
      console.log('✅ SendGrid test successful!');
    } catch (error) {
      console.log('❌ SendGrid test failed:', error.message);
    }
  }

  // Test SMTP
  if (hasValidSMTP) {
    console.log('📧 Testing SMTP...');
    try {
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false
        },
        requireTLS: true,
      });

      await transporter.verify();
      console.log('✅ SMTP connection verified!');

      // Send test email
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || "Kocky's Bar & Grill"}" <${process.env.SMTP_USER}>`,
        to: 'test@example.com',
        subject: 'Test Email from Kocky\'s Bar & Grill',
        text: 'This is a test email to verify SMTP configuration.',
        html: '<p>This is a test email to verify SMTP configuration.</p>',
      });

      console.log('✅ SMTP test email sent!');
    } catch (error) {
      console.log('❌ SMTP test failed:', error.message);
    }
  }

  console.log('\n🎉 Email service test completed!');
  console.log('\n📝 Next steps:');
  console.log('1. If tests passed, restart your backend server');
  console.log('2. Test reservation endpoint with real email addresses');
  console.log('3. Check logs for email delivery confirmations');
}

// Run the test
testEmailService().catch(console.error);

