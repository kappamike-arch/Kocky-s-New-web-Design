#!/usr/bin/env node

/**
 * Test Email Service - Send to Kappamike@gmail.com
 * 
 * This script tests the centralized Office 365 email service by sending
 * test emails to Kappamike@gmail.com for all inquiry types.
 */

require('dotenv').config();

async function testEmailToKappamike() {
  console.log('🧪 Testing Email Service - Sending to Kappamike@gmail.com...\n');

  try {
    // Import the centralized email service
    const centralizedEmailService = require('./dist/services/centralizedEmailService').default;

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

    // Test authentication first
    console.log('🔐 Testing Office 365 Authentication...');
    const authTest = await centralizedEmailService.testEmailService();
    
    if (!authTest) {
      console.log('❌ Office 365 authentication test failed!');
      console.log('Please check your credentials and permissions.');
      return;
    }

    console.log('✅ Office 365 authentication test passed!\n');

    // Test all inquiry types with Kappamike@gmail.com
    const testEmail = 'Kappamike@gmail.com';
    console.log(`📧 Testing All Inquiry Types - Sending to: ${testEmail}\n`);

    // Test 1: Reservation
    console.log('1️⃣ Testing Reservation Email...');
    const reservationData = {
      name: 'Mike Kappa',
      email: testEmail,
      phone: '555-123-4567',
      eventDate: '2024-12-25',
      eventTime: '19:00',
      guestCount: 4,
      specialRequests: 'Window table please - testing email service',
      confirmationCode: 'RES123456',
    };

    const reservationResults = await centralizedEmailService.sendInquiryEmails('reservation', reservationData, testEmail);
    console.log(`   Admin Email: ${reservationResults.adminSent ? '✅ Sent' : '❌ Failed'}`);
    console.log(`   Customer Email: ${reservationResults.customerSent ? '✅ Sent' : '❌ Failed'}\n`);

    // Wait a moment between emails
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Contact
    console.log('2️⃣ Testing Contact Email...');
    const contactData = {
      name: 'Mike Kappa',
      email: testEmail,
      phone: '555-987-6543',
      subject: 'Email Service Test',
      message: 'Testing the centralized email service for Kocky\'s website.',
    };

    const contactResults = await centralizedEmailService.sendInquiryEmails('contact', contactData, testEmail);
    console.log(`   Admin Email: ${contactResults.adminSent ? '✅ Sent' : '❌ Failed'}`);
    console.log(`   Customer Email: ${contactResults.customerSent ? '✅ Sent' : '❌ Failed'}\n`);

    // Wait a moment between emails
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Job Application
    console.log('3️⃣ Testing Job Application Email...');
    const jobData = {
      name: 'Mike Kappa',
      email: testEmail,
      phone: '555-456-7890',
      position: 'Server',
      coverLetter: 'Testing the job application email system.',
      resume: 'mike_kappa_resume.pdf',
    };

    const jobResults = await centralizedEmailService.sendInquiryEmails('job', jobData, testEmail);
    console.log(`   Admin Email: ${jobResults.adminSent ? '✅ Sent' : '❌ Failed'}`);
    console.log(`   Customer Email: ${jobResults.customerSent ? '✅ Sent' : '❌ Failed'}\n`);

    // Wait a moment between emails
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 4: Catering/Event
    console.log('4️⃣ Testing Catering/Event Email...');
    const cateringData = {
      name: 'Mike Kappa',
      email: testEmail,
      phone: '555-321-0987',
      eventType: 'Corporate Event',
      eventDate: '2024-12-31',
      guestCount: 50,
      location: 'Downtown Conference Center',
      budget: '$2000',
      specialRequests: 'Testing the catering email system',
    };

    const cateringResults = await centralizedEmailService.sendInquiryEmails('catering', cateringData, testEmail);
    console.log(`   Admin Email: ${cateringResults.adminSent ? '✅ Sent' : '❌ Failed'}`);
    console.log(`   Customer Email: ${cateringResults.customerSent ? '✅ Sent' : '❌ Failed'}\n`);

    // Summary
    console.log('🎉 Email Test Summary for Kappamike@gmail.com:');
    console.log('===============================================');
    console.log(`✅ Authentication: ${authTest ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Reservation Emails: ${reservationResults.adminSent && reservationResults.customerSent ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Contact Emails: ${contactResults.adminSent && contactResults.customerSent ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Job Application Emails: ${jobResults.adminSent && jobResults.customerSent ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Catering/Event Emails: ${cateringResults.adminSent && cateringResults.customerSent ? 'PASSED' : 'FAILED'}\n`);

    const allPassed = authTest && 
                     reservationResults.adminSent && reservationResults.customerSent &&
                     contactResults.adminSent && contactResults.customerSent &&
                     jobResults.adminSent && jobResults.customerSent &&
                     cateringResults.adminSent && cateringResults.customerSent;

    if (allPassed) {
      console.log('🎉 ALL EMAIL TESTS PASSED!');
      console.log(`📧 Emails sent to: ${testEmail}`);
      console.log('📧 Emails sent to: info@kockys.com (admin notifications)');
      console.log('\n📝 Check your email inboxes for:');
      console.log('   - Admin notifications at info@kockys.com');
      console.log(`   - Customer confirmations at ${testEmail}`);
    } else {
      console.log('⚠️ Some email tests failed. Please check the Office 365 configuration.');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testEmailToKappamike().catch(console.error);

