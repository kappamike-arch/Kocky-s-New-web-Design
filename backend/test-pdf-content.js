#!/usr/bin/env node

/**
 * Test PDF Content
 * 
 * This script generates a PDF and checks its content to ensure
 * it's properly formatted without raw JSON data
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PDFService } = require('./dist/services/pdf.service');
const fs = require('fs');

const prisma = new PrismaClient();
const pdfService = PDFService.getInstance();

async function testPDFContent() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TESTING PDF CONTENT FORMATTING');
  console.log('='.repeat(60));
  
  try {
    // Get the quote
    const quote = await prisma.quote.findUnique({
      where: { id: 'cmfx5r93p000hbc4yuzfcxnea' },
      include: {
        inquiry: true,
        quoteItems: true
      }
    });
    
    if (!quote) {
      console.log('❌ Quote not found');
      return;
    }
    
    console.log('✅ Quote found:', quote.quoteNumber);
    console.log('   Customer:', quote.inquiry.name);
    console.log('   Items:', quote.quoteItems.length);
    
    // Generate PDF
    console.log('\n📄 Generating PDF...');
    const result = await pdfService.generateQuotePDF(quote);
    console.log('✅ PDF generated successfully!');
    console.log('   Filename:', result.filename);
    console.log('   Size:', Math.round(result.buffer.length / 1024), 'KB');
    
    // Save PDF for inspection
    const pdfPath = '/tmp/test-quote-formatted.pdf';
    fs.writeFileSync(pdfPath, result.buffer);
    console.log('   Saved to:', pdfPath);
    
    // Check if PDF contains raw JSON data
    const pdfContent = result.buffer.toString('utf8');
    const hasRawJson = pdfContent.includes('&quot;') || pdfContent.includes('&#x5C;n');
    
    if (hasRawJson) {
      console.log('❌ PDF still contains raw JSON data');
      console.log('   This indicates the HTML entity decoding is not working properly');
    } else {
      console.log('✅ PDF appears to be properly formatted');
      console.log('   No raw JSON data detected');
    }
    
    // Check for expected content
    const hasHeader = pdfContent.includes('KOCKY\'S BAR & GRILL');
    const hasQuoteNumber = pdfContent.includes(quote.quoteNumber);
    const hasCustomerName = pdfContent.includes(quote.inquiry.name);
    
    console.log('\n📋 Content Check:');
    console.log('   Has header:', hasHeader ? '✅' : '❌');
    console.log('   Has quote number:', hasQuoteNumber ? '✅' : '❌');
    console.log('   Has customer name:', hasCustomerName ? '✅' : '❌');
    
    if (hasHeader && hasQuoteNumber && hasCustomerName && !hasRawJson) {
      console.log('\n🎉 PDF CONTENT IS PROPERLY FORMATTED!');
      console.log('   The PDF should now display clean, professional content');
      console.log('   instead of raw JSON data.');
    } else {
      console.log('\n⚠️ PDF CONTENT NEEDS ATTENTION');
      console.log('   Some expected content is missing or raw data is present');
    }
    
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 PDF CONTENT TEST COMPLETED');
  console.log('='.repeat(60));
}

// Run the test
if (require.main === module) {
  testPDFContent().catch((error) => {
    console.error('Test execution failed:', error.message);
    process.exit(1);
  });
}

module.exports = { testPDFContent };
