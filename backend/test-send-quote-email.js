#!/usr/bin/env node

/**
 * Test Script: Full Quote Email Flow
 * 
 * This script tests the complete quote email functionality including:
 * - PDF generation and attachment
 * - Stripe checkout session creation
 * - Email template rendering with quote items
 * - Email sending via configured service
 */

const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Import our services from compiled dist folder
const { PDFService } = require('./dist/services/pdf.service');
const { createPaymentLink } = require('./dist/utils/payment');
const { sendEmail } = require('./dist/utils/email');
const { createQuoteCheckout } = require('./dist/services/stripe/quoteCheckout.service');

// Initialize Prisma
const prisma = new PrismaClient();

// Test configuration
const TEST_CONFIG = {
  quoteNumber: 'Q-TEST-1234',
  customerName: 'Michael Smith',
  customerEmail: 'kappamike@gmail.com',
  serviceType: 'Catering',
  total: 960,
  validUntil: '2025-10-06',
  items: [
    { description: 'Bartender', qty: 2, unitPrice: 30, total: 60 },
    { description: 'Food Service', qty: 1, unitPrice: 500, total: 500 },
    { description: 'Setup & Cleanup', qty: 1, unitPrice: 200, total: 200 },
    { description: 'Gratuity (20%)', qty: 1, unitPrice: 200, total: 200 }
  ]
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

/**
 * Create a mock quote object for testing
 */
function createMockQuote() {
  return {
    id: 'test-quote-id-123',
    quoteNumber: TEST_CONFIG.quoteNumber,
    amount: TEST_CONFIG.total,
    validUntil: new Date(TEST_CONFIG.validUntil),
    terms: 'Payment due upon acceptance. All services subject to availability.',
    notes: 'This is a test quote for email functionality verification.',
    status: 'DRAFT',
    createdAt: new Date(),
    inquiry: {
      id: 'test-inquiry-id-123',
      name: TEST_CONFIG.customerName,
      email: TEST_CONFIG.customerEmail,
      serviceType: TEST_CONFIG.serviceType,
      eventDate: new Date('2025-10-15'),
      eventTime: '18:00',
      eventLocation: 'Test Venue, Fresno CA',
      guestCount: 50,
      message: 'Test event for quote email functionality'
    },
    quoteItems: TEST_CONFIG.items.map((item, index) => ({
      id: `test-item-${index}`,
      description: item.description,
      quantity: item.qty,
      unitPrice: item.unitPrice,
      total: item.total,
      notes: null
    }))
  };
}

/**
 * Test PDF generation
 */
async function testPDFGeneration(quote) {
  logInfo('Testing PDF generation...');
  
  try {
    const pdfService = PDFService.getInstance();
    const { buffer, filename } = await pdfService.generateQuotePDF(quote);
    
    const sizeKB = Math.round(buffer.length / 1024);
    logSuccess(`PDF generated successfully: ${filename} (${sizeKB} KB)`);
    
    return { buffer, filename, sizeKB };
  } catch (error) {
    logError(`PDF generation failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test Stripe checkout session creation
 */
async function testStripeCheckout(quote) {
  logInfo('Testing Stripe checkout session creation...');
  
  try {
    const checkoutResult = await createQuoteCheckout({
      quoteId: quote.id,
      customerEmail: quote.inquiry.email,
      mode: 'full',
      title: `Quote ${quote.quoteNumber}`,
      totalCents: Math.round(quote.amount * 100),
      depositPct: 0.2
    });
    
    logSuccess(`Stripe checkout session created: ${checkoutResult.sessionId}`);
    logInfo(`Checkout URL: ${checkoutResult.url}`);
    
    return checkoutResult;
  } catch (error) {
    logError(`Stripe checkout creation failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test email template rendering with quote items
 */
function testEmailTemplateRendering(quote, checkoutResult) {
  logInfo('Testing email template rendering...');
  
  try {
    // Prepare email data exactly like the real service does
    const emailData = {
      customerName: quote.inquiry.name,
      quoteNumber: quote.quoteNumber,
      serviceType: quote.inquiry.serviceType,
      eventDate: quote.inquiry.eventDate ? new Date(quote.inquiry.eventDate).toLocaleDateString() : undefined,
      validUntil: quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A',
      subtotal: '$760.00',
      tax: '$0.00',
      gratuity: '$200.00',
      total: '$960.00',
      deposit: undefined,
      terms: quote.terms,
      message: quote.notes,
      payUrl: checkoutResult.url,
      stripePaymentLink: checkoutResult.url,
      unsubscribeLink: `${process.env.APP_BASE_URL || 'https://staging.kockys.com'}/unsubscribe?email=${encodeURIComponent(quote.inquiry.email)}`,
      items: quote.quoteItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice).toFixed(2),
        total: Number(item.total).toFixed(2)
      }))
    };
    
    // Test template rendering
    const { getEmailTemplate } = require('./dist/utils/email');
    const template = getEmailTemplate('quote', emailData);
    
    // Verify template contains expected elements
    const html = template.html;
    const hasItemsTable = html.includes('Service Items') && html.includes('Description');
    const hasStripeLink = html.includes(checkoutResult.url);
    const hasQuoteDetails = html.includes(quote.quoteNumber) && html.includes(quote.inquiry.name);
    const hasAllItems = TEST_CONFIG.items.every(item => html.includes(item.description));
    
    // Debug information
    logInfo(`Template validation results:`);
    logInfo(`  - Has items table: ${hasItemsTable}`);
    logInfo(`  - Has Stripe link: ${hasStripeLink}`);
    logInfo(`  - Has quote details: ${hasQuoteDetails}`);
    logInfo(`  - Has all items: ${hasAllItems}`);
    logInfo(`  - Template length: ${html.length} characters`);
    
    // Check which items are missing
    const missingItems = TEST_CONFIG.items.filter(item => !html.includes(item.description));
    if (missingItems.length > 0) {
      logWarning(`Missing items: ${missingItems.map(item => item.description).join(', ')}`);
    }
    
    if (hasItemsTable && hasStripeLink && hasQuoteDetails && hasAllItems) {
      logSuccess('Email template rendering successful');
      logInfo(`Template includes: ${TEST_CONFIG.items.length} items, Stripe link, quote details`);
      return emailData;
    } else {
      throw new Error('Template missing required elements');
    }
  } catch (error) {
    logError(`Email template rendering failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test email sending
 */
async function testEmailSending(emailData, pdfResult) {
  logInfo('Testing email sending...');
  
  try {
    const emailOptions = {
      to: emailData.customerName === 'Michael Smith' ? 'kappamike@gmail.com' : emailData.customerName,
      subject: `Test Quote ${emailData.quoteNumber} — Kocky's`,
      template: 'quote',
      data: emailData,
      attachments: [{
        filename: pdfResult.filename,
        content: pdfResult.buffer,
        contentType: 'application/pdf'
      }]
    };
    
    const emailSent = await sendEmail(emailOptions);
    
    if (emailSent) {
      logSuccess('Email sent successfully');
      logInfo(`Recipient: ${emailOptions.to}`);
      logInfo(`Subject: ${emailOptions.subject}`);
      logInfo(`PDF attached: ${pdfResult.filename} (${pdfResult.sizeKB} KB)`);
    } else {
      throw new Error('Email service returned false');
    }
    
    return emailSent;
  } catch (error) {
    logError(`Email sending failed: ${error.message}`);
    throw error;
  }
}

/**
 * Main test function
 */
async function runQuoteEmailTest() {
  log('\n' + '='.repeat(60), 'bold');
  log('🧪 QUOTE EMAIL FLOW TEST', 'bold');
  log('='.repeat(60), 'bold');
  
  const startTime = Date.now();
  let testResults = {
    pdfGeneration: false,
    stripeCheckout: false,
    emailTemplate: false,
    emailSending: false
  };
  
  try {
    // Create mock quote
    logInfo('Creating mock quote data...');
    const quote = createMockQuote();
    logSuccess(`Mock quote created: ${quote.quoteNumber}`);
    
    // Test 1: PDF Generation
    log('\n📄 TEST 1: PDF GENERATION', 'bold');
    const pdfResult = await testPDFGeneration(quote);
    testResults.pdfGeneration = true;
    
    // Test 2: Stripe Checkout
    log('\n💳 TEST 2: STRIPE CHECKOUT', 'bold');
    const checkoutResult = await testStripeCheckout(quote);
    testResults.stripeCheckout = true;
    
    // Test 3: Email Template
    log('\n📧 TEST 3: EMAIL TEMPLATE', 'bold');
    const emailData = testEmailTemplateRendering(quote, checkoutResult);
    testResults.emailTemplate = true;
    
    // Test 4: Email Sending
    log('\n📤 TEST 4: EMAIL SENDING', 'bold');
    await testEmailSending(emailData, pdfResult);
    testResults.emailSending = true;
    
    // Final Results
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    log('\n' + '='.repeat(60), 'bold');
    log('🎉 TEST RESULTS SUMMARY', 'bold');
    log('='.repeat(60), 'bold');
    
    logSuccess(`PDF Generation: ${pdfResult.filename} (${pdfResult.sizeKB} KB)`);
    logSuccess(`Stripe Checkout: ${checkoutResult.sessionId}`);
    logSuccess(`Email Template: Rendered with ${emailData.items.length} items`);
    logSuccess(`Email Sending: Sent to ${emailData.customerName}`);
    logInfo(`Total Duration: ${duration} seconds`);
    
    log('\n✅ ALL TESTS PASSED! Quote email flow is working correctly.', 'green');
    
  } catch (error) {
    log('\n' + '='.repeat(60), 'bold');
    log('❌ TEST FAILED', 'bold');
    log('='.repeat(60), 'bold');
    
    logError(`Error: ${error.message}`);
    if (error.stack) {
      logError(`Stack: ${error.stack}`);
    }
    
    log('\nTest Results:', 'bold');
    Object.entries(testResults).forEach(([test, passed]) => {
      if (passed) {
        logSuccess(`${test}: PASSED`);
      } else {
        logError(`${test}: FAILED`);
      }
    });
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logError(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run the test
if (require.main === module) {
  runQuoteEmailTest().catch((error) => {
    logError(`Test execution failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runQuoteEmailTest,
  createMockQuote,
  testPDFGeneration,
  testStripeCheckout,
  testEmailTemplateRendering,
  testEmailSending
};

