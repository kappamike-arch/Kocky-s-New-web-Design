#!/usr/bin/env node

/**
 * Email Configuration Setup Script
 * 
 * This script helps configure email services for Kocky's Bar & Grill
 * reservation system. It provides options for SendGrid, Gmail SMTP, and other providers.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupEmailConfig() {
  console.log('🔧 Kocky\'s Bar & Grill - Email Configuration Setup\n');
  
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  // Read existing .env file if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  console.log('Choose your email service provider:');
  console.log('1. SendGrid (Recommended for production)');
  console.log('2. Gmail SMTP (Good for testing)');
  console.log('3. Office 365 SMTP');
  console.log('4. Custom SMTP');
  console.log('5. Skip email configuration (emails will be logged only)\n');

  const choice = await question('Enter your choice (1-5): ');

  switch (choice) {
    case '1':
      await setupSendGrid(envContent, envPath);
      break;
    case '2':
      await setupGmailSMTP(envContent, envPath);
      break;
    case '3':
      await setupOffice365SMTP(envContent, envPath);
      break;
    case '4':
      await setupCustomSMTP(envContent, envPath);
      break;
    case '5':
      console.log('✅ Skipping email configuration. Emails will be logged to console/logs only.');
      break;
    default:
      console.log('❌ Invalid choice. Please run the script again.');
  }

  rl.close();
}

async function setupSendGrid(envContent, envPath) {
  console.log('\n📧 Setting up SendGrid...\n');
  
  const apiKey = await question('Enter your SendGrid API Key (starts with SG.): ');
  const fromEmail = await question('Enter your from email (e.g., noreply@kockysbar.com): ');
  const fromName = await question('Enter your from name (e.g., Kocky\'s Bar & Grill): ');

  // Update or add SendGrid configuration
  envContent = updateEnvVar(envContent, 'SENDGRID_API_KEY', apiKey);
  envContent = updateEnvVar(envContent, 'SENDGRID_FROM_EMAIL', fromEmail);
  envContent = updateEnvVar(envContent, 'SENDGRID_FROM_NAME', fromName);

  // Comment out SMTP settings
  envContent = commentOutSMTP(envContent);

  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ SendGrid configuration saved!');
  console.log('📝 Make sure to restart your backend server for changes to take effect.');
}

async function setupGmailSMTP(envContent, envPath) {
  console.log('\n📧 Setting up Gmail SMTP...\n');
  console.log('⚠️  Note: You need to enable 2FA and create an App Password for Gmail.');
  console.log('   Go to: https://myaccount.google.com/apppasswords\n');

  const email = await question('Enter your Gmail address: ');
  const appPassword = await question('Enter your Gmail App Password (16 characters): ');

  // Update SMTP configuration
  envContent = updateEnvVar(envContent, 'SMTP_HOST', 'smtp.gmail.com');
  envContent = updateEnvVar(envContent, 'SMTP_PORT', '587');
  envContent = updateEnvVar(envContent, 'SMTP_USER', email);
  envContent = updateEnvVar(envContent, 'SMTP_PASS', appPassword);
  envContent = updateEnvVar(envContent, 'SMTP_SECURE', 'false');

  // Comment out SendGrid
  envContent = commentOutSendGrid(envContent);

  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Gmail SMTP configuration saved!');
  console.log('📝 Make sure to restart your backend server for changes to take effect.');
}

async function setupOffice365SMTP(envContent, envPath) {
  console.log('\n📧 Setting up Office 365 SMTP...\n');

  const email = await question('Enter your Office 365 email address: ');
  const password = await question('Enter your Office 365 password: ');

  // Update SMTP configuration
  envContent = updateEnvVar(envContent, 'SMTP_HOST', 'smtp.office365.com');
  envContent = updateEnvVar(envContent, 'SMTP_PORT', '587');
  envContent = updateEnvVar(envContent, 'SMTP_USER', email);
  envContent = updateEnvVar(envContent, 'SMTP_PASS', password);
  envContent = updateEnvVar(envContent, 'SMTP_SECURE', 'false');

  // Comment out SendGrid
  envContent = commentOutSendGrid(envContent);

  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Office 365 SMTP configuration saved!');
  console.log('📝 Make sure to restart your backend server for changes to take effect.');
}

async function setupCustomSMTP(envContent, envPath) {
  console.log('\n📧 Setting up Custom SMTP...\n');

  const host = await question('Enter SMTP host (e.g., smtp.yourdomain.com): ');
  const port = await question('Enter SMTP port (usually 587 or 465): ');
  const user = await question('Enter SMTP username: ');
  const pass = await question('Enter SMTP password: ');
  const secure = await question('Use SSL/TLS? (y/n): ');

  // Update SMTP configuration
  envContent = updateEnvVar(envContent, 'SMTP_HOST', host);
  envContent = updateEnvVar(envContent, 'SMTP_PORT', port);
  envContent = updateEnvVar(envContent, 'SMTP_USER', user);
  envContent = updateEnvVar(envContent, 'SMTP_PASS', pass);
  envContent = updateEnvVar(envContent, 'SMTP_SECURE', secure.toLowerCase() === 'y' ? 'true' : 'false');

  // Comment out SendGrid
  envContent = commentOutSendGrid(envContent);

  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Custom SMTP configuration saved!');
  console.log('📝 Make sure to restart your backend server for changes to take effect.');
}

function updateEnvVar(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  const newLine = `${key}="${value}"`;
  
  if (regex.test(content)) {
    return content.replace(regex, newLine);
  } else {
    return content + `\n${newLine}`;
  }
}

function commentOutSendGrid(content) {
  return content
    .replace(/^SENDGRID_API_KEY=/gm, '# SENDGRID_API_KEY=')
    .replace(/^SENDGRID_FROM_EMAIL=/gm, '# SENDGRID_FROM_EMAIL=')
    .replace(/^SENDGRID_FROM_NAME=/gm, '# SENDGRID_FROM_NAME=');
}

function commentOutSMTP(content) {
  return content
    .replace(/^SMTP_HOST=/gm, '# SMTP_HOST=')
    .replace(/^SMTP_PORT=/gm, '# SMTP_PORT=')
    .replace(/^SMTP_USER=/gm, '# SMTP_USER=')
    .replace(/^SMTP_PASS=/gm, '# SMTP_PASS=')
    .replace(/^SMTP_SECURE=/gm, '# SMTP_SECURE=');
}

// Run the setup
setupEmailConfig().catch(console.error);
