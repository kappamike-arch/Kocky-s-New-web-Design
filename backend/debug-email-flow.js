#!/usr/bin/env node

/**
 * Debug Email Flow Script
 * 
 * This script will test the actual email flow to identify where the issue is
 */

require('dotenv').config({ path: './.env' });

async function debugEmailFlow() {
  console.log("🔍 DEBUGGING EMAIL FLOW");
  console.log("=======================\n");

  try {
    // Step 1: Test the quote service directly
    console.log("1. Testing QuoteService.sendQuoteEmail directly...");
    
    const { QuoteService } = require('./dist/services/quote.service');
    const quoteId = "cmfvzmv040024bcmhp9yvuyor"; // Use the quote ID from the email
    
    console.log(`   📋 Testing with quote ID: ${quoteId}`);
    
    const result = await QuoteService.sendQuoteEmail(quoteId, 'full');
    
    console.log("   ✅ QuoteService.sendQuoteEmail completed");
    console.log(`   📊 Result:`, result);
    
  } catch (error) {
    console.error("   ❌ QuoteService.sendQuoteEmail failed:", error.message);
    console.error("   📋 Stack:", error.stack);
    
    // Step 2: Test the email composer directly
    console.log("\n2. Testing emailQuote composer directly...");
    
    try {
      const { emailQuote } = require('./dist/services/quoteEmail.composer');
      
      // Get quote data
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const quote = await prisma.quote.findUnique({
        where: { id: quoteId },
        include: {
          inquiry: true,
          quoteItems: true
        }
      });
      
      if (!quote) {
        console.log("   ❌ Quote not found");
        return;
      }
      
      console.log("   📋 Quote found:", {
        id: quote.id,
        quoteNumber: quote.quoteNumber,
        customerName: quote.inquiry?.name,
        customerEmail: quote.inquiry?.email,
        amount: quote.amount,
        itemCount: quote.quoteItems?.length || 0
      });
      
      const result = await emailQuote({
        quote: quote,
        paymentMode: 'full'
      });
      
      console.log("   ✅ emailQuote composer completed");
      console.log(`   📊 Result:`, result);
      
    } catch (composerError) {
      console.error("   ❌ emailQuote composer failed:", composerError.message);
      console.error("   📋 Stack:", composerError.stack);
      
      // Step 3: Test individual components
      console.log("\n3. Testing individual components...");
      
      // Test Stripe service
      try {
        console.log("   🔍 Testing Stripe service...");
        const { createQuoteCheckout } = require('./dist/services/stripe/quoteCheckout.service');
        
        const stripeResult = await createQuoteCheckout({
          quoteId: quoteId,
          customerEmail: 'kappamike@gmail.com',
          mode: 'full',
          title: 'Test Quote',
          totalCents: 24000, // $240.00
          depositPct: 0.2
        });
        
        console.log("   ✅ Stripe service working:", stripeResult);
        
      } catch (stripeError) {
        console.error("   ❌ Stripe service failed:", stripeError.message);
      }
      
      // Test PDF service
      try {
        console.log("   🔍 Testing PDF service...");
        const { PDFService } = require('./dist/services/pdf.service');
        
        const pdfService = PDFService.getInstance();
        const pdfResult = await pdfService.generateQuotePDF(quote);
        
        console.log("   ✅ PDF service working:", {
          filename: pdfResult.filename,
          bufferSize: pdfResult.buffer.length
        });
        
      } catch (pdfError) {
        console.error("   ❌ PDF service failed:", pdfError.message);
      }
      
      // Test email template
      try {
        console.log("   🔍 Testing email template...");
        const { getEmailTemplate } = require('./dist/utils/email');
        
        const templateData = {
          customerName: 'Test Customer',
          quoteNumber: 'Q-2025-001',
          serviceType: 'Catering Services',
          eventDate: 'March 15, 2025',
          validUntil: 'February 15, 2025',
          subtotal: '200.00',
          tax: '20.00',
          gratuity: '20.00',
          total: '240.00',
          deposit: '48.00',
          stripePaymentLink: 'https://checkout.stripe.com/test-session',
          unsubscribeLink: 'https://staging.kockys.com/unsubscribe'
        };
        
        const template = getEmailTemplate('quote', templateData);
        
        console.log("   ✅ Email template working:", {
          htmlLength: template.html.length,
          textLength: template.text.length,
          hasStripeLink: template.html.includes('stripePaymentLink'),
          hasQuoteDetails: template.html.includes('Quote Breakdown'),
          hasPayNowButton: template.html.includes('Pay Now')
        });
        
      } catch (templateError) {
        console.error("   ❌ Email template failed:", templateError.message);
      }
    }
    
  } catch (error) {
    console.error("\n❌ DEBUG FAILED:");
    console.error("==================");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

// Run the debug
debugEmailFlow().catch(console.error);



