# Office 365 Email Setup Guide - Kocky's Bar & Grill

## 🚨 **Current Issue: Invalid Client Secret**

The Office 365 authentication is failing with error:
```
AADSTS7000215: Invalid client secret provided. Ensure the secret being sent in the request is the client secret value, not the client secret ID
```

## 🔧 **Solution: Get Correct Client Secret**

### **Step 1: Access Azure Portal**

1. Go to [portal.azure.com](https://portal.azure.com)
2. Sign in with your Office 365 admin account
3. Navigate to **Azure Active Directory** → **App registrations**

### **Step 2: Find Your App Registration**

1. Look for app with Client ID: `46b54378-7023-4746-845f-514f2fc40f8a`
2. Click on the app name to open it

### **Step 3: Generate New Client Secret**

1. In the app registration, go to **Certificates & secrets**
2. Click **+ New client secret**
3. Add a description: "Kocky's Email Service"
4. Choose expiration: **24 months** (recommended)
5. Click **Add**
6. **IMPORTANT**: Copy the **Value** (not the Secret ID)
7. The value will look like: `abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`

### **Step 4: Update .env File**

Replace the current client secret in your `.env` file:

```bash
# Update this line with the new secret VALUE (not ID)
O365_CLIENT_SECRET=your-new-secret-value-here
```

### **Step 5: Verify API Permissions**

1. In your app registration, go to **API permissions**
2. Ensure you have these permissions:
   - `Microsoft Graph` → `Mail.Send` (Application permission)
   - `Microsoft Graph` → `User.Read.All` (Application permission)
3. Click **Grant admin consent** if not already done

## 🧪 **Test the Configuration**

After updating the client secret:

```bash
# Test Office 365 service
node test-o365-email.js

# Test reservation with real email
curl -X POST http://localhost:5001/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "guestName": "Your Name",
    "guestEmail": "your-email@example.com",
    "guestPhone": "555-123-4567",
    "date": "2024-12-25T00:00:00.000Z",
    "time": "19:00",
    "partySize": 4,
    "specialRequests": "Testing Office 365 email"
  }'
```

## 🚀 **Alternative: Quick Setup with SendGrid**

If you need immediate email functionality, use SendGrid:

### **Step 1: Sign up for SendGrid**
1. Go to [sendgrid.com](https://sendgrid.com)
2. Create a free account (100 emails/day)

### **Step 2: Get API Key**
1. Go to Settings → API Keys
2. Create new API key with "Mail Send" permissions
3. Copy the API key (starts with `SG.`)

### **Step 3: Update .env**
```bash
# Comment out Office 365
# O365_CLIENT_ID=46b54378-7023-4746-845f-514f2fc40f8a
# O365_TENANT_ID=8eb62d31-a2c3-4af1-a6ac-da1ed966dd14
# O365_CLIENT_SECRET=2je8Q~mXwctPuMo4qxsinNmvlajkFQOZEinkWby

# Enable SendGrid
SENDGRID_API_KEY=SG.your-actual-sendgrid-api-key-here
SENDGRID_FROM_EMAIL=info@kockysbar.com
SENDGRID_FROM_NAME=Kocky's Bar & Grill
```

### **Step 4: Restart Server**
```bash
pkill -f "node dist/server.js"
node dist/server.js
```

## 📧 **Expected Email Behavior**

When working correctly, you should see:

**Logs:**
```
✅ Email sent to info@kockysbar.com via Office 365 Graph API
✅ Email sent to customer@example.com via Office 365 Graph API
```

**Emails Sent:**
1. **Internal notification** to `info@kockysbar.com` with reservation details
2. **Customer confirmation** to the customer's email

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **Invalid Client Secret**
   - Solution: Generate new client secret in Azure Portal
   - Make sure you copy the **Value**, not the Secret ID

2. **Insufficient Permissions**
   - Solution: Add `Mail.Send` permission and grant admin consent

3. **Token Expired**
   - Solution: The system automatically refreshes tokens
   - Check logs for authentication errors

4. **Email Not Received**
   - Check spam folder
   - Verify the from email address is correct
   - Check Office 365 admin settings

## 📞 **Current Configuration**

```
Client ID: 46b54378-7023-4746-845f-514f2fc40f8a
Tenant ID: 8eb62d31-a2c3-4af1-a6ac-da1ed966dd14
From Email: info@kockysbar.com
```

**⚠️ Action Required:** Update the client secret with a valid value from Azure Portal.

---

**💡 Recommendation: Get a new client secret from Azure Portal, or use SendGrid for immediate email functionality.**

