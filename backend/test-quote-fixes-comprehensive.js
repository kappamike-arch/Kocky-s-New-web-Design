#!/usr/bin/env node

/**
 * Comprehensive Quote Email Fixes Test
 * 
 * This script tests all the fixes for the three main issues:
 * 1. PDF attachment
 * 2. Missing quote details
 * 3. Payment link functionality
 */

require('dotenv').config({ path: './.env' });

async function testQuoteFixes() {
  console.log("🧪 TESTING QUOTE EMAIL FIXES");
  console.log("============================\n");

  const results = {
    serverRunning: false,
    quoteRetrieved: false,
    emailSent: false,
    pdfGenerated: false,
    stripeLinkGenerated: false,
    emailDetails: null,
    errors: []
  };

  try {
    // Test 1: Server connectivity
    console.log("1. Testing server connectivity...");
    await testServerConnectivity(results);

    // Test 2: Quote retrieval
    console.log("\n2. Testing quote retrieval...");
    await testQuoteRetrieval(results);

    // Test 3: PDF generation
    console.log("\n3. Testing PDF generation...");
    await testPDFGeneration(results);

    // Test 4: Stripe link generation
    console.log("\n4. Testing Stripe link generation...");
    await testStripeLinkGeneration(results);

    // Test 5: Full email sending
    console.log("\n5. Testing full email sending...");
    await testFullEmailSending(results);

    // Generate test report
    console.log("\n📊 TEST RESULTS SUMMARY");
    console.log("========================");
    generateTestReport(results);

  } catch (error) {
    console.error("❌ Test failed with unexpected error:", error.message);
    results.errors.push(`Unexpected error: ${error.message}`);
  }
}

async function testServerConnectivity(results) {
  try {
    const axios = require('axios');
    const response = await axios.get('http://localhost:5001/api/health', { timeout: 5000 });
    console.log("   ✅ Server is running and responding");
    results.serverRunning = true;
  } catch (error) {
    console.log("   ❌ Server is not responding");
    results.errors.push("Server not responding");
  }
}

async function testQuoteRetrieval(results) {
  try {
    const axios = require('axios');
    const quoteId = "cmfvzmv040024bcmhp9yvuyor";
    
    const response = await axios.get(`http://localhost:5001/api/quotes/${quoteId}`);
    console.log("   ✅ Quote retrieved successfully");
    console.log(`   📋 Quote Number: ${response.data.quoteNumber}`);
    console.log(`   👤 Customer: ${response.data.inquiry?.name}`);
    console.log(`   📧 Email: ${response.data.inquiry?.email}`);
    console.log(`   💰 Amount: $${response.data.amount}`);
    console.log(`   📊 Status: ${response.data.status}`);
    
    results.quoteRetrieved = true;
    results.emailDetails = {
      quoteNumber: response.data.quoteNumber,
      customerName: response.data.inquiry?.name,
      customerEmail: response.data.inquiry?.email,
      amount: response.data.amount
    };
    
  } catch (error) {
    console.log("   ❌ Quote retrieval failed:", error.response?.data?.message || error.message);
    results.errors.push("Quote retrieval failed");
  }
}

async function testPDFGeneration(results) {
  try {
    const { PDFService } = require('./dist/services/pdf.service');
    const pdfService = PDFService.getInstance();
    
    // Create test quote data
    const testQuote = {
      id: "test-pdf",
      quoteNumber: "Q-TEST-PDF-001",
      inquiry: {
        name: "Test Customer",
        email: "test@example.com",
        serviceType: "Catering Services"
      },
      quoteItems: [
        { description: "Catering Package A", quantity: 1, price: 500 },
        { description: "Mobile Bar Service", quantity: 1, price: 300 }
      ],
      amount: 800,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      terms: "Payment due upon acceptance",
      notes: "Thank you for choosing Kocky's!"
    };
    
    const result = await pdfService.generateQuotePDF(testQuote);
    console.log("   ✅ PDF generation successful");
    console.log(`   📄 Generated PDF: ${result.filename}`);
    console.log(`   📊 PDF Size: ${result.buffer.length} bytes`);
    
    results.pdfGenerated = true;
    
  } catch (error) {
    console.log("   ❌ PDF generation failed:", error.message);
    results.errors.push("PDF generation failed");
  }
}

async function testStripeLinkGeneration(results) {
  try {
    const { createQuoteCheckout } = require('./dist/services/stripe/quoteCheckout.service');
    
    const testResult = await createQuoteCheckout({
      quoteId: "test-stripe",
      customerEmail: "test@example.com",
      mode: "deposit",
      title: "Test Quote",
      totalCents: 80000, // $800
      depositPct: 0.2
    });
    
    console.log("   ✅ Stripe checkout link generated");
    console.log(`   🔗 Checkout URL: ${testResult.url}`);
    console.log(`   🆔 Session ID: ${testResult.sessionId}`);
    console.log(`   💰 Amount: $${testResult.amount / 100}`);
    
    results.stripeLinkGenerated = true;
    
  } catch (error) {
    console.log("   ❌ Stripe link generation failed:", error.message);
    results.errors.push("Stripe link generation failed");
  }
}

async function testFullEmailSending(results) {
  try {
    const axios = require('axios');
    const quoteId = "cmfvzmv040024bcmhp9yvuyor";
    
    console.log("   📤 Sending test quote email...");
    const response = await axios.post(`http://localhost:5001/api/quotes/${quoteId}/send`, {
      mode: "deposit"
    }, {
      timeout: 30000
    });
    
    console.log("   ✅ Quote email sent successfully!");
    console.log(`   🔗 Stripe Checkout URL: ${response.data.checkoutUrl}`);
    console.log(`   🆔 Session ID: ${response.data.sessionId}`);
    
    results.emailSent = true;
    
  } catch (error) {
    console.log("   ❌ Email sending failed:", error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log("   📋 Full error response:", JSON.stringify(error.response.data, null, 2));
    }
    results.errors.push("Email sending failed");
  }
}

function generateTestReport(results) {
  const tests = [
    { name: 'Server Connectivity', status: results.serverRunning },
    { name: 'Quote Retrieval', status: results.quoteRetrieved },
    { name: 'PDF Generation', status: results.pdfGenerated },
    { name: 'Stripe Link Generation', status: results.stripeLinkGenerated },
    { name: 'Email Sending', status: results.emailSent }
  ];
  
  tests.forEach(test => {
    const status = test.status ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test.name}`);
  });
  
  if (results.errors.length > 0) {
    console.log("\n🚨 ISSUES FOUND:");
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  // Overall assessment
  const allTestsPassed = tests.every(test => test.status);
  
  if (allTestsPassed) {
    console.log("\n🎉 ALL TESTS PASSED!");
    console.log("===================");
    console.log("✅ PDF attachments should now be included");
    console.log("✅ Quote details should now be visible in emails");
    console.log("✅ Payment links should now work properly");
    console.log("\n📧 Check your email at kappamike@gmail.com");
    console.log("🔍 Look in spam folder if not in inbox");
    console.log("\nThe quote email system is now fully functional!");
  } else {
    console.log("\n⚠️  SOME TESTS FAILED");
    console.log("====================");
    console.log("Please check the issues above and fix them before testing again.");
  }
  
  // Additional recommendations
  console.log("\n💡 RECOMMENDATIONS:");
  console.log("1. Check your email inbox (including spam folder)");
  console.log("2. Verify the email contains all quote details");
  console.log("3. Test the 'Pay Now' button in the email");
  console.log("4. Download and verify the PDF attachment");
  console.log("5. If issues persist, check server logs for detailed error messages");
}

// Run the comprehensive test
testQuoteFixes().catch(console.error);



