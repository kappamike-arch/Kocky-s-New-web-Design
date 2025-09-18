# Azure Email Integration Guide

## Overview

This guide walks you through the Azure email integration for Kocky's Bar & Grill email system. The integration provides OAuth2 authentication with Microsoft Azure/Office 365 for sending emails, with fallback to traditional SMTP.

## Architecture

The email system now supports three modes:

1. **Azure OAuth2** - Uses Microsoft Azure AD authentication
2. **SMTP** - Traditional SMTP authentication  
3. **Auto** - Automatically selects the best available provider

## Components

### Backend Services

#### 1. AzureMailerService (`/backend/src/services/AzureMailerService.ts`)
- Handles Azure OAuth2 authentication using MSAL
- Manages access token acquisition and refresh
- Creates nodemailer transporter with OAuth2

#### 2. UnifiedEmailService (`/backend/src/services/UnifiedEmailService.ts`)
- Orchestrates between Azure and SMTP providers
- Provides fallback mechanisms
- Handles provider selection logic

#### 3. Azure Email Controller (`/backend/src/controllers/azure-email.controller.ts`)
- API endpoints for Azure email management
- Test email functionality
- Provider configuration

### Frontend Components

#### 1. Azure Email API (`/admin-panel/src/lib/azure-email-api.ts`)
- TypeScript client for Azure email APIs
- Type-safe request/response handling

#### 2. Azure Email Page (`/admin-panel/src/app/azure-email/page.tsx`)
- React component for managing email configuration
- Provider status display
- Test email functionality

## Setup Instructions

### 1. Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: `Kocky's Email Service`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: Leave blank for now
5. Click **Register**

### 2. Configure API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Application permissions**
5. Add the following permissions:
   - `Mail.Send` - Send mail as any user
   - `User.Read.All` - Read all users' full profiles (if needed)
6. Click **Grant admin consent**

### 3. Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description: `Email Service Secret`
4. Choose expiration (recommend 24 months)
5. Click **Add**
6. **Copy the secret value immediately** (you won't see it again)

### 4. Environment Variables

Add these environment variables to your backend `.env` file:

```bash
# Azure Configuration
AZURE_CLIENT_ID=your-app-client-id
AZURE_CLIENT_SECRET=your-client-secret-value
AZURE_TENANT_ID=your-tenant-id
AZURE_FROM_EMAIL=info@kockys.com
AZURE_FROM_NAME=Kocky's Bar & Grill

# SMTP Configuration (fallback)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=info@kockys.com
SMTP_PASS=your-smtp-password
```

### 5. Domain Configuration

1. In Azure AD, go to **Custom domain names**
2. Add your domain `kockys.com`
3. Verify domain ownership
4. Set as primary domain

## API Endpoints

### Get Email Status
```http
GET /api/azure-email/status
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "providers": {
      "azure": true,
      "smtp": true,
      "preferred": "azure"
    },
    "azure": {
      "configured": true,
      "config": {
        "fromEmail": "info@kockys.com",
        "fromName": "Kocky's Bar & Grill"
      }
    }
  }
}
```

### Test Email
```http
POST /api/azure-email/test
Authorization: Bearer <token>
Content-Type: application/json

{
  "toEmail": "test@example.com",
  "provider": "azure"
}
```

### Set Provider
```http
POST /api/azure-email/provider
Authorization: Bearer <token>
Content-Type: application/json

{
  "provider": "azure"
}
```

### Send Email
```http
POST /api/azure-email/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": "customer@example.com",
  "subject": "Welcome to Kocky's!",
  "html": "<h1>Welcome!</h1>",
  "text": "Welcome!",
  "provider": "azure"
}
```

## Usage Examples

### 1. Using the Unified Email Service

```typescript
import { unifiedEmailService } from './services/UnifiedEmailService';

// Send email with automatic provider selection
await unifiedEmailService.sendEmail({
  to: 'customer@example.com',
  subject: 'Reservation Confirmed',
  html: '<h1>Your reservation is confirmed!</h1>',
  provider: 'auto' // or 'azure', 'smtp'
});
```

### 2. Direct Azure Usage

```typescript
import { azureMailerService } from './services/AzureMailerService';

// Check if Azure is configured
if (azureMailerService.isConfigured()) {
  await azureMailerService.sendEmail(
    'customer@example.com',
    'Welcome!',
    '<h1>Welcome to Kocky\'s!</h1>'
  );
}
```

### 3. Frontend Integration

```typescript
import { testAzureEmail, getAzureEmailStatus } from '@/lib/azure-email-api';

// Test email service
const result = await testAzureEmail({
  toEmail: 'test@example.com',
  provider: 'azure'
});

// Get status
const status = await getAzureEmailStatus();
console.log('Azure configured:', status.data.providers.azure);
```

## Email Templates

The system supports rich HTML email templates with:

- **Reservation Confirmations** - Automated booking confirmations
- **Quote Delivery** - Custom quotes with pricing
- **Inquiry Follow-ups** - Customer inquiry responses
- **Order Confirmations** - Food order confirmations
- **Payment Receipts** - Transaction confirmations
- **Custom Campaigns** - Marketing emails

## Security Features

1. **OAuth2 Authentication** - Secure token-based authentication
2. **Token Refresh** - Automatic access token renewal
3. **Environment Variables** - Sensitive data stored securely
4. **Admin Authorization** - Only admin users can manage email settings
5. **Input Validation** - Zod schema validation for all inputs

## Monitoring & Logging

The system provides comprehensive logging:

```typescript
// Email sent successfully
logger.info('Azure email sent successfully', { 
  to: 'customer@example.com',
  messageId: 'abc123'
});

// Authentication errors
logger.error('Failed to get Azure access token', error);

// Provider fallback
logger.warn('Azure email failed, falling back to SMTP');
```

## Troubleshooting

### Common Issues

1. **"Azure not configured"**
   - Check environment variables are set
   - Verify Azure app registration is correct
   - Ensure API permissions are granted

2. **"Access token failed"**
   - Verify client secret is correct
   - Check tenant ID matches your organization
   - Ensure app has proper permissions

3. **"Email not sending"**
   - Test with different providers (azure/smtp/auto)
   - Check email address format
   - Verify domain is verified in Azure

### Debug Mode

Enable debug logging by setting:
```bash
LOG_LEVEL=debug
```

### Test Endpoints

Use the test endpoints to verify configuration:

```bash
# Test Azure email
curl -X POST http://localhost:5001/api/azure-email/test \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"toEmail": "test@example.com", "provider": "azure"}'

# Get status
curl -X GET http://localhost:5001/api/azure-email/status \
  -H "Authorization: Bearer <token>"
```

## Best Practices

1. **Use Auto Mode** - Let the system choose the best provider
2. **Monitor Logs** - Watch for authentication failures
3. **Test Regularly** - Use the test email functionality
4. **Backup SMTP** - Always have SMTP as fallback
5. **Secure Secrets** - Use environment variables for sensitive data
6. **Rate Limiting** - Be mindful of Azure API limits

## Migration from SMTP

If you're migrating from SMTP to Azure:

1. Set up Azure configuration
2. Test Azure email functionality
3. Set provider to "auto" for gradual migration
4. Monitor logs for any issues
5. Once stable, set provider to "azure"

## Support

For issues with the Azure email integration:

1. Check the logs in `/backend/logs/`
2. Test with the admin panel at `/admin/azure-email`
3. Verify Azure app registration settings
4. Test with different email providers

The system is designed to be robust with automatic fallbacks, so even if Azure has issues, SMTP will continue to work.

