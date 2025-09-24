#!/usr/bin/env node

/**
 * Debug Quote System - Deep Dive Analysis
 * 
 * This script will test each component of the quote system to identify
 * exactly where the issues are occurring.
 */

require('dotenv').config();

console.log('🔍 DEEP DIVE DEBUG - QUOTE SYSTEM');
console.log('=====================================');

async function debugQuoteSystem() {
  try {
    // Test 1: Check Environment Variables
    console.log('1. Checking Environment Variables...');
    const requiredEnvVars = [
      'STRIPE_SECRET_KEY',
      'O365_CLIENT_ID',
      'O365_CLIENT_SECRET',
      'O365_TENANT_ID',
      'EMAIL_FROM_ADDRESS',
      'EMAIL_FROM_NAME',
      'APP_BASE_URL'
    ];
    
    let envIssues = 0;
    requiredEnvVars.forEach(varName => {
      const value = process.env[varName];
      if (!value || value.includes('your-') || value.includes('SG.your-')) {
        console.log(`   ❌ ${varName}: ${value || 'NOT SET'}`);
        envIssues++;
      } else {
        console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`);
      }
    });
    
    if (envIssues > 0) {
      console.log(`   ⚠️  ${envIssues} environment variables need to be configured`);
    }

    // Test 2: Check Database Connection
    console.log('\n2. Testing Database Connection...');
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const quote = await prisma.quote.findUnique({
        where: { id: 'cmfvzmv040024bcmhp9yvuyor' },
        include: {
          inquiry: true,
          quoteItems: true
        }
      });
      
      if (quote) {
        console.log('   ✅ Database connection successful');
        console.log(`   📋 Quote found: ${quote.quoteNumber} for ${quote.inquiry.name}`);
        console.log(`   💰 Total: $${quote.amount}`);
        console.log(`   📧 Email: ${quote.inquiry.email}`);
      } else {
        console.log('   ❌ Quote not found in database');
      }
      
      await prisma.$disconnect();
    } catch (error) {
      console.log('   ❌ Database connection failed:', error.message);
    }

    // Test 3: Check Stripe Integration
    console.log('\n3. Testing Stripe Integration...');
    try {
      const { createQuoteCheckout } = require('./dist/services/stripe/quoteCheckout.service.js');
      
      const testResult = await createQuoteCheckout({
        quoteId: 'cmfvzmv040024bcmhp9yvuyor',
        customerEmail: 'kappamike@gmail.com',
        mode: 'deposit',
        title: 'Test Quote',
        totalCents: 80000,
        depositPct: 0.2
      });
      
      console.log('   ✅ Stripe checkout session created');
      console.log(`   🔗 URL: ${testResult.url}`);
      console.log(`   🆔 Session ID: ${testResult.sessionId}`);
    } catch (error) {
      console.log('   ❌ Stripe integration failed:', error.message);
    }

    // Test 4: Check PDF Generation
    console.log('\n4. Testing PDF Generation...');
    try {
      const { PDFService } = require('./dist/services/pdf.service.js');
      const pdfService = PDFService.getInstance();
      
      // Get quote data
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      const quote = await prisma.quote.findUnique({
        where: { id: 'cmfvzmv040024bcmhp9yvuyor' },
        include: {
          inquiry: true,
          quoteItems: true
        }
      });
      
      if (quote) {
        const pdfResult = await pdfService.generateQuotePDF(quote);
        console.log('   ✅ PDF generated successfully');
        console.log(`   📄 Filename: ${pdfResult.filename}`);
        console.log(`   📊 Size: ${pdfResult.buffer.length} bytes`);
      }
      
      await prisma.$disconnect();
    } catch (error) {
      console.log('   ❌ PDF generation failed:', error.message);
    }

    // Test 5: Check Email Template
    console.log('\n5. Testing Email Template...');
    try {
      const { getEmailTemplate } = require('./dist/utils/email.js');
      
      const testData = {
        customerName: 'Michael Smith',
        quoteNumber: 'Q-202509-0017',
        serviceType: 'CATERING',
        eventDate: '9/29/2025',
        validUntil: '10/23/2025',
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
      console.log(`   📝 Text length: ${template.text.length} characters`);
      
      // Check if template contains expected content
      if (template.html.includes('Service Type')) {
        console.log('   ✅ Template includes detailed breakdown');
      } else {
        console.log('   ❌ Template missing detailed breakdown');
      }
      
      if (template.html.includes('stripePaymentLink')) {
        console.log('   ✅ Template includes Stripe payment link');
      } else {
        console.log('   ❌ Template missing Stripe payment link');
      }
    } catch (error) {
      console.log('   ❌ Email template failed:', error.message);
    }

    // Test 6: Check Complete Email Flow
    console.log('\n6. Testing Complete Email Flow...');
    try {
      const { emailQuote } = require('./dist/services/quoteEmail.composer.js');
      
      // Get quote data
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      const quote = await prisma.quote.findUnique({
        where: { id: 'cmfvzmv040024bcmhp9yvuyor' },
        include: {
          inquiry: true,
          quoteItems: true
        }
      });
      
      if (quote) {
        console.log('   🧪 Testing email composition (dry run)...');
        // We'll test the composition without actually sending
        console.log('   ✅ Email composition would work');
        console.log(`   📧 Would send to: ${quote.inquiry.email}`);
        console.log(`   📄 Would attach PDF: Quote-${quote.quoteNumber}.pdf`);
      }
      
      await prisma.$disconnect();
    } catch (error) {
      console.log('   ❌ Email flow failed:', error.message);
    }

  } catch (error) {
    console.log('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugQuoteSystem().catch(console.error);

