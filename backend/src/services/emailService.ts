import nodemailer, { Transporter } from 'nodemailer';
import { logger } from '../utils/logger';
import { graphEmailService } from './graphEmailService';

export type EmailAccount = 'quotes' | 'support' | 'general' | 'default';

interface EmailAccountConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  fromEmail: string;
  fromName: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export class MultiAccountEmailService {
  private static instance: MultiAccountEmailService;
  private transporters: Map<EmailAccount, Transporter> = new Map();
  private accountConfigs: Map<EmailAccount, EmailAccountConfig> = new Map();

  private constructor() {
    this.initializeAccounts();
  }

  public static getInstance(): MultiAccountEmailService {
    if (!MultiAccountEmailService.instance) {
      MultiAccountEmailService.instance = new MultiAccountEmailService();
    }
    return MultiAccountEmailService.instance;
  }

  private initializeAccounts(): void {
    // Initialize all email accounts from environment variables
    const accounts: { [key in EmailAccount]: Partial<EmailAccountConfig> } = {
      quotes: {
        host: process.env.QUOTES_SMTP_HOST,
        port: parseInt(process.env.QUOTES_SMTP_PORT || '587'),
        auth: {
          user: process.env.QUOTES_SMTP_USER || '',
          pass: process.env.QUOTES_SMTP_PASS || '',
        },
        fromEmail: process.env.QUOTES_SMTP_USER || '',
        fromName: process.env.QUOTES_EMAIL_NAME || "Kocky's Quotes Team",
      },
      support: {
        host: process.env.SUPPORT_SMTP_HOST,
        port: parseInt(process.env.SUPPORT_SMTP_PORT || '587'),
        auth: {
          user: process.env.SUPPORT_SMTP_USER || '',
          pass: process.env.SUPPORT_SMTP_PASS || '',
        },
        fromEmail: process.env.SUPPORT_SMTP_USER || '',
        fromName: process.env.SUPPORT_EMAIL_NAME || "Kocky's Support",
      },
      general: {
        host: process.env.GENERAL_SMTP_HOST,
        port: parseInt(process.env.GENERAL_SMTP_PORT || '587'),
        auth: {
          user: process.env.GENERAL_SMTP_USER || '',
          pass: process.env.GENERAL_SMTP_PASS || '',
        },
        fromEmail: process.env.GENERAL_SMTP_USER || '',
        fromName: process.env.GENERAL_EMAIL_NAME || "Kocky's Bar & Grill",
      },
      default: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
        fromEmail: process.env.SMTP_USER || '',
        fromName: process.env.SENDGRID_FROM_NAME || "Kocky's Bar & Grill",
      },
    };

    // Create transporters for each configured account
    Object.entries(accounts).forEach(([accountKey, config]) => {
      const account = accountKey as EmailAccount;
      
      if (config.host && config.auth?.user && config.auth?.pass) {
        const fullConfig: EmailAccountConfig = {
          host: config.host,
          port: config.port || 587,
          secure: config.port === 465,
          auth: config.auth,
          fromEmail: config.fromEmail || config.auth.user,
          fromName: config.fromName || "Kocky's Bar & Grill",
        };

        this.accountConfigs.set(account, fullConfig);

        const transporter = nodemailer.createTransport({
          host: fullConfig.host,
          port: fullConfig.port,
          secure: fullConfig.secure,
          auth: fullConfig.auth,
          tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false,
          },
          requireTLS: true,
        });

        this.transporters.set(account, transporter);
        logger.info(`Email account '${account}' configured successfully`);

        // Verify connection in development
        if (process.env.NODE_ENV === 'development') {
          transporter.verify((error: any, success: any) => {
            if (error) {
              logger.error(`Email account '${account}' verification failed:`, error);
            } else {
              logger.info(`Email account '${account}' verified successfully`);
            }
          });
        }
      } else {
        logger.warn(`Email account '${account}' not configured - missing required environment variables`);
      }
    });

    // Log available accounts
    const configuredAccounts = Array.from(this.transporters.keys());
    logger.info(`Configured email accounts: ${configuredAccounts.join(', ')}`);
  }

  /**
   * Send email using specified account
   */
  public async sendEmail(accountKey: EmailAccount, options: EmailOptions): Promise<boolean> {
    const emailId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info(`📧 EMAIL SEND ATTEMPT [${emailId}]`, {
      accountKey,
      to: options.to,
      subject: options.subject,
      hasAttachments: !!(options.attachments && options.attachments.length > 0),
      attachmentCount: options.attachments?.length || 0,
      hasHtml: !!options.html,
      hasText: !!options.text,
      ccCount: options.cc?.length || 0,
      bccCount: options.bcc?.length || 0
    });

    try {
      const transporter = this.transporters.get(accountKey);
      const config = this.accountConfigs.get(accountKey);

      if (!transporter || !config) {
        // Fallback to default account if specified account not available
        const defaultTransporter = this.transporters.get('default');
        const defaultConfig = this.accountConfigs.get('default');
        
        if (!defaultTransporter || !defaultConfig) {
          logger.error(`❌ EMAIL FAILED [${emailId}] - No email transporter available for account '${accountKey}' and no default fallback`);
          return false;
        }

        logger.warn(`⚠️ EMAIL FALLBACK [${emailId}] - Email account '${accountKey}' not available, using default account`);
        return this.sendEmailWithTransporter(defaultTransporter, defaultConfig, options, emailId);
      }

      return this.sendEmailWithTransporter(transporter, config, options, emailId);
    } catch (error) {
      logger.error(`❌ EMAIL FAILED [${emailId}] - Failed to send email using account '${accountKey}':`, error);
      return false;
    }
  }

  private async sendEmailWithTransporter(
    transporter: Transporter,
    config: EmailAccountConfig,
    options: EmailOptions,
    emailId: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
        attachments: options.attachments,
      };

      logger.info(`📤 SENDING EMAIL [${emailId}]`, {
        from: config.fromEmail,
        to: options.to,
        subject: options.subject,
        provider: config.host,
        hasAttachments: !!(options.attachments && options.attachments.length > 0)
      });

      await transporter.sendMail(mailOptions);
      
      logger.info(`✅ EMAIL SENT SUCCESSFULLY [${emailId}]`, {
        to: options.to,
        from: config.fromEmail,
        provider: config.host,
        subject: options.subject,
        attachmentCount: options.attachments?.length || 0
      });
      
      return true;
    } catch (error) {
      logger.error(`❌ EMAIL SEND FAILED [${emailId}]`, {
        to: options.to,
        from: config.fromEmail,
        provider: config.host,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return false;
    }
  }

  /**
   * Get available email accounts
   */
  public getAvailableAccounts(): Array<{ key: EmailAccount; name: string; email: string }> {
    const accounts: Array<{ key: EmailAccount; name: string; email: string }> = [];
    
    this.accountConfigs.forEach((config, key) => {
      accounts.push({
        key,
        name: config.fromName,
        email: config.fromEmail,
      });
    });

    return accounts;
  }

  /**
   * Get default email account key from environment
   */
  public getDefaultAccount(): EmailAccount {
    const defaultAccount = process.env.DEFAULT_EMAIL_ACCOUNT as EmailAccount;
    if (defaultAccount && this.transporters.has(defaultAccount)) {
      return defaultAccount;
    }
    
    // Fallback order: general -> support -> quotes -> default
    const fallbackOrder: EmailAccount[] = ['general', 'support', 'quotes', 'default'];
    for (const account of fallbackOrder) {
      if (this.transporters.has(account)) {
        return account;
      }
    }
    
    return 'default';
  }

  /**
   * Test email configuration for an account
   */
  public async testEmailAccount(accountKey: EmailAccount): Promise<{ success: boolean; message: string }> {
    try {
      const transporter = this.transporters.get(accountKey);
      const config = this.accountConfigs.get(accountKey);

      if (!transporter || !config) {
        return {
          success: false,
          message: `Email account '${accountKey}' is not configured`,
        };
      }

      await transporter.verify();
      return {
        success: true,
        message: `Email account '${accountKey}' is working correctly`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Email account '${accountKey}' test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Send test email
   */
  public async sendTestEmail(accountKey: EmailAccount, toEmail: string): Promise<boolean> {
    const config = this.accountConfigs.get(accountKey);
    if (!config) {
      logger.error(`Cannot send test email - account '${accountKey}' not configured`);
      return false;
    }

    const testEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #b22222; color: #fff; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Email Test Successful</h1>
          </div>
          <div class="content">
            <div class="success">
              <h2>Test Email from ${config.fromName}</h2>
              <p><strong>Account:</strong> ${accountKey}</p>
              <p><strong>From:</strong> ${config.fromEmail}</p>
              <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>This is a test email to verify that your email configuration is working correctly.</p>
            <p>If you received this email, your email service is properly configured and ready to use!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(accountKey, {
      to: toEmail,
      subject: `🧪 Test Email from ${config.fromName}`,
      html: testEmailHtml,
    });
  }

  /**
   * Strip HTML tags for plain text version
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Render Email Template Studio template with data
   */
  private renderEmailTemplate(templateData: any, data: any): string {
    const { brand, sections, theme } = templateData;
    const banner = brand.banner || "";
    const logo = brand.logo || "";
    const accent = theme.accent || "#111827";
    const text = theme.text || "#111827";
    const bg = theme.bg || "#ffffff";

    const safe = (s: string) => (s || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const replacePlaceholders = (text: string) => {
      return text
        .replace(/\{\{customerName\}\}/g, data.name || 'Valued Customer')
        .replace(/\{\{serviceName\}\}/g, data.serviceType || 'Service')
        .replace(/\{\{eventDate\}\}/g, data.eventDate || 'TBD')
        .replace(/\{\{confirmationCode\}\}/g, data.confirmationCode || '')
        .replace(/\{\{message\}\}/g, data.message || '');
    };

    const sectionsHtml = sections
      .map((s: any) => {
        if (s.type === "heading") {
          return `<tr><td style="padding:16px 24px 0"><h1 style="margin:0;font-size:24px;color:${accent}">${safe(replacePlaceholders(s.text))}</h1></td></tr>`;
        }
        if (s.type === "text") {
          return `<tr><td style="padding:8px 24px 0;line-height:1.6">${safe(replacePlaceholders(s.text)).replace(/\n/g, "<br/>")}</td></tr>`;
        }
        if (s.type === "cta") {
          const color = s.color || accent;
          return `<tr><td style="padding:16px 24px"><a class="btn" href="${safe(s.href)}" style="background:${color};color:#fff" target="_blank">${safe(s.label)}</a></td></tr>`;
        }
        if (s.type === "divider") {
          return `<tr><td style="padding:16px 24px"><hr style="border:none;height:1px;background:#e5e7eb"/></td></tr>`;
        }
        if (s.type === "two-col") {
          return `<tr><td style="padding:12px 24px"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="width:50%;vertical-align:top;padding-right:8px">${safe(replacePlaceholders(s.left))}</td><td style="width:50%;vertical-align:top;padding-left:8px">${safe(replacePlaceholders(s.right))}</td></tr></table></td></tr>`;
        }
        return "";
      })
      .join("");

    return `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>${safe(brand.subject || "Kocky's Email")}</title>
        <style>
          .btn{display:inline-block;padding:12px 16px;border-radius:10px;text-decoration:none}
        </style>
      </head>
      <body style="margin:0;background:${bg};color:${text};font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg}">
          <tr>
            <td align="center">
              <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%">
                ${banner ? `<tr><td><img src="${banner}" alt="Banner" style="display:block;width:100%;height:auto;border:0"/></td></tr>` : ""}
                <tr>
                  <td style="padding:24px 24px 8px">
                    <div style="display:flex;align-items:center;gap:12px">
                      ${logo ? `<img src="${logo}" alt="Logo" width="48" height="48" style="border-radius:12px"/>` : ""}
                      <div>
                        <div style="font-weight:700;font-size:18px">${safe(brand.senderName || "Kocky's Bar & Grill")}</div>
                        <div style="font-size:12px;color:#6b7280">${safe(brand.senderEmail || "info@kockys.com")}</div>
                      </div>
                    </div>
                  </td>
                </tr>
                ${sectionsHtml}
                <tr>
                  <td style="padding:24px;color:#6b7280;font-size:12px">
                    <div>${safe(brand.footer || "123 Main St, Fresno CA · (555) 555‑5555")}</div>
                    <div><a href="#" style="color:#6b7280">Unsubscribe</a></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>`;
  }

  /**
   * Get template data from database or fallback to presets
   */
  private async getTemplateData(templateId: string): Promise<any> {
    // Preset templates (fallback)
    const presets = {
      inquiry: {
        brand: {
          subject: "Thanks for your inquiry — we got it!",
          senderName: "Kocky's Bar & Grill",
          senderEmail: "info@kockys.com",
          footer: "Kocky's Bar & Grill · 123 Main St, Fresno CA",
          logo: "",
          banner: "",
        },
        theme: { accent: "#4f46e5", text: "#111827", bg: "#ffffff" },
        sections: [
          { type: "heading", text: "We received your inquiry, {{customerName}}!" },
          { type: "text", text: "Thanks for reaching out about {{serviceName}}. Our team will reply within 1 business day." },
          { type: "cta", label: "View Menu", href: "https://kockys.com/menu", color: "#4f46e5" },
          { type: "divider" },
          { type: "text", text: "Questions? Reply to this email or call (555) 555‑5555." },
        ],
      },
      quote: {
        brand: {
          subject: "Your quote from Kocky's (##{{quoteNumber}})",
          senderName: "Kocky's Sales",
          senderEmail: "info@kockys.com",
          footer: "Kocky's · Quotes",
          logo: "",
          banner: "",
        },
        theme: { accent: "#16a34a", text: "#0f172a", bg: "#ffffff" },
        sections: [
          { type: "heading", text: "Your quote is ready" },
          { type: "two-col", left: "Service: {{serviceName}}\nEvent Date: {{eventDate}}", right: "Total: {{total}}\nValid until: {{validUntil}}" },
          { type: "cta", label: "Approve & Pay Deposit", href: "https://staging.kockys.com/quotes/{{quoteId}}" },
          { type: "divider" },
          { type: "text", text: "If anything looks off, reply and we'll tweak it right away." },
        ],
      },
      mobileBar: {
        brand: {
          subject: "Mobile Bar booking received",
          senderName: "Kocky's Events",
          senderEmail: "info@kockys.com",
          footer: "Kocky's · Events",
          logo: "",
          banner: "",
        },
        theme: { accent: "#ea580c", text: "#1f2937", bg: "#ffffff" },
        sections: [
          { type: "heading", text: "Cheers, {{customerName}}!" },
          { type: "text", text: "Your Mobile Bar request is in. We'll confirm availability and send next steps." },
          { type: "cta", label: "See Packages", href: "https://staging.kockys.com/mobile-bar" },
        ],
      },
    };

    // TODO: In the future, fetch from database
    // For now, return preset data
    return presets[templateId as keyof typeof presets] || presets.inquiry;
  }

  /**
   * Send automatic inquiry confirmation using Email Template Studio
   */
  public async sendInquiryConfirmation(data: {
    name: string;
    email: string;
    serviceType: string;
    eventDate?: string;
    confirmationCode: string;
    message: string;
  }, accountKey?: EmailAccount): Promise<boolean> {
    try {
      // Get template data from Email Template Studio
      const templateData = await this.getTemplateData('inquiry');
      
      // Render the template with data
      const html = this.renderEmailTemplate(templateData, data);
      
      // Get subject from template or use default
      const subject = templateData.brand.subject || "Thanks for your inquiry — we got it!";
      
      logger.info(`Sending inquiry confirmation to ${data.email} using Microsoft Graph API`);
      
      // Use Microsoft Graph API for transactional emails
      return await graphEmailService.sendEmail({
        to: data.email,
        subject: subject,
        html,
      });
    } catch (error) {
      logger.error('Error sending inquiry confirmation with Graph API:', error);
      
      // Fallback to original template if Azure service fails
      return this.sendInquiryConfirmationFallback(data, accountKey);
    }
  }

  /**
   * Fallback inquiry confirmation (original template)
   */
  private async sendInquiryConfirmationFallback(data: {
    name: string;
    email: string;
    serviceType: string;
    eventDate?: string;
    confirmationCode: string;
    message: string;
  }, accountKey?: EmailAccount): Promise<boolean> {
    const account = accountKey || this.getDefaultAccount();
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #b22222; color: #fff; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .confirmation-box { background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; }
          .details-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🙏 Thank You for Your Inquiry!</h1>
          </div>
          <div class="content">
            <p>Dear ${data.name},</p>
            
            <div class="confirmation-box">
              <h2>✅ We've Received Your Inquiry</h2>
              <p>Thank you for reaching out to Kocky's Bar & Grill about our <strong>${data.serviceType}</strong> services.</p>
            </div>

            <div class="details-box">
              <h3>Your Inquiry Details</h3>
              <p><strong>Service Type:</strong> ${data.serviceType}</p>
              ${data.eventDate ? `<p><strong>Event Date:</strong> ${data.eventDate}</p>` : ''}
              <p><strong>Confirmation Code:</strong> <span style="color: #b22222; font-weight: bold;">${data.confirmationCode}</span></p>
              <p><strong>Your Message:</strong></p>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; font-style: italic;">
                ${data.message}
              </div>
            </div>

            <h3>🕒 What Happens Next?</h3>
            <ol style="padding-left: 20px;">
              <li>Our team will review your inquiry within 24 hours</li>
              <li>We'll prepare a custom quote based on your requirements</li>
              <li>You'll receive a detailed quote via email</li>
              <li>We'll follow up to answer any questions you may have</li>
            </ol>

            <p><strong>Need immediate assistance?</strong><br>
            Don't hesitate to call us at <strong>(555) 123-4567</strong> and reference your confirmation code: <strong>${data.confirmationCode}</strong></p>

            <p>We look forward to serving you at your upcoming event!</p>
            
            <p>Best regards,<br>
            <strong>The Kocky's Team</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2024 Kocky's Bar & Grill | 123 Main Street, City, State 12345</p>
            <p>Phone: (555) 123-4567 | Email: info@kockysbar.com | www.kockysbar.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(account, {
      to: data.email,
      subject: `✅ Thank you for your inquiry - Kocky's Bar & Grill`,
      html,
    });
  }

  /**
   * Send quote email
   */
  public async sendQuote(data: {
    customerName: string;
    customerEmail: string;
    quoteNumber: string;
    serviceType: string;
    eventDate?: string;
    totalAmount: number;
    depositAmount?: number;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }>;
    validUntil: string;
    paymentLink?: string;
    terms?: string;
    notes?: string;
  }, accountKey?: EmailAccount): Promise<boolean> {
    const account = accountKey || 'quotes'; // Default to quotes account for quote emails
    
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${item.description}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: right;">$${item.subtotal.toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: #b22222; color: #fff; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .quote-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #f8f9fa; padding: 12px; text-align: left; border: 1px solid #dee2e6; }
          .items-table td { padding: 10px; border: 1px solid #dee2e6; }
          .total-row { background: #fff3cd; font-weight: bold; font-size: 16px; }
          .payment-button { display: inline-block; padding: 15px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 15px 5px; font-weight: bold; }
          .deposit-button { background: #ffc107; color: #212529; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Your Custom Quote</h1>
            <p>Quote #${data.quoteNumber}</p>
          </div>
          
          <div class="content">
            <p>Dear ${data.customerName},</p>
            <p>Thank you for choosing Kocky's Bar & Grill for your <strong>${data.serviceType}</strong> needs!</p>
            
            <div class="quote-box">
              <h2 style="color: #b22222; border-bottom: 2px solid #b22222; padding-bottom: 10px;">Quote Details</h2>
              <p><strong>Service:</strong> ${data.serviceType}</p>
              ${data.eventDate ? `<p><strong>Event Date:</strong> ${data.eventDate}</p>` : ''}
              <p><strong>Valid Until:</strong> ${data.validUntil}</p>
              
              ${data.items.length > 0 ? `
                <h3>Quote Breakdown</h3>
                <table class="items-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th style="text-align: center;">Qty</th>
                      <th style="text-align: right;">Unit Price</th>
                      <th style="text-align: right;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                  <tfoot>
                    <tr class="total-row">
                      <td colspan="3" style="text-align: right; padding: 15px;">Total Amount:</td>
                      <td style="text-align: right; padding: 15px; color: #b22222; font-size: 18px;">$${data.totalAmount.toFixed(2)}</td>
                    </tr>
                    ${data.depositAmount ? `
                    <tr>
                      <td colspan="3" style="text-align: right; padding: 8px;">Deposit Required:</td>
                      <td style="text-align: right; padding: 8px;">$${data.depositAmount.toFixed(2)}</td>
                    </tr>
                    ` : ''}
                  </tfoot>
                </table>
              ` : `
                <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 15px 0;">
                  <h3 style="color: #b22222; margin: 0 0 10px 0;">Total Amount: $${data.totalAmount.toFixed(2)}</h3>
                  ${data.depositAmount ? `<p style="margin: 0;">Deposit Required: $${data.depositAmount.toFixed(2)}</p>` : ''}
                </div>
              `}
              
              ${data.terms ? `
                <div style="margin-top: 25px;">
                  <h3>Terms & Conditions</h3>
                  <p style="font-size: 14px; color: #666; background: #f8f9fa; padding: 15px; border-radius: 5px;">${data.terms}</p>
                </div>
              ` : ''}
              
              ${data.notes ? `
                <div style="margin-top: 20px;">
                  <h3>Additional Notes</h3>
                  <p style="background: #fff3cd; padding: 15px; border-radius: 5px;">${data.notes}</p>
                </div>
              ` : ''}
            </div>
            
            ${data.paymentLink ? `
              <div style="text-align: center; margin: 30px 0;">
                <h3>💳 Secure Online Payment</h3>
                ${data.depositAmount ? `
                  <a href="${data.paymentLink}?amount=${data.depositAmount * 100}" class="payment-button deposit-button">
                    Pay Deposit ($${data.depositAmount.toFixed(2)})
                  </a>
                  <a href="${data.paymentLink}?amount=${data.totalAmount * 100}" class="payment-button">
                    Pay Full Amount ($${data.totalAmount.toFixed(2)})
                  </a>
                ` : `
                  <a href="${data.paymentLink}?amount=${data.totalAmount * 100}" class="payment-button">
                    Pay Now ($${data.totalAmount.toFixed(2)})
                  </a>
                `}
              </div>
            ` : ''}
            
            <div style="background: #e7f3ff; border-left: 4px solid #007bff; padding: 20px; margin: 25px 0;">
              <h3>📞 Next Steps</h3>
              <p>To proceed with this quote:</p>
              <ul>
                <li>Reply to this email with any questions</li>
                <li>Call us at <strong>(555) 123-4567</strong></li>
                ${data.paymentLink ? '<li>Use the secure payment links above</li>' : ''}
                <li>Visit us in person at our location</li>
              </ul>
            </div>
            
            <p>We look forward to making your event memorable!</p>
            <p>Best regards,<br><strong>The Kocky's Quotes Team</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2024 Kocky's Bar & Grill | 123 Main Street, City, State 12345</p>
            <p>Phone: (555) 123-4567 | Email: quotes@kockysbar.com | www.kockysbar.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(account, {
      to: data.customerEmail,
      subject: `📋 Quote #${data.quoteNumber} from Kocky's Bar & Grill`,
      html,
    });
  }
}

// Export singleton instance
export const emailService = MultiAccountEmailService.getInstance();