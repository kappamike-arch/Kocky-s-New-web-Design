# Email Configuration for Kocky's Bar & Grill

## Office 365 SMTP Configuration via GoDaddy

To enable automatic email sending for form submissions, you need to configure the SMTP settings in the `.env` file.

### Required Environment Variables

Add these to your `.env` file in the backend directory:

```env
# Email Configuration - Office 365 via GoDaddy
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@kockys.com
SMTP_PASS=YOUR_PASSWORD_HERE

# Email Settings
SENDGRID_FROM_NAME=Kocky's Bar & Grill
SENDGRID_FROM_EMAIL=info@kockys.com
```

### Important Notes

1. **Password**: Replace `YOUR_PASSWORD_HERE` with the actual password for info@kockys.com
2. **Authentication**: Ensure the account has SMTP authentication enabled
3. **Security**: The connection uses TLS (port 587) for secure email transmission
4. **Testing**: In development mode, the email service will verify the connection on startup

### Email Templates

The system includes professional email templates for:
- Food Truck booking confirmations
- Mobile Bar service booking confirmations
- Catering inquiry confirmations
- General contact form submissions

Each email includes:
- Professional branding with Kocky's colors
- Confirmation code for tracking
- Event details summary
- Contact information for follow-up

### Troubleshooting

If emails are not sending:
1. Check the password is correct
2. Ensure SMTP authentication is enabled in Office 365/GoDaddy
3. Check firewall settings allow outbound connections to port 587
4. Look at the backend logs for detailed error messages
5. Verify the email account isn't locked or requiring 2FA

### Testing

To test the email configuration:
1. Start the backend server: `npm run dev`
2. Submit a form from the frontend
3. Check the logs for successful email sending
4. Verify the email arrives in the customer's inbox

