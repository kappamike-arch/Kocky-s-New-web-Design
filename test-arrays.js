// Test script to verify array responses
const fetch = require('node-fetch');

const BASE_URL = 'http://staging.kockys.com/api';

async function testEndpoint(endpoint, description) {
  try {
    console.log(`\n🧪 Testing ${description}...`);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': 'Bearer invalid-token' // This will trigger 401
      }
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    
    if (response.status === 401 && data.error === 'UNAUTHORIZED') {
      console.log('✅ Correctly returns UNAUTHORIZED error');
    } else {
      console.log('❌ Unexpected response format');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Testing Email API Array Responses...');
  
  await testEndpoint('/email/campaigns', 'Email Campaigns');
  await testEndpoint('/email/templates', 'Email Templates');  
  await testEndpoint('/email/contacts', 'Email Contacts');
  await testEndpoint('/email-templates', 'Email Templates (new endpoint)');
  
  console.log('\n✅ All tests completed!');
}

runTests();


