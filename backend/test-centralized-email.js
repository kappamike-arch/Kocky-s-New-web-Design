#!/usr/bin/env node

/**
 * Centralized Email Service Test Script
 * 
 * This script tests the centralized Office 365 email service for all inquiry systems:
 * - Reservations
 * - Contact inquiries
 * - Job applications
 * - Catering/Events
 */

require('dotenv').config();

async function testCentralizedEmailService() {
  console.log('🧪 Testing Centralized Office 365 Email Service...\n');

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

    // Test authentication and service
    console.log('🔐 Testing Office 365 Authentication...');
    const authTest = await centralizedEmailService.testEmailService();
    
    if (!authTest) {
      console.log('❌ Office 365 authentication test failed!');
      console.log('Please check your credentials and permissions.');
      return;
    }

    console.log('✅ Office 365 authentication test passed!\n');

    // Get service status
    const status = centralizedEmailService.getServiceStatus();
    console.log('📊 Service Status:');
    console.log(`   Configured: ${status.configured ? '✅' : '❌'}`);
    console.log(`   From Email: ${status.fromEmail}`);
    console.log(`   From Name: ${status.fromName}`);
    console.log(`   Has Token: ${status.hasToken ? '✅' : '❌'}`);
    console.log(`   Token Expires In: ${Math.round(status.tokenExpiresIn / 1000)} seconds\n`);

    // Test all inquiry types
    console.log('📧 Testing All Inquiry Types...\n');

    // Test 1: Reservation
    console.log('1️⃣ Testing Reservation Email...');
    const reservationData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-123-4567',
      eventDate: '2024-12-25',
      eventTime: '19:00',
      guestCount: 4,
      specialRequests: 'Window table please',
      confirmationCode: 'RES123456',
    };

    const reservationResults = await centralizedEmailService.sendInquiryEmails('reservation', reservationData, 'john@example.com');
    console.log(`   Admin Email: ${reservationResults.adminSent ? '✅ Sent' : '❌ Failed'}`);
    console.log(`   Customer Email: ${reservationResults.customerSent ? '✅ Sent' : '❌ Failed'}\n`);

    // Test 2: Contact
    console.log('2️⃣ Testing Contact Email...');
    const contactData = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '555-987-6543',
      subject: 'General Inquiry',
      message: 'I would like to know about your catering services.',
    };

    const contactResults = await centralizedEmailService.sendInquiryEmails('contact', contactData, 'jane@example.com');
    console.log(`   Admin Email: ${contactResults.adminSent ? '✅ Sent' : '❌ Failed'}`);
    console.log(`   Customer Email: ${contactResults.customerSent ? '✅ Sent' : '❌ Failed'}\n`);

    // Test 3: Job Application
    console.log('3️⃣ Testing Job Application Email...');
    const jobData = {
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '555-456-7890',
      position: 'Server',
      coverLetter: 'I have 3 years of experience in the restaurant industry.',
      resume: 'mike_johnson_resume.pdf',
    };

    const jobResults = await centralizedEmailService.sendInquiryEmails('job', jobData, 'mike@example.com');
    console.log(`   Admin Email: ${jobResults.adminSent ? '✅ Sent' : '❌ Failed'}`);
    console.log(`   Customer Email: ${jobResults.customerSent ? '✅ Sent' : '❌ Failed'}\n`);

    // Test 4: Catering/Event
    console.log('4️⃣ Testing Catering/Event Email...');
    const cateringData = {
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      phone: '555-321-0987',
      eventType: 'Corporate Event',
      eventDate: '2024-12-31',
      guestCount: 50,
      location: 'Downtown Conference Center',
      budget: '$2000',
      specialRequests: 'Vegetarian options required',
    };

    const cateringResults = await centralizedEmailService.sendInquiryEmails('catering', cateringData, 'sarah@example.com');
    console.log(`   Admin Email: ${cateringResults.adminSent ? '✅ Sent' : '❌ Failed'}`);
    console.log(`   Customer Email: ${cateringResults.customerSent ? '✅ Sent' : '❌ Failed'}\n`);

    // Summary
    console.log('🎉 Centralized Email Service Test Summary:');
    console.log('==========================================');
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
      console.log('🎉 ALL TESTS PASSED! Centralized email service is working perfectly!');
      console.log('\n📝 Next steps:');
      console.log('1. Restart your backend server');
      console.log('2. Test the actual inquiry forms on your website');
      console.log('3. Check that emails are received at info@kockys.com');
    } else {
      console.log('⚠️ Some tests failed. Please check the Office 365 configuration.');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testCentralizedEmailService().catch(console.error);
