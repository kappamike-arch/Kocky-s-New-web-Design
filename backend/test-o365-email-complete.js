#!/usr/bin/env node

/**
 * Complete Office 365 Email Service Test
 * 
 * This script tests the Office 365 email service with the new client secret
 * and sends test emails to Kappamike@gmail.com and info@kockys.com
 */

require('dotenv').config();

async function testOffice365EmailService() {
  console.log('🧪 Testing Complete Office 365 Email Service...\n');

  try {
    // Import the Office 365 services
    const o365AuthService = require('./dist/services/o365AuthService').default;
    const o365EmailService = require('./dist/services/o365EmailService').default;

    // Check configuration
    console.log('📋 Configuration Check:');
    console.log(`   Client ID: ${process.env.O365_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`   Tenant ID: ${process.env.O365_TENANT_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`   Client Secret: ${process.env.O365_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`   From Email: ${process.env.O365_FROM_EMAIL || '❌ Missing'}\n`);

    if (!process.env.O365_CLIENT_ID || !process.env.O365_TENANT_ID || !process.env.O365_CLIENT_SECRET) {
      console.log('❌ Office 365 credentials not properly configured!');
      console.log('Please check your .env file and ensure all O365_* variables are set.');
      return;
    }

    // Test authentication
    console.log('🔐 Testing Office 365 Authentication...');
    const authTest = await o365AuthService.getAccessToken();
    
    if (!authTest) {
      console.log('❌ Office 365 authentication test failed!');
      return;
    }

    console.log('✅ Office 365 authentication test passed!');
    console.log(`   Access token obtained: ${authTest.substring(0, 20)}...`);
    
    // Get token info
    const tokenInfo = o365AuthService.getTokenInfo();
    console.log(`   Token expires in: ${Math.round(tokenInfo.expiresIn / 1000)} seconds\n`);

    // Test email service
    console.log('📧 Testing Office 365 Email Service...');
    const emailTest = await o365EmailService.testEmailService();
    
    if (!emailTest) {
      console.log('❌ Office 365 email service test failed!');
      return;
    }

    console.log('✅ Office 365 email service test passed!\n');

    // Test sending emails to Kappamike@gmail.com
    const testEmail = 'Kappamike@gmail.com';
    console.log(`📧 Testing Email Sending to: ${testEmail}\n`);

    // Test 1: Simple test email
    console.log('1️⃣ Sending Simple Test Email...');
    const simpleTestResult = await o365EmailService.sendEmail({
      to: testEmail,
      subject: 'Office 365 Email Service Test - Kocky\'s Bar & Grill',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #b22222; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🧪 Email Service Test</h1>
          </div>
          <div style="padding: 20px; background-color: #f5f5f5; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello Mike!</p>
            <p style="font-size: 16px; margin-bottom: 20px;">This is a test email from the Office 365 email service for Kocky's Bar & Grill website.</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b22222;">
              <h3 style="margin-top: 0; color: #b22222;">Test Details</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 10px 0; font-size: 16px;"><strong>📧 Service:</strong> Office 365 Graph API</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>🔐 Auth:</strong> OAuth2 Client Credentials</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>📅 Date:</strong> ${new Date().toLocaleString()}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>✅ Status:</strong> Working Perfectly!</li>
              </ul>
            </div>
            <p style="font-size: 16px; margin-bottom: 20px;">The email service is now ready to send transactional emails for all inquiry systems!</p>
            <p style="font-size: 16px;">Best regards,<br><strong>The Kocky's Development Team</strong></p>
          </div>
        </div>
      `,
    });

    console.log(`   Result: ${simpleTestResult ? '✅ SUCCESS' : '❌ FAILED'}\n`);

    // Test 2: Admin notification email
    console.log('2️⃣ Sending Admin Notification Test...');
    const adminTestResult = await o365EmailService.sendEmail({
      to: 'info@kockys.com',
      subject: 'Office 365 Email Service Test - Admin Notification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #b22222; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🔔 Admin Test Notification</h1>
          </div>
          <div style="padding: 20px; background-color: #f5f5f5; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">This is a test admin notification email from the Office 365 email service.</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b22222;">
              <h3 style="margin-top: 0; color: #b22222;">Service Status</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 10px 0; font-size: 16px;"><strong>📧 Email Service:</strong> Office 365 Graph API</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>🔐 Authentication:</strong> OAuth2 Working</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>📅 Test Date:</strong> ${new Date().toLocaleString()}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>✅ Status:</strong> All Systems Operational</li>
              </ul>
            </div>
            <p style="font-size: 16px; margin-bottom: 20px;">The email service is ready to handle all inquiry notifications!</p>
          </div>
        </div>
      `,
    });

    console.log(`   Result: ${adminTestResult ? '✅ SUCCESS' : '❌ FAILED'}\n`);

    // Test 3: Reservation confirmation email
    console.log('3️⃣ Sending Reservation Confirmation Test...');
    const reservationTestResult = await o365EmailService.sendEmail({
      to: testEmail,
      subject: 'Reservation Confirmation Test - Kocky\'s Bar & Grill',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #b22222; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Reservation Confirmed!</h1>
          </div>
          <div style="padding: 20px; background-color: #f5f5f5; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi Mike,</p>
            <p style="font-size: 16px; margin-bottom: 20px;">This is a test reservation confirmation email from the Office 365 email service.</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b22222;">
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 10px 0; font-size: 16px;"><strong>📅 Date:</strong> ${new Date().toLocaleDateString()}</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>🕐 Time:</strong> 19:00</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>👥 Party Size:</strong> 4 guests</li>
                <li style="margin: 10px 0; font-size: 16px;"><strong>🎫 Confirmation Code:</strong> <span style="color: #b22222; font-weight: bold; font-size: 18px;">TEST1234</span></li>
              </ul>
            </div>
            <p style="font-size: 16px; margin-bottom: 20px;">This confirms that the reservation email system is working perfectly!</p>
            <p style="font-size: 16px;">Best regards,<br><strong>The Kocky's Team</strong></p>
          </div>
        </div>
      `,
    });

    console.log(`   Result: ${reservationTestResult ? '✅ SUCCESS' : '❌ FAILED'}\n`);

    // Summary
    console.log('🎉 Office 365 Email Service Test Summary:');
    console.log('==========================================');
    console.log(`✅ Authentication: ${authTest ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Email Service: ${emailTest ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Simple Test Email: ${simpleTestResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Admin Notification: ${adminTestResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Reservation Confirmation: ${reservationTestResult ? 'PASSED' : 'FAILED'}\n`);

    const allPassed = authTest && emailTest && simpleTestResult && adminTestResult && reservationTestResult;

    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('📧 Office 365 Email Service is fully operational!');
      console.log(`📧 Test emails sent to: ${testEmail}`);
      console.log('📧 Test emails sent to: info@kockys.com');
      console.log('\n📝 The email service is now ready to handle:');
      console.log('   - Reservation confirmations');
      console.log('   - Contact form notifications');
      console.log('   - Job application confirmations');
      console.log('   - Catering/event inquiries');
      console.log('   - All admin notifications');
    } else {
      console.log('⚠️ Some tests failed. Please check the Office 365 configuration.');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testOffice365EmailService().catch(console.error);

