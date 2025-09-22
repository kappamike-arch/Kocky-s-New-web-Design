# Office 365 Email Service Setup Guide

## ✅ **IMPLEMENTATION COMPLETE**

The Office 365 email service has been successfully implemented and is ready to send transactional emails for all inquiry systems on the Kocky's Bar & Grill website.

## 🔧 **Configuration**

### **Environment Variables (.env)**
```bash
# Office 365 OAuth2 Configuration
O365_CLIENT_ID=46b54378-7023-4746-845f-514f2fc40f8a
O365_TENANT_ID=8eb62d31-a2c3-4af1-a6ac-da1ed966dd14
O365_CLIENT_SECRET=4vs8Q~1T43tm61ndeOPRfyrP1GW.ZFFjHbk6CcLf
O365_FROM_EMAIL=info@kockys.com
O365_FROM_NAME=Kocky's Bar & Grill

# Office 365 Graph API Configuration
GRAPH_API_ENDPOINT=https://graph.microsoft.com/v1.0
OAUTH_TOKEN_ENDPOINT=https://login.microsoftonline.com/8eb62d31-a2c3-4af1-a6ac-da1ed966dd14/oauth2/v2.0/token
```

## 🏗️ **Architecture**

### **Services Created**
1. **`src/services/o365AuthService.ts`** - OAuth2 authentication service
2. **`src/services/o365EmailService.ts`** - Microsoft Graph API email service
3. **Updated `src/utils/email.ts`** - Centralized email utility with Office 365 priority

### **Controllers Updated**
1. **`src/controllers/reservation.controller.ts`** - Reservation email notifications
2. **`src/controllers/contact.controller.ts`** - Contact form email notifications
3. **`src/controllers/jobs.controller.ts`** - Job application email notifications
4. **`src/controllers/unified-forms.controller.ts`** - Catering/event email notifications

## 📧 **Email Templates**

### **Reservation System**
- **Admin Notification** → `info@kockys.com`
  - Complete reservation details
  - Customer information
  - Confirmation code
  - Action required notice

- **Customer Confirmation** → `guestEmail`
  - Branded confirmation email
  - Reservation details
  - Confirmation code
  - Contact information

### **Contact Form**
- **Admin Notification** → `info@kockys.com`
  - Complete inquiry details
  - Customer information
  - Confirmation code
  - Action required notice

- **Customer Confirmation** → `contactEmail`
  - Branded confirmation email
  - Inquiry details
  - Confirmation code
  - Response timeline

### **Job Applications**
- **Admin Notification** → `info@kockys.com`
  - Complete application details
  - Applicant information
  - Resume information
  - Action required notice

- **Customer Confirmation** → `applicantEmail`
  - Branded confirmation email
  - Application details
  - Application ID
  - Review timeline

### **Catering/Events**
- **Admin Notification** → `info@kockys.com`
  - Complete event details
  - Customer information
  - Event specifications
  - Action required notice

- **Customer Confirmation** → `customerEmail`
  - Branded confirmation email
  - Event details
  - Confirmation code
  - Follow-up timeline

## 🧪 **Testing**

### **Test Scripts**
1. **`test-o365-email-complete.js`** - Comprehensive Office 365 service test
2. **`test-email-to-kappamike.js`** - Kappamike-specific email test

### **Running Tests**
```bash
# Test Office 365 service
node test-o365-email-complete.js

# Test with Kappamike@gmail.com
node test-email-to-kappamike.js
```

### **API Testing**
```bash
# Test reservation system
curl -X POST http://localhost:5001/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "guestName": "Mike Kappa",
    "guestEmail": "Kappamike@gmail.com",
    "guestPhone": "555-123-4567",
    "date": "2024-12-25T00:00:00.000Z",
    "time": "19:00",
    "partySize": 4,
    "specialRequests": "Testing email service"
  }'

# Test contact form
curl -X POST http://localhost:5001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mike Kappa",
    "email": "Kappamike@gmail.com",
    "phone": "555-123-4567",
    "subject": "Email Service Test",
    "message": "Testing the Office 365 email service"
  }'
```

## 📊 **Expected Logs on Success**

### **Authentication Success**
```
✅ Office 365 access token obtained successfully
Token expires in: 3600 seconds
```

### **Email Sending Success**
```
✅ Email sent to Kappamike@gmail.com via Office 365 Graph API
✅ Email sent to info@kockys.com via Office 365 Graph API
```

### **API Response Success**
```json
{
  "success": true,
  "message": "Reservation created successfully",
  "reservation": { ... },
  "emailStatus": {
    "adminSent": true,
    "customerSent": true
  }
}
```

## 🔄 **Token Management**

### **Automatic Token Refresh**
- Tokens are automatically refreshed when they expire
- 1-minute buffer before expiry to prevent failures
- Failed authentication attempts clear the token for retry

### **Token Information**
```javascript
const tokenInfo = o365AuthService.getTokenInfo();
console.log('Token expires in:', tokenInfo.expiresIn, 'ms');
console.log('Is expired:', tokenInfo.isExpired);
```

## 🚨 **Error Handling**

### **Authentication Errors**
- Invalid client secret → Clear token and retry
- Network errors → Log and retry with backoff
- Configuration errors → Clear error messages

### **Email Sending Errors**
- Graph API errors → Log detailed error information
- Network timeouts → Retry with exponential backoff
- Invalid recipients → Log and continue processing

### **Fallback Strategy**
1. **Primary**: Office 365 Graph API
2. **Fallback 1**: SendGrid (if configured)
3. **Fallback 2**: SMTP (if configured)
4. **Final**: Log email details for manual sending

## 🔧 **Troubleshooting**

### **Common Issues**

#### **1. Invalid Client Secret**
```
AADSTS7000215: Invalid client secret provided
```
**Solution**: Get a new client secret from Azure Portal

#### **2. Token Expired**
```
Office 365 authentication failed
```
**Solution**: Token will auto-refresh, check network connectivity

#### **3. Graph API Permission Denied**
```
Insufficient privileges to complete the operation
```
**Solution**: Ensure app has `Mail.Send` permission in Azure

### **Debug Commands**
```bash
# Check service status
node -e "const service = require('./dist/services/o365EmailService').default; console.log(service.getServiceStatus());"

# Test authentication only
node -e "const auth = require('./dist/services/o365AuthService').default; auth.getAccessToken().then(console.log).catch(console.error);"
```

## 📈 **Performance**

### **Token Caching**
- Access tokens are cached in memory
- Automatic refresh prevents API rate limiting
- 1-minute buffer ensures no expired token usage

### **Email Batching**
- Multiple emails sent in parallel
- No blocking on individual email failures
- Comprehensive error logging

### **Rate Limiting**
- Microsoft Graph API has built-in rate limiting
- Service handles 429 responses gracefully
- Exponential backoff for retries

## 🎯 **Next Steps**

### **Production Deployment**
1. ✅ Office 365 credentials configured
2. ✅ All inquiry systems updated
3. ✅ Email templates implemented
4. ✅ Error handling in place
5. ✅ Testing scripts ready

### **Monitoring**
- Monitor email delivery rates
- Track authentication token refresh
- Log email failures for analysis
- Set up alerts for service issues

## 🎉 **Success Criteria**

### **✅ All Systems Operational**
- ✅ Office 365 authentication working
- ✅ Microsoft Graph API integration complete
- ✅ All inquiry systems sending emails
- ✅ Admin notifications working
- ✅ Customer confirmations working
- ✅ Error handling robust
- ✅ Fallback mechanisms in place

### **📧 Email Delivery Confirmed**
- ✅ Emails sent to `info@kockys.com`
- ✅ Emails sent to `Kappamike@gmail.com`
- ✅ All inquiry types tested
- ✅ HTML templates rendering correctly
- ✅ Confirmation codes included

The Office 365 email service is now fully operational and ready for production use!