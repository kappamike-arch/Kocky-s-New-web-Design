#!/usr/bin/env node

/**
 * Send Quote Email with Office 365 Graph API
 * 
 * This script sends a test quote email using Office 365 Graph API
 * with the configured credentials.
 */

require('dotenv').config();
const { PDFService } = require('./dist/services/pdf.service');
const { createQuoteCheckout } = require('./dist/services/stripe/quoteCheckout.service');
const { sendEmail } = require('./dist/utils/email');

// Test quote data
const quoteData = {
  id: 'test-quote-o365-123',
  quoteNumber: 'Q-O365-GRAPH-001',
  amount: 1250,
  validUntil: new Date('2025-10-30'),
  terms: 'Payment due upon acceptance. All services subject to availability.',
  notes: 'This is a test quote email sent via Office 365 Graph API to verify the system is working correctly.',
  status: 'DRAFT',
  createdAt: new Date(),
  inquiry: {
    id: 'test-inquiry-o365-123',
    name: 'Michael Smith',
    email: 'kappamike@gmail.com',
    serviceType: 'Catering',
    eventDate: new Date('2025-11-15'),
    eventTime: '18:00',
    eventLocation: 'Test Venue, Fresno CA',
    guestCount: 75,
    message: 'Test event for quote email verification via Office 365'
  },
  quoteItems: [
    { id: 'item-1', description: 'Professional Bartender Service', quantity: 2, unitPrice: 150, total: 300 },
    { id: 'item-2', description: 'Premium Food Catering (75 guests)', quantity: 1, unitPrice: 800, total: 800 },
    { id: 'item-3', description: 'Setup & Cleanup Service', quantity: 1, unitPrice: 200, total: 200 },
    { id: 'item-4', description: 'Gratuity (20%)', quantity: 1, unitPrice: 260, total: 260 }
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

async function sendQuoteWithO365Graph() {
  log('\n' + '='.repeat(60), 'bold');
  log('📧 SENDING QUOTE EMAIL VIA OFFICE 365 GRAPH API', 'bold');
  log('='.repeat(60), 'bold');
  
  try {
    // Display configuration
    logInfo('Office 365 Configuration:');
    logInfo(`   Tenant ID: ${process.env.O365_TENANT_ID ? 'Set' : 'Not set'}`);
    logInfo(`   Client ID: ${process.env.O365_CLIENT_ID ? 'Set' : 'Not set'}`);
    logInfo(`   Client Secret: ${process.env.O365_CLIENT_SECRET ? 'Set' : 'Not set'}`);
    logInfo(`   From Email: ${process.env.O365_FROM_EMAIL}`);
    logInfo(`   From Name: ${process.env.O365_FROM_NAME}`);
    logInfo(`   Graph Endpoint: ${process.env.GRAPH_API_ENDPOINT}`);
    
    // Step 1: Generate PDF
    logInfo('Generating PDF attachment...');
    const pdfService = PDFService.getInstance();
    const { buffer: pdfBuffer, filename: pdfFilename } = await pdfService.generateQuotePDF(quoteData);
    const pdfSizeKB = Math.round(pdfBuffer.length / 1024);
    logSuccess(`PDF generated: ${pdfFilename} (${pdfSizeKB} KB)`);
    
    // Step 2: Create Stripe checkout session
    logInfo('Creating Stripe checkout session...');
    const checkoutResult = await createQuoteCheckout({
      quoteId: quoteData.id,
      customerEmail: quoteData.inquiry.email,
      mode: 'full',
      title: `Quote ${quoteData.quoteNumber}`,
      totalCents: Math.round(quoteData.amount * 100),
      depositPct: 0.2
    });
    logSuccess(`Stripe checkout created: ${checkoutResult.sessionId}`);
    logInfo(`Checkout URL: ${checkoutResult.url}`);
    
    // Step 3: Prepare email data
    logInfo('Preparing email data...');
    const emailData = {
      customerName: quoteData.inquiry.name,
      quoteNumber: quoteData.quoteNumber,
      serviceType: quoteData.inquiry.serviceType,
      eventDate: quoteData.inquiry.eventDate ? new Date(quoteData.inquiry.eventDate).toLocaleDateString() : undefined,
      validUntil: quoteData.validUntil ? new Date(quoteData.validUntil).toLocaleDateString() : 'N/A',
      subtotal: '$1,300.00',
      tax: '$0.00',
      gratuity: '$260.00',
      total: '$1,560.00',
      deposit: undefined,
      terms: quoteData.terms,
      message: quoteData.notes,
      payUrl: checkoutResult.url,
      stripePaymentLink: checkoutResult.url,
      unsubscribeLink: `${process.env.APP_BASE_URL || 'https://staging.kockys.com'}/unsubscribe?email=${encodeURIComponent(quoteData.inquiry.email)}`,
      items: quoteData.quoteItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice).toFixed(2),
        total: Number(item.total).toFixed(2)
      }))
    };
    logSuccess('Email data prepared with all quote items');
    
    // Step 4: Send email using the centralized email service
    logInfo('Sending email via Office 365 Graph API...');
    const emailOptions = {
      to: quoteData.inquiry.email,
      subject: `Your Quote ${quoteData.quoteNumber} — Kocky's Bar & Grill`,
      template: 'quote',
      data: emailData,
      attachments: [{
        filename: pdfFilename,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    };
    
    const emailSent = await sendEmail(emailOptions);
    
    if (emailSent) {
      logSuccess('Email sent successfully via Office 365!');
      logInfo(`Recipient: ${quoteData.inquiry.email}`);
      logInfo(`Subject: ${emailOptions.subject}`);
      logInfo(`PDF attached: ${pdfFilename} (${pdfSizeKB} KB)`);
      logInfo(`Stripe checkout URL included in email`);
      logInfo(`Quote includes ${emailData.items.length} service items`);
      
      log('\n' + '='.repeat(60), 'bold');
      log('🎉 QUOTE EMAIL SENT SUCCESSFULLY!', 'bold');
      log('='.repeat(60), 'bold');
      log(`📧 Sent to: ${quoteData.inquiry.email}`);
      log(`📄 PDF: ${pdfFilename} (${pdfSizeKB} KB)`);
      log(`💳 Stripe URL: ${checkoutResult.url}`);
      log(`📋 Items: ${emailData.items.length} service items included`);
      log(`🔧 Sent via: Office 365 Graph API`);
      
    } else {
      throw new Error('Email service returned false');
    }
    
  } catch (error) {
    log('\n' + '='.repeat(60), 'bold');
    log('❌ EMAIL SEND FAILED', 'bold');
    log('='.repeat(60), 'bold');
    logError(`Error: ${error.message}`);
    
    if (error.message.includes('Authentication')) {
      logInfo('This might be due to Office 365 authentication issues.');
      logInfo('Check that the credentials are correct and the app has proper permissions.');
    }
    
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logError(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  sendQuoteWithO365Graph().catch((error) => {
    logError(`Script execution failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { sendQuoteWithO365Graph };
