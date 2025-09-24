#!/usr/bin/env node

/**
 * Comprehensive Email Diagnostic Script
 * 
 * This script performs deep analysis of the email system to identify delivery issues
 */

require('dotenv').config({ path: './.env' });
const fs = require('fs');
const path = require('path');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const levelColor = {
    'INFO': colors.green,
    'WARN': colors.yellow,
    'ERROR': colors.red,
    'DEBUG': colors.blue,
    'SUCCESS': colors.cyan
  }[level] || colors.reset;
  
  console.log(`${levelColor}[${level}]${colors.reset} ${timestamp} - ${message}`);
  if (data) {
    console.log(`${colors.blue}  Data:${colors.reset}`, JSON.stringify(data, null, 2));
  }
}

async function diagnoseEmailIssue() {
  console.log(`${colors.bright}${colors.cyan}🔍 COMPREHENSIVE EMAIL DIAGNOSTIC${colors.reset}`);
  console.log(`${colors.cyan}==========================================${colors.reset}\n`);

  const results = {
    envCheck: false,
    o365Config: false,
    sendGridConfig: false,
    smtpConfig: false,
    serverRunning: false,
    quoteRetrieval: false,
    emailSending: false,
    activeService: null,
    errors: []
  };

  try {
    // 1. Environment Variables Check
    log('INFO', 'Step 1: Checking Environment Variables');
    await checkEnvironmentVariables(results);

    // 2. Email Service Configuration
    log('INFO', 'Step 2: Analyzing Email Service Configurations');
    await checkEmailServiceConfigs(results);

    // 3. Server Connectivity
    log('INFO', 'Step 3: Testing Server Connectivity');
    await checkServerConnectivity(results);

    // 4. Database Quote Retrieval
    log('INFO', 'Step 4: Testing Quote Retrieval from Database');
    await testQuoteRetrieval(results);

    // 5. Email Service Testing
    log('INFO', 'Step 5: Testing Email Services');
    await testEmailServices(results);

    // 6. Full Quote Email Test
    log('INFO', 'Step 6: Testing Full Quote Email Flow');
    await testFullQuoteEmail(results);

    // 7. Generate Diagnostic Report
    log('INFO', 'Step 7: Generating Diagnostic Report');
    generateDiagnosticReport(results);

  } catch (error) {
    log('ERROR', 'Diagnostic failed with unexpected error', { error: error.message, stack: error.stack });
    results.errors.push(`Unexpected error: ${error.message}`);
  }
}

async function checkEnvironmentVariables(results) {
  const requiredVars = [
    // Office 365 / Microsoft Graph
    'MICROSOFT_CLIENT_ID',
    'MICROSOFT_CLIENT_SECRET',
    'MICROSOFT_TENANT_ID',
    'MICROSOFT_GRAPH_SCOPE',
    
    // SendGrid
    'SENDGRID_API_KEY',
    'SENDGRID_FROM_EMAIL',
    'SENDGRID_FROM_NAME',
    
    // SMTP Fallback
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    
    // App Configuration
    'APP_BASE_URL',
    'DATABASE_URL'
  ];

  const optionalVars = [
    'QUOTES_SMTP_HOST',
    'QUOTES_SMTP_USER',
    'QUOTES_SMTP_PASS',
    'SUPPORT_SMTP_HOST',
    'SUPPORT_SMTP_USER',
    'SUPPORT_SMTP_PASS',
    'GENERAL_SMTP_HOST',
    'GENERAL_SMTP_USER',
    'GENERAL_SMTP_PASS'
  ];

  let configuredCount = 0;
  let totalCount = requiredVars.length;

  log('DEBUG', 'Checking required environment variables');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value && value.trim() !== '' && !value.includes('your-') && !value.includes('SG.your-')) {
      log('SUCCESS', `✅ ${varName}: Configured`);
      configuredCount++;
    } else {
      log('WARN', `❌ ${varName}: Missing or invalid`);
      results.errors.push(`Missing required environment variable: ${varName}`);
    }
  });

  log('DEBUG', 'Checking optional environment variables');
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value && value.trim() !== '' && !value.includes('your-')) {
      log('SUCCESS', `✅ ${varName}: Configured`);
    } else {
      log('DEBUG', `⚪ ${varName}: Not configured (optional)`);
    }
  });

  results.envCheck = configuredCount >= (totalCount * 0.7); // At least 70% configured
  log('INFO', `Environment check: ${configuredCount}/${totalCount} required variables configured`);
}

async function checkEmailServiceConfigs(results) {
  // Check Office 365 / Microsoft Graph
  const o365Vars = ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET', 'MICROSOFT_TENANT_ID'];
  const o365Configured = o365Vars.every(varName => {
    const value = process.env[varName];
    return value && value.trim() !== '' && !value.includes('your-');
  });

  if (o365Configured) {
    log('SUCCESS', '✅ Office 365 / Microsoft Graph: Fully configured');
    results.o365Config = true;
  } else {
    log('WARN', '❌ Office 365 / Microsoft Graph: Missing configuration');
    results.errors.push('Office 365 configuration incomplete');
  }

  // Check SendGrid
  const sendGridVars = ['SENDGRID_API_KEY', 'SENDGRID_FROM_EMAIL'];
  const sendGridConfigured = sendGridVars.every(varName => {
    const value = process.env[varName];
    return value && value.trim() !== '' && !value.includes('your-') && !value.includes('SG.your-');
  });

  if (sendGridConfigured) {
    log('SUCCESS', '✅ SendGrid: Fully configured');
    results.sendGridConfig = true;
  } else {
    log('WARN', '❌ SendGrid: Missing configuration');
    results.errors.push('SendGrid configuration incomplete');
  }

  // Check SMTP
  const smtpVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
  const smtpConfigured = smtpVars.every(varName => {
    const value = process.env[varName];
    return value && value.trim() !== '' && !value.includes('your-');
  });

  if (smtpConfigured) {
    log('SUCCESS', '✅ SMTP: Fully configured');
    results.smtpConfig = true;
  } else {
    log('WARN', '❌ SMTP: Missing configuration');
    results.errors.push('SMTP configuration incomplete');
  }

  // Determine active service
  if (results.o365Config) {
    results.activeService = 'Office 365 / Microsoft Graph';
  } else if (results.sendGridConfig) {
    results.activeService = 'SendGrid';
  } else if (results.smtpConfig) {
    results.activeService = 'SMTP';
  } else {
    results.activeService = 'None - No email service configured';
  }

  log('INFO', `Active email service: ${results.activeService}`);
}

async function checkServerConnectivity(results) {
  try {
    const axios = require('axios');
    const response = await axios.get('http://localhost:5001/api/health', { 
      timeout: 5000,
      headers: { 'User-Agent': 'Email-Diagnostic-Script' }
    });
    
    log('SUCCESS', '✅ Server is running and responding');
    log('DEBUG', 'Server response', { status: response.status, data: response.data });
    results.serverRunning = true;
    
  } catch (error) {
    log('ERROR', '❌ Server connectivity failed', { 
      message: error.message,
      code: error.code,
      status: error.response?.status 
    });
    results.errors.push(`Server not responding: ${error.message}`);
  }
}

async function testQuoteRetrieval(results) {
  try {
    const axios = require('axios');
    const quoteId = "cmfvzmv040024bcmhp9yvuyor";
    
    log('DEBUG', `Attempting to retrieve quote: ${quoteId}`);
    const response = await axios.get(`http://localhost:5001/api/quotes/${quoteId}`, {
      timeout: 10000
    });
    
    log('SUCCESS', '✅ Quote retrieved successfully');
    log('DEBUG', 'Quote data', {
      id: response.data.id,
      quoteNumber: response.data.quoteNumber,
      customerEmail: response.data.inquiry?.email,
      status: response.data.status,
      amount: response.data.amount
    });
    
    results.quoteRetrieval = true;
    
  } catch (error) {
    log('ERROR', '❌ Quote retrieval failed', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    results.errors.push(`Quote retrieval failed: ${error.message}`);
  }
}

async function testEmailServices(results) {
  log('INFO', 'Testing individual email services...');
  
  // Test Office 365 if configured
  if (results.o365Config) {
    await testOffice365Service(results);
  }
  
  // Test SendGrid if configured
  if (results.sendGridConfig) {
    await testSendGridService(results);
  }
  
  // Test SMTP if configured
  if (results.smtpConfig) {
    await testSMTPService(results);
  }
}

async function testOffice365Service(results) {
  try {
    log('DEBUG', 'Testing Office 365 / Microsoft Graph service');
    
    // Import the O365 service
    const o365Service = require('./dist/services/o365EmailService').default;
    
    // Test with a simple email
    const testResult = await o365Service.sendEmail({
      to: 'kappamike@gmail.com',
      subject: 'O365 Test Email - Diagnostic',
      html: '<p>This is a test email from Office 365 service.</p>',
      text: 'This is a test email from Office 365 service.'
    });
    
    log('SUCCESS', '✅ Office 365 service test successful');
    
  } catch (error) {
    log('ERROR', '❌ Office 365 service test failed', { error: error.message });
    results.errors.push(`Office 365 test failed: ${error.message}`);
  }
}

async function testSendGridService(results) {
  try {
    log('DEBUG', 'Testing SendGrid service');
    
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: 'kappamike@gmail.com',
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'SendGrid Test Email - Diagnostic',
      text: 'This is a test email from SendGrid service.',
      html: '<p>This is a test email from SendGrid service.</p>'
    };
    
    await sgMail.send(msg);
    log('SUCCESS', '✅ SendGrid service test successful');
    
  } catch (error) {
    log('ERROR', '❌ SendGrid service test failed', { error: error.message });
    results.errors.push(`SendGrid test failed: ${error.message}`);
  }
}

async function testSMTPService(results) {
  try {
    log('DEBUG', 'Testing SMTP service');
    
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    // Verify connection
    await transporter.verify();
    log('SUCCESS', '✅ SMTP service test successful');
    
  } catch (error) {
    log('ERROR', '❌ SMTP service test failed', { error: error.message });
    results.errors.push(`SMTP test failed: ${error.message}`);
  }
}

async function testFullQuoteEmail(results) {
  try {
    log('INFO', 'Testing full quote email flow');
    
    const axios = require('axios');
    const quoteId = "cmfvzmv040024bcmhp9yvuyor";
    
    log('DEBUG', `Sending quote email for quote: ${quoteId}`);
    const response = await axios.post(`http://localhost:5001/api/quotes/${quoteId}/send`, {
      mode: "deposit"
    }, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    log('SUCCESS', '✅ Quote email sent successfully');
    log('DEBUG', 'Email response', {
      checkoutUrl: response.data.checkoutUrl,
      sessionId: response.data.sessionId,
      success: response.data.success
    });
    
    results.emailSending = true;
    
  } catch (error) {
    log('ERROR', '❌ Quote email sending failed', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    results.errors.push(`Quote email failed: ${error.message}`);
  }
}

function generateDiagnosticReport(results) {
  console.log(`\n${colors.bright}${colors.magenta}📊 DIAGNOSTIC REPORT${colors.reset}`);
  console.log(`${colors.magenta}===================${colors.reset}\n`);
  
  const checks = [
    { name: 'Environment Variables', status: results.envCheck },
    { name: 'Office 365 Config', status: results.o365Config },
    { name: 'SendGrid Config', status: results.sendGridConfig },
    { name: 'SMTP Config', status: results.smtpConfig },
    { name: 'Server Running', status: results.serverRunning },
    { name: 'Quote Retrieval', status: results.quoteRetrieval },
    { name: 'Email Sending', status: results.emailSending }
  ];
  
  checks.forEach(check => {
    const status = check.status ? 
      `${colors.green}✅ PASS${colors.reset}` : 
      `${colors.red}❌ FAIL${colors.reset}`;
    console.log(`${status} ${check.name}`);
  });
  
  console.log(`\n${colors.cyan}Active Email Service: ${results.activeService}${colors.reset}`);
  
  if (results.errors.length > 0) {
    console.log(`\n${colors.red}🚨 ISSUES FOUND:${colors.reset}`);
    results.errors.forEach((error, index) => {
      console.log(`${colors.red}${index + 1}.${colors.reset} ${error}`);
    });
  }
  
  // Recommendations
  console.log(`\n${colors.yellow}💡 RECOMMENDATIONS:${colors.reset}`);
  
  if (!results.envCheck) {
    console.log(`${colors.yellow}•${colors.reset} Fix missing environment variables in .env file`);
  }
  
  if (!results.serverRunning) {
    console.log(`${colors.yellow}•${colors.reset} Start the server: npm run build && node -r dotenv/config dist/server.js -p 5001`);
  }
  
  if (!results.emailSending) {
    console.log(`${colors.yellow}•${colors.reset} Check email service configuration and credentials`);
    console.log(`${colors.yellow}•${colors.reset} Verify email provider settings (2FA, app passwords, etc.)`);
    console.log(`${colors.yellow}•${colors.reset} Check spam folder for test emails`);
  }
  
  if (results.activeService === 'None - No email service configured') {
    console.log(`${colors.yellow}•${colors.reset} Configure at least one email service (Office 365, SendGrid, or SMTP)`);
  }
  
  // Save report to file
  const reportData = {
    timestamp: new Date().toISOString(),
    results,
    recommendations: results.errors
  };
  
  const reportPath = path.join(__dirname, 'email-diagnostic-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  
  console.log(`\n${colors.blue}📄 Full report saved to: ${reportPath}${colors.reset}`);
  
  // Overall status
  const overallSuccess = results.envCheck && results.serverRunning && results.emailSending;
  if (overallSuccess) {
    console.log(`\n${colors.green}🎉 EMAIL SYSTEM IS WORKING!${colors.reset}`);
  } else {
    console.log(`\n${colors.red}⚠️  EMAIL SYSTEM HAS ISSUES - See recommendations above${colors.reset}`);
  }
}

// Run the diagnostic
diagnoseEmailIssue().catch(error => {
  log('ERROR', 'Diagnostic script failed', { error: error.message, stack: error.stack });
  process.exit(1);
});