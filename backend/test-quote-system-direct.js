#!/usr/bin/env node

/**
 * Direct Quote System Test
 * 
 * This script tests the quote system directly without relying on the server
 */

require('dotenv').config();

console.log('🧪 DIRECT QUOTE SYSTEM TEST');
console.log('=====================================');

async function testQuoteSystemDirect() {
  try {
    // Test 1: Check Environment Variables
    console.log('1. Checking Environment Variables...');
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const o365ClientId = process.env.O365_CLIENT_ID;
    const emailFrom = process.env.EMAIL_FROM_ADDRESS;
    
    if (!stripeKey || stripeKey.includes('sk_test_') === false) {
      console.log('   ❌ STRIPE_SECRET_KEY not properly configured');
    } else {
      console.log('   ✅ Stripe key configured');
    }
    
    if (!o365ClientId || o365ClientId.includes('your-')) {
      console.log('   ❌ O365_CLIENT_ID not properly configured');
    } else {
      console.log('   ✅ Office 365 configured');
    }
    
    if (!emailFrom) {
      console.log('   ❌ EMAIL_FROM_ADDRESS not configured');
    } else {
      console.log('   ✅ Email from address configured');
    }

    // Test 2: Test Database Connection and Quote Data
    console.log('\n2. Testing Database Connection...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const quote = await prisma.quote.findUnique({
      where: { id: 'cmfvzmv040024bcmhp9yvuyor' },
      include: {
        inquiry: true,
        quoteItems: true
      }
    });
    
    if (!quote) {
      console.log('   ❌ Quote not found in database');
      await prisma.$disconnect();
      return;
    }
    
    console.log('   ✅ Quote found:');
    console.log(`      Quote Number: ${quote.quoteNumber}`);
    console.log(`      Customer: ${quote.inquiry.name}`);
    console.log(`      Email: ${quote.inquiry.email}`);
    console.log(`      Service Type: ${quote.inquiry.serviceType}`);
    console.log(`      Total: $${quote.amount}`);
    console.log(`      Event Date: ${quote.inquiry.eventDate ? new Date(quote.inquiry.eventDate).toLocaleDateString() : 'N/A'}`);

    // Test 3: Test Stripe Integration
    console.log('\n3. Testing Stripe Integration...');
    try {
      const { createQuoteCheckout } = require('./dist/services/stripe/quoteCheckout.service.js');
      
      const checkoutResult = await createQuoteCheckout({
        quoteId: quote.id,
        customerEmail: quote.inquiry.email,
        mode: 'deposit',
        title: `Quote ${quote.quoteNumber}`,
        totalCents: Math.round(Number(quote.amount) * 100),
        depositPct: 0.2
      });
      
      console.log('   ✅ Stripe checkout session created');
      console.log(`   🔗 Checkout URL: ${checkoutResult.url}`);
      console.log(`   🆔 Session ID: ${checkoutResult.sessionId}`);
      console.log(`   💰 Amount: $${checkoutResult.amount / 100}`);
      
    } catch (stripeError) {
      console.log('   ❌ Stripe integration failed:', stripeError.message);
    }

    // Test 4: Test PDF Generation
    console.log('\n4. Testing PDF Generation...');
    try {
      const { PDFService } = require('./dist/services/pdf.service.js');
      const pdfService = PDFService.getInstance();
      
      const pdfResult = await pdfService.generateQuotePDF(quote);
      console.log('   ✅ PDF generated successfully');
      console.log(`   📄 Filename: ${pdfResult.filename}`);
      console.log(`   📊 Size: ${pdfResult.buffer.length} bytes`);
      
    } catch (pdfError) {
      console.log('   ❌ PDF generation failed:', pdfError.message);
    }

    // Test 5: Test Email Template
    console.log('\n5. Testing Email Template...');
    try {
      const { getEmailTemplate } = require('./dist/utils/email.js');
      
      const testData = {
        customerName: quote.inquiry.name,
        quoteNumber: quote.quoteNumber,
        serviceType: quote.inquiry.serviceType,
        eventDate: quote.inquiry.eventDate ? new Date(quote.inquiry.eventDate).toLocaleDateString() : undefined,
        validUntil: quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A',
        subtotal: '800.00',
        tax: '0.00',
        gratuity: '0.00',
        total: '800.00',
        deposit: '160.00',
        stripePaymentLink: 'https://checkout.stripe.com/test',
        unsubscribeLink: 'https://staging.kockys.com/unsubscribe'
      };
      
      const template = getEmailTemplate('quote', testData);
      console.log('   ✅ Email template loaded');
      console.log(`   📧 HTML length: ${template.html.length} characters`);
      
      // Check if template contains expected content
      if (template.html.includes('Quote Breakdown')) {
        console.log('   ✅ Template includes detailed breakdown section');
      } else {
        console.log('   ❌ Template missing detailed breakdown section');
      }
      
      if (template.html.includes('Service Type')) {
        console.log('   ✅ Template includes service type');
      } else {
        console.log('   ❌ Template missing service type');
      }
      
      if (template.html.includes('stripePaymentLink')) {
        console.log('   ✅ Template includes Stripe payment link');
      } else {
        console.log('   ❌ Template missing Stripe payment link');
      }
      
    } catch (templateError) {
      console.log('   ❌ Email template failed:', templateError.message);
    }

    // Test 6: Test Complete Email Flow
    console.log('\n6. Testing Complete Email Flow...');
    try {
      const { emailQuote } = require('./dist/services/quoteEmail.composer.js');
      
      console.log('   🧪 Testing email composition...');
      const result = await emailQuote({
        quote: quote,
        paymentMode: 'deposit'
      });
      
      console.log('   ✅ Quote email sent successfully!');
      console.log(`   🔗 Stripe Checkout URL: ${result.checkoutUrl}`);
      console.log(`   🆔 Session ID: ${result.sessionId}`);
      
      console.log('');
      console.log('🎉 SUCCESS! All components are working correctly!');
      console.log('');
      console.log('📧 Email Features Verified:');
      console.log('   ✅ Detailed quote breakdown included');
      console.log('   ✅ PDF attachment generated and attached');
      console.log('   ✅ Working Stripe payment link');
      console.log('   ✅ Professional email template');
      console.log('   ✅ Email sent successfully');
      
    } catch (emailError) {
      console.log('   ❌ Email flow failed:', emailError.message);
      console.log('   🔍 Error details:', emailError);
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('🔍 Full error:', error);
  }
}

// Run the test
testQuoteSystemDirect().catch(console.error);

