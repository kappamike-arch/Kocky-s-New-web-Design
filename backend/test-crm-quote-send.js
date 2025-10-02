#!/usr/bin/env node

/**
 * Test CRM Quote Send Functionality
 * 
 * This script tests the quote sending functionality that would be called
 * from the CRM admin panel when clicking "Save & Send to Client"
 */

require('dotenv').config();
const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:5001';
const TEST_QUOTE_ID = 'cmfum3jb80009bc4z85c15p0w'; // This should be a real quote ID from your database

async function testCRMQuoteSend() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TESTING CRM QUOTE SEND FUNCTIONALITY');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Check if the quote exists
    console.log('📋 Step 1: Checking if quote exists...');
    try {
      const quoteResponse = await axios.get(`${API_BASE_URL}/api/quotes/${TEST_QUOTE_ID}`);
      console.log('✅ Quote found:', quoteResponse.data.quoteNumber);
      console.log('   Customer:', quoteResponse.data.inquiry?.name);
      console.log('   Email:', quoteResponse.data.inquiry?.email);
      console.log('   Status:', quoteResponse.data.status);
    } catch (error) {
      console.log('❌ Quote not found or error:', error.response?.data?.message || error.message);
      console.log('   This might be expected if the quote ID is not real');
    }
    
    // Test 2: Try to send the quote
    console.log('\n📧 Step 2: Testing quote send functionality...');
    try {
      const sendResponse = await axios.post(`${API_BASE_URL}/api/quotes/${TEST_QUOTE_ID}/send`, {
        mode: 'full', // or 'deposit'
        email: 'kappamike@gmail.com' // for admin panel compatibility
      });
      
      console.log('✅ Quote sent successfully!');
      console.log('   Response:', sendResponse.data);
      
      if (sendResponse.data.checkoutUrl) {
        console.log('   Stripe URL:', sendResponse.data.checkoutUrl);
      }
      
    } catch (error) {
      console.log('❌ Quote send failed:', error.response?.data?.message || error.message);
      
      if (error.response?.data?.error) {
        console.log('   Error details:', error.response.data.error);
      }
      
      if (error.response?.status === 404) {
        console.log('   This is expected if the quote ID is not real');
      }
    }
    
    // Test 3: Test with a different endpoint (admin panel compatibility)
    console.log('\n📧 Step 3: Testing admin panel compatibility endpoint...');
    try {
      const sendResponse = await axios.post(`${API_BASE_URL}/api/quotes/${TEST_QUOTE_ID}/send-email`, {
        mode: 'full'
      });
      
      console.log('✅ Admin panel quote send successful!');
      console.log('   Response:', sendResponse.data);
      
    } catch (error) {
      console.log('❌ Admin panel quote send failed:', error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 CRM QUOTE SEND TEST COMPLETED');
  console.log('='.repeat(60));
  
  console.log('\n💡 TO TEST FROM THE ADMIN PANEL:');
  console.log('   1. Go to the CRM quote page');
  console.log('   2. Click "Save & Send to Client"');
  console.log('   3. Check the browser console for any errors');
  console.log('   4. Check the backend logs for detailed information');
  
  console.log('\n🔧 IF IT STILL DOESN\'T WORK:');
  console.log('   - Check the browser network tab for the API call');
  console.log('   - Verify the quote ID is correct');
  console.log('   - Check backend logs for detailed error messages');
}

// Run the test
if (require.main === module) {
  testCRMQuoteSend().catch((error) => {
    console.error('Test execution failed:', error.message);
    process.exit(1);
  });
}

module.exports = { testCRMQuoteSend };


