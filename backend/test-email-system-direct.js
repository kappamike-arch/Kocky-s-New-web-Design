#!/usr/bin/env node

/**
 * Direct Email System Test
 * This script tests the email system without relying on shell commands
 */

const fs = require('fs');
const path = require('path');

async function testEmailSystem() {
  console.log("🧪 TESTING EMAIL SYSTEM DIRECTLY");
  console.log("=================================\n");

  // 1. Check if .env file exists
  console.log("1. Checking .env file...");
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    console.log("   ✅ .env file exists");
    
    // Read and check content
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasSendGrid = envContent.includes('SENDGRID_API_KEY') && !envContent.includes('your-sendgrid-api-key-here');
    const hasSMTP = envContent.includes('SMTP_USER') && !envContent.includes('your-email@gmail.com');
    const hasStripe = envContent.includes('STRIPE_SECRET_KEY') && !envContent.includes('your_stripe_secret_key_here');
    
    console.log(`   📧 SendGrid configured: ${hasSendGrid ? 'YES' : 'NO'}`);
    console.log(`   📧 SMTP configured: ${hasSMTP ? 'YES' : 'NO'}`);
    console.log(`   💳 Stripe configured: ${hasStripe ? 'YES' : 'NO'}`);
    
    if (!hasSendGrid && !hasSMTP) {
      console.log("   ❌ No email service properly configured!");
      console.log("   💡 You need to configure at least one email service in .env");
    }
  } else {
    console.log("   ❌ .env file does not exist!");
    console.log("   💡 Run: node create-env-file.js");
    return;
  }

  // 2. Check if server is running
  console.log("\n2. Testing server connectivity...");
  try {
    const axios = require('axios');
    const response = await axios.get('http://localhost:5001/api/health', { timeout: 5000 });
    console.log("   ✅ Server is running and responding");
    console.log(`   📊 Status: ${response.status}`);
  } catch (error) {
    console.log("   ❌ Server is not responding");
    console.log(`   📋 Error: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log("   💡 Server is not running on port 5001");
      console.log("   💡 Start server: npm run build && node -r dotenv/config dist/server.js -p 5001");
    }
    return;
  }

  // 3. Test quote retrieval
  console.log("\n3. Testing quote retrieval...");
  try {
    const axios = require('axios');
    const quoteId = "cmfvzmv040024bcmhp9yvuyor";
    const response = await axios.get(`http://localhost:5001/api/quotes/${quoteId}`, { timeout: 10000 });
    console.log("   ✅ Quote retrieved successfully");
    console.log(`   📋 Quote Number: ${response.data.quoteNumber}`);
    console.log(`   👤 Customer: ${response.data.inquiry?.name}`);
    console.log(`   📧 Email: ${response.data.inquiry?.email}`);
    console.log(`   💰 Amount: $${response.data.amount}`);
  } catch (error) {
    console.log("   ❌ Quote retrieval failed");
    console.log(`   📋 Error: ${error.response?.data?.message || error.message}`);
    return;
  }

  // 4. Test email sending
  console.log("\n4. Testing email sending...");
  try {
    const axios = require('axios');
    const quoteId = "cmfvzmv040024bcmhp9yvuyor";
    
    console.log("   📤 Sending test quote email...");
    const response = await axios.post(`http://localhost:5001/api/quotes/${quoteId}/send`, {
      mode: "deposit"
    }, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log("   ✅ Email API call successful!");
    console.log(`   🔗 Stripe URL: ${response.data.checkoutUrl}`);
    console.log(`   🆔 Session ID: ${response.data.sessionId}`);
    
    console.log("\n🎉 EMAIL SENT SUCCESSFULLY!");
    console.log("============================");
    console.log("📧 Check your email at kappamike@gmail.com");
    console.log("🔍 Look in spam folder if not in inbox");
    console.log("📄 You should see:");
    console.log("   • Complete quote details");
    console.log("   • PDF attachment");
    console.log("   • Working 'Pay Now' button");
    
  } catch (error) {
    console.log("   ❌ Email sending failed");
    console.log(`   📋 Status: ${error.response?.status || 'No response'}`);
    console.log(`   📋 Error: ${error.response?.data?.message || error.message}`);
    
    if (error.response?.data) {
      console.log("   📋 Full error response:");
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    
    // Provide specific troubleshooting based on error
    if (error.message.includes('Authentication')) {
      console.log("\n💡 AUTHENTICATION ERROR:");
      console.log("   • Check email service credentials in .env");
      console.log("   • For Gmail: Use app password, not regular password");
      console.log("   • For SendGrid: Verify sender email is authenticated");
    }
    
    if (error.message.includes('Connection')) {
      console.log("\n💡 CONNECTION ERROR:");
      console.log("   • Check SMTP host and port settings");
      console.log("   • Verify network connectivity");
      console.log("   • Check firewall settings");
    }
  }

  // 5. Check server logs
  console.log("\n5. Checking server logs...");
  const logFiles = ['server.log', 'logs/app.log', 'logs/error.log'];
  let foundLogs = false;
  
  logFiles.forEach(logFile => {
    const logPath = path.join(__dirname, logFile);
    if (fs.existsSync(logPath)) {
      const stats = fs.statSync(logPath);
      const lastModified = new Date(stats.mtime);
      const now = new Date();
      const diffMinutes = Math.floor((now - lastModified) / (1000 * 60));
      
      console.log(`   📋 Found: ${logFile} (modified ${diffMinutes} minutes ago)`);
      
      if (diffMinutes < 10) {
        console.log("   📖 Recent log entries:");
        const content = fs.readFileSync(logPath, 'utf8');
        const lines = content.split('\n').slice(-5); // Last 5 lines
        lines.forEach(line => {
          if (line.trim()) {
            console.log(`      ${line}`);
          }
        });
      }
      foundLogs = true;
    }
  });
  
  if (!foundLogs) {
    console.log("   ⚠️  No recent log files found");
  }
}

// Run the test
testEmailSystem().catch(console.error);



