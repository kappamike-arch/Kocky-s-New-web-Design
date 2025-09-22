#!/usr/bin/env node

/**
 * Office 365 Email Service Test Script
 * 
 * This script tests the Office 365 OAuth2 authentication and email sending
 */

require('dotenv').config();

async function testOffice365Email() {
  console.log('🧪 Testing Office 365 Email Service...\n');

  try {
    // Import the services
    const { testOffice365Service, getOffice365Status, sendEmail } = require('./dist/utils/email');

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

    // Test authentication and service
    console.log('🔐 Testing Office 365 Authentication...');
    const authTest = await testOffice365Service();
    
    if (!authTest) {
      console.log('❌ Office 365 authentication test failed!');
      console.log('Please check your credentials and permissions.');
      return;
    }

    console.log('✅ Office 365 authentication test passed!\n');

    // Get service status
    const status = getOffice365Status();
    console.log('📊 Service Status:');
    console.log(`   Configured: ${status.configured ? '✅' : '❌'}`);
    console.log(`   From Email: ${status.fromEmail}`);
    console.log(`   From Name: ${status.fromName}`);
    console.log(`   Has Token: ${status.tokenInfo.hasToken ? '✅' : '❌'}`);
    console.log(`   Token Expires In: ${Math.round(status.tokenInfo.expiresIn / 1000)} seconds\n`);

    // Test sending a reservation email
    console.log('📧 Testing Reservation Email...');
    
    const testEmailSent = await sendEmail({
      to: 'test@example.com', // Change this to your email for testing
      subject: 'Test Reservation - Office 365 Integration',
      template: 'reservation-confirmation',
      data: {
        name: 'Test Customer',
        date: '2024-12-25',
        time: '19:00',
        partySize: 4,
        confirmationCode: 'TEST123',
      },
    });

    if (testEmailSent) {
      console.log('✅ Test email sent successfully via Office 365!');
    } else {
      console.log('❌ Test email failed to send');
    }

    console.log('\n🎉 Office 365 email service test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. If tests passed, restart your backend server');
    console.log('2. Test reservation endpoint with real email addresses');
    console.log('3. Check that emails are received at info@kockysbar.com');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testOffice365Email().catch(console.error);
