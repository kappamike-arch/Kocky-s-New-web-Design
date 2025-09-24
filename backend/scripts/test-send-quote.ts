#!/usr/bin/env ts-node

/**
 * Test script for the production-grade "Send Quote" flow
 * 
 * This script tests the complete quote sending functionality including:
 * - Stripe checkout session creation
 * - Quote email template rendering
 * - PDF attachment generation
 * - Email delivery
 * 
 * Usage:
 *   npm run test:send-quote <QUOTE_ID> [mode]
 *   
 * Examples:
 *   npm run test:send-quote "quote-id-123" deposit
 *   npm run test:send-quote "quote-id-123" full
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.join(__dirname, '../.env') });

interface TestResult {
  success: boolean;
  status: number;
  data?: any;
  error?: string;
}

/**
 * Test the send quote API endpoint
 */
async function testSendQuote(quoteId: string, mode: 'deposit' | 'full' = 'deposit'): Promise<TestResult> {
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:5001';
  const url = `${baseUrl}/api/quotes/${quoteId}/send`;
  
  console.log(`🧪 Testing Send Quote API`);
  console.log(`   URL: ${url}`);
  console.log(`   Mode: ${mode}`);
  console.log(`   Quote ID: ${quoteId}`);
  console.log('');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mode })
    });

    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data: data
    };

  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test quote retrieval to verify quote exists
 */
async function testGetQuote(quoteId: string): Promise<TestResult> {
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:5001';
  const url = `${baseUrl}/api/quotes/${quoteId}`;
  
  console.log(`🔍 Testing Quote Retrieval`);
  console.log(`   URL: ${url}`);
  console.log('');

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data: data
    };

  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Main test function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('❌ Error: Quote ID is required');
    console.log('');
    console.log('Usage:');
    console.log('  npm run test:send-quote <QUOTE_ID> [mode]');
    console.log('');
    console.log('Examples:');
    console.log('  npm run test:send-quote "quote-id-123" deposit');
    console.log('  npm run test:send-quote "quote-id-123" full');
    console.log('');
    process.exit(1);
  }

  const quoteId = args[0];
  const mode = (args[1] as 'deposit' | 'full') || 'deposit';

  // Validate mode
  if (!['deposit', 'full'].includes(mode)) {
    console.log('❌ Error: Invalid mode. Must be "deposit" or "full"');
    process.exit(1);
  }

  console.log('🚀 Starting Quote Send Test');
  console.log('=====================================');
  console.log('');

  // Test 1: Verify quote exists
  console.log('📋 Test 1: Quote Retrieval');
  const quoteResult = await testGetQuote(quoteId);
  
  if (!quoteResult.success) {
    console.log('❌ Quote retrieval failed');
    console.log(`   Status: ${quoteResult.status}`);
    console.log(`   Error: ${quoteResult.error || JSON.stringify(quoteResult.data)}`);
    console.log('');
    console.log('💡 Make sure the quote ID exists and the server is running');
    process.exit(1);
  }

  console.log('✅ Quote retrieved successfully');
  console.log(`   Quote Number: ${quoteResult.data?.quote?.quoteNumber || 'N/A'}`);
  console.log(`   Customer: ${quoteResult.data?.quote?.inquiry?.name || 'N/A'}`);
  console.log(`   Email: ${quoteResult.data?.quote?.inquiry?.email || 'N/A'}`);
  console.log(`   Total: $${quoteResult.data?.quote?.amount || 'N/A'}`);
  console.log('');

  // Test 2: Send quote
  console.log('📧 Test 2: Send Quote');
  const sendResult = await testSendQuote(quoteId, mode);

  if (sendResult.success) {
    console.log('✅ Quote sent successfully!');
    console.log(`   Checkout URL: ${sendResult.data?.checkoutUrl || 'N/A'}`);
    console.log(`   Session ID: ${sendResult.data?.sessionId || 'N/A'}`);
    console.log('');
    console.log('🎉 All tests passed!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('   1. Check your email for the quote');
    console.log('   2. Verify the PDF attachment is included');
    console.log('   3. Test the Stripe checkout link');
    console.log('   4. Check the database for updated quote status');
  } else {
    console.log('❌ Quote sending failed');
    console.log(`   Status: ${sendResult.status}`);
    console.log(`   Error: ${sendResult.error || JSON.stringify(sendResult.data)}`);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check server logs for detailed error messages');
    console.log('   2. Verify Stripe configuration in .env');
    console.log('   3. Ensure email service is properly configured');
    console.log('   4. Check that the quote has a valid customer email');
  }

  console.log('');
  console.log('=====================================');
  console.log('🏁 Test completed');
}

// Run the test
main().catch((error) => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});


