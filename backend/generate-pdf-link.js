#!/usr/bin/env node

/**
 * Generate PDF Link Script
 * 
 * This script will generate a PDF for the quote and provide you with the link
 */

require('dotenv').config({ path: './.env' });

async function generatePDFLink() {
  console.log("📄 GENERATING PDF LINK");
  console.log("=====================\n");

  try {
    const quoteId = "cmfvzmv040024bcmhp9yvuyor"; // The quote ID from your email
    
    console.log(`📋 Quote ID: ${quoteId}`);
    
    // Method 1: Direct PDF generation
    console.log("\n1. Generating PDF directly...");
    
    const { PrismaClient } = require('@prisma/client');
    const { PDFService } = require('./dist/services/pdf.service');
    
    const prisma = new PrismaClient();
    
    // Get quote data
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        inquiry: true,
        quoteItems: true
      }
    });
    
    if (!quote) {
      console.log("❌ Quote not found");
      return;
    }
    
    console.log("✅ Quote found:", {
      quoteNumber: quote.quoteNumber,
      customerName: quote.inquiry?.name,
      amount: quote.amount
    });
    
    // Generate PDF
    const pdfService = PDFService.getInstance();
    const { buffer, filename } = await pdfService.generateQuotePDF(quote);
    
    console.log("✅ PDF generated:", {
      filename,
      size: `${Math.round(buffer.length / 1024)} KB`
    });
    
    // Method 2: API endpoint links
    console.log("\n2. PDF Download Links:");
    console.log("=====================");
    
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:5001';
    
    console.log(`📄 Direct PDF Download:`);
    console.log(`   ${baseUrl}/api/quotes/${quoteId}/pdf`);
    
    console.log(`\n📄 PDF Preview (inline):`);
    console.log(`   ${baseUrl}/api/quotes/${quoteId}/pdf/preview`);
    
    console.log(`\n📄 Save PDF to Server:`);
    console.log(`   POST ${baseUrl}/api/quotes/${quoteId}/pdf/save`);
    
    // Method 3: Test the PDF endpoint
    console.log("\n3. Testing PDF endpoint...");
    
    try {
      const axios = require('axios');
      
      const response = await axios.get(`${baseUrl}/api/quotes/${quoteId}/pdf`, {
        timeout: 10000,
        responseType: 'arraybuffer'
      });
      
      console.log("✅ PDF endpoint working");
      console.log(`   Status: ${response.status}`);
      console.log(`   Content-Type: ${response.headers['content-type']}`);
      console.log(`   Size: ${response.data.length} bytes`);
      
    } catch (apiError) {
      console.log("❌ PDF endpoint failed:", apiError.message);
      console.log("   💡 Make sure the server is running on port 5001");
    }
    
    console.log("\n🎯 PDF LINKS FOR YOU:");
    console.log("=====================");
    console.log(`📄 Download PDF: ${baseUrl}/api/quotes/${quoteId}/pdf`);
    console.log(`👁️  Preview PDF: ${baseUrl}/api/quotes/${quoteId}/pdf/preview`);
    
    console.log("\n📋 QUOTE DETAILS:");
    console.log("=================");
    console.log(`Quote Number: ${quote.quoteNumber}`);
    console.log(`Customer: ${quote.inquiry?.name}`);
    console.log(`Email: ${quote.inquiry?.email}`);
    console.log(`Amount: $${quote.amount}`);
    console.log(`Status: ${quote.status}`);
    
  } catch (error) {
    console.error("❌ Error generating PDF link:", error.message);
    console.error("Stack:", error.stack);
  }
}

// Run the script
generatePDFLink().catch(console.error);

