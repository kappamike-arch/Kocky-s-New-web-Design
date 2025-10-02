#!/usr/bin/env node

/**
 * Quick Email Check Script
 * Simple diagnostic to identify why emails aren't being sent
 */

require('dotenv').config({ path: './.env' });

async function quickEmailCheck() {
  console.log("🔍 QUICK EMAIL DIAGNOSTIC");
  console.log("=======================\n");

  try {
    // 1. Check if server is running
    console.log("1. Checking server status...");
    try {
      const axios = require('axios');
      const response = await axios.get('http://localhost:5001/api/health', { timeout: 5000 });
      console.log("   ✅ Server is running");
    } catch (error) {
      console.log("   ❌ Server is NOT running");
      console.log("   💡 Start server: npm run build && node -r dotenv/config dist/server.js -p 5001");
      return;
    }

    // 2. Check environment variables
    console.log("\n2. Checking email configuration...");
    const emailVars = {
      'SENDGRID_API_KEY': process.env.SENDGRID_API_KEY,
      'SENDGRID_FROM_EMAIL': process.env.SENDGRID_FROM_EMAIL,
      'SMTP_HOST': process.env.SMTP_HOST,
      'SMTP_USER': process.env.SMTP_USER,
      'SMTP_PASS': process.env.SMTP_PASS,
      'MICROSOFT_CLIENT_ID': process.env.MICROSOFT_CLIENT_ID,
      'MICROSOFT_CLIENT_SECRET': process.env.MICROSOFT_CLIENT_SECRET
    };

    let configuredServices = [];
    Object.entries(emailVars).forEach(([key, value]) => {
      if (value && value !== '' && !value.includes('your-') && !value.includes('SG.your-')) {
        console.log(`   ✅ ${key}: Configured`);
        if (key.includes('SENDGRID')) configuredServices.push('SendGrid');
        if (key.includes('SMTP')) configuredServices.push('SMTP');
        if (key.includes('MICROSOFT')) configuredServices.push('Office365');
      } else {
        console.log(`   ❌ ${key}: Not configured`);
      }
    });

    console.log(`   📊 Configured services: ${configuredServices.length > 0 ? configuredServices.join(', ') : 'None'}`);

    // 3. Test quote retrieval
    console.log("\n3. Testing quote retrieval...");
    try {
      const axios = require('axios');
      const quoteId = "cmfvzmv040024bcmhp9yvuyor";
      const response = await axios.get(`http://localhost:5001/api/quotes/${quoteId}`);
      console.log("   ✅ Quote retrieved successfully");
      console.log(`   📧 Customer email: ${response.data.inquiry?.email}`);
    } catch (error) {
      console.log("   ❌ Quote retrieval failed:", error.response?.data?.message || error.message);
    }

    // 4. Test email sending
    console.log("\n4. Testing email sending...");
    try {
      const axios = require('axios');
      const quoteId = "cmfvzmv040024bcmhp9yvuyor";
      
      console.log("   📤 Sending test email...");
      const response = await axios.post(`http://localhost:5001/api/quotes/${quoteId}/send`, {
        mode: "deposit"
      }, {
        timeout: 30000
      });
      
      console.log("   ✅ Email API call successful");
      console.log(`   🔗 Stripe URL: ${response.data.checkoutUrl}`);
      console.log(`   🆔 Session ID: ${response.data.sessionId}`);
      
    } catch (error) {
      console.log("   ❌ Email sending failed:");
      console.log(`   📋 Status: ${error.response?.status || 'No response'}`);
      console.log(`   📋 Error: ${error.response?.data?.message || error.message}`);
      
      if (error.response?.data) {
        console.log("   📋 Full error:", JSON.stringify(error.response.data, null, 2));
      }
    }

    // 5. Check server logs
    console.log("\n5. Checking for recent server logs...");
    try {
      const fs = require('fs');
      const logFiles = ['server.log', 'logs/app.log'];
      let foundLogs = false;
      
      logFiles.forEach(logFile => {
        if (fs.existsSync(logFile)) {
          const stats = fs.statSync(logFile);
          const lastModified = new Date(stats.mtime);
          const now = new Date();
          const diffMinutes = Math.floor((now - lastModified) / (1000 * 60));
          
          console.log(`   📋 Found: ${logFile} (modified ${diffMinutes} minutes ago)`);
          
          if (diffMinutes < 5) {
            console.log("   📖 Recent log entries:");
            const content = fs.readFileSync(logFile, 'utf8');
            const lines = content.split('\n').slice(-10); // Last 10 lines
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
        console.log("   ⚠️  No log files found");
      }
      
    } catch (error) {
      console.log("   ❌ Error checking logs:", error.message);
    }

    console.log("\n🎯 DIAGNOSIS SUMMARY:");
    console.log("=====================");
    console.log("If email API call was successful but you didn't receive email:");
    console.log("1. Check spam/junk folder");
    console.log("2. Check email service configuration");
    console.log("3. Verify email provider settings");
    console.log("4. Check if email service is rate-limited");
    console.log("5. Try a different email address");

  } catch (error) {
    console.error("❌ Diagnostic failed:", error.message);
  }
}

// Run the diagnostic
quickEmailCheck();



