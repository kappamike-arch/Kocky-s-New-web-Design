# Email Troubleshooting Guide

## 🚨 **ROOT CAUSE IDENTIFIED**

**The main issue: No `.env` file exists!**

Your server is running without email configuration, which is why emails aren't being sent despite the API calls succeeding.

## 🔧 **IMMEDIATE FIX**

### **Step 1: Create .env File**
```bash
cd backend
node create-env-file.js
```

### **Step 2: Configure Email Service**
Edit the `.env` file and replace these placeholder values:

#### **Option A: SendGrid (Recommended)**
```env
SENDGRID_API_KEY=SG.your-actual-sendgrid-api-key
SENDGRID_FROM_EMAIL=your-verified-email@domain.com
SENDGRID_FROM_NAME=Kocky's Bar & Grill
```

#### **Option B: Gmail SMTP**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

#### **Option C: Office 365**
```env
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_TENANT_ID=your-tenant-id
```

### **Step 3: Configure Stripe**
```env
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_key
```

### **Step 4: Restart Server**
```bash
npm run build
pkill -f "node.*server"
nohup node -r dotenv/config dist/server.js -p 5001 > server.log 2>&1 &
```

### **Step 5: Test Email System**
```bash
node check-server-status.js
```

## 📧 **EMAIL SERVICE SETUP INSTRUCTIONS**

### **SendGrid Setup (Recommended)**
1. Go to [SendGrid.com](https://sendgrid.com)
2. Create account and verify your email
3. Go to Settings > API Keys
4. Create new API key with "Full Access"
5. Copy the API key (starts with `SG.`)
6. Go to Settings > Sender Authentication
7. Verify a sender email address
8. Use verified email in `SENDGRID_FROM_EMAIL`

### **Gmail SMTP Setup**
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account Settings > Security
3. Generate an "App Password" for "Mail"
4. Use your Gmail address and the app password
5. Set `SMTP_USER=your-email@gmail.com`
6. Set `SMTP_PASS=your-16-character-app-password`

### **Office 365 Setup**
1. Go to [Azure Portal](https://portal.azure.com)
2. Register a new application
3. Add Microsoft Graph permissions
4. Create a client secret
5. Copy Client ID, Client Secret, and Tenant ID

## 🧪 **TESTING STEPS**

### **1. Check Server Status**
```bash
node check-server-status.js
```

### **2. Test Email Configuration**
```bash
node quick-email-check.js
```

### **3. Send Test Quote Email**
```bash
node test-quote-fixes-comprehensive.js
```

## 🔍 **COMMON ISSUES & SOLUTIONS**

### **Issue: "No email service configured"**
**Solution:** Make sure at least one email service is properly configured in `.env`

### **Issue: "Authentication failed"**
**Solution:** 
- Check credentials are correct
- For Gmail: Use app password, not regular password
- For SendGrid: Verify sender email is authenticated

### **Issue: "Email sent but not received"**
**Solution:**
- Check spam/junk folder
- Verify sender email is not blocked
- Check email service rate limits

### **Issue: "Stripe checkout link not working"**
**Solution:**
- Verify `STRIPE_SECRET_KEY` is correct
- Check Stripe account is active
- Ensure webhook endpoints are configured

## 📊 **VERIFICATION CHECKLIST**

After setup, verify these items:

- [ ] `.env` file exists with real credentials
- [ ] Server restarted with new configuration
- [ ] At least one email service configured
- [ ] Stripe API key configured
- [ ] Test email sent successfully
- [ ] Email received in inbox (check spam)
- [ ] PDF attachment included
- [ ] Payment link works
- [ ] Quote details visible

## 🚀 **QUICK START COMMANDS**

```bash
# 1. Create .env file
node create-env-file.js

# 2. Edit .env with your credentials
nano .env

# 3. Restart server
npm run build && pkill -f "node.*server" && nohup node -r dotenv/config dist/server.js -p 5001 > server.log 2>&1 &

# 4. Test system
node check-server-status.js

# 5. Send test email
node test-quote-fixes-comprehensive.js
```

## 💡 **PRO TIPS**

1. **Use SendGrid for production** - Most reliable delivery
2. **Test with multiple email addresses** - Some providers block certain domains
3. **Check server logs** - `tail -f server.log` for detailed error messages
4. **Start with Gmail SMTP** - Easiest to set up for testing
5. **Verify sender authentication** - Required for most email services

## 🎯 **EXPECTED RESULT**

After proper configuration, you should receive emails with:
- ✅ Complete quote details
- ✅ PDF attachment
- ✅ Working payment link
- ✅ Professional design

The quote email system will be fully functional! 🎉

