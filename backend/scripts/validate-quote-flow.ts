#!/usr/bin/env ts-node

/**
 * Validation script for the complete Send Quote flow
 * 
 * This script validates all components of the quote sending system:
 * - Environment configuration
 * - Database connectivity
 * - Email service configuration
 * - Stripe configuration
 * - PDF generation
 * - Template system
 */

import { config } from 'dotenv';
import path from 'path';
import { prisma } from '../src/server';
import { stripe } from '../src/lib/stripe';
import { PDFService } from '../src/services/pdf.service';
import { getEmailTemplate } from '../src/utils/email';

// Load environment variables
config({ path: path.join(__dirname, '../.env') });

interface ValidationResult {
  component: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

class QuoteFlowValidator {
  private results: ValidationResult[] = [];

  private addResult(component: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: any) {
    this.results.push({ component, status, message, details });
  }

  /**
   * Validate environment variables
   */
  async validateEnvironment(): Promise<void> {
    console.log('🔧 Validating Environment Configuration...');
    
    const requiredVars = [
      'STRIPE_SECRET_KEY',
      'STRIPE_PUBLISHABLE_KEY',
      'APP_BASE_URL',
      'EMAIL_FROM_NAME',
      'EMAIL_FROM_ADDRESS'
    ];

    const optionalVars = [
      'SENDGRID_API_KEY',
      'SMTP_HOST',
      'SMTP_USER',
      'SMTP_PASS'
    ];

    let hasEmailService = false;

    // Check required variables
    for (const varName of requiredVars) {
      const value = process.env[varName];
      if (!value || value.includes('your-') || value.includes('change-this')) {
        this.addResult('Environment', 'FAIL', `Missing or invalid ${varName}`, { value });
      } else {
        this.addResult('Environment', 'PASS', `${varName} is configured`);
      }
    }

    // Check email service configuration
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
      this.addResult('Email Service', 'PASS', 'SendGrid is configured');
      hasEmailService = true;
    }

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.addResult('Email Service', 'PASS', 'SMTP is configured');
      hasEmailService = true;
    }

    if (!hasEmailService) {
      this.addResult('Email Service', 'FAIL', 'No email service configured (SendGrid or SMTP required)');
    }

    // Check optional variables
    for (const varName of optionalVars) {
      const value = process.env[varName];
      if (value && !value.includes('your-')) {
        this.addResult('Environment', 'PASS', `${varName} is configured`);
      } else {
        this.addResult('Environment', 'WARN', `${varName} not configured (optional)`);
      }
    }
  }

  /**
   * Validate database connectivity
   */
  async validateDatabase(): Promise<void> {
    console.log('🗄️ Validating Database Connectivity...');
    
    try {
      await prisma.$connect();
      this.addResult('Database', 'PASS', 'Database connection successful');
      
      // Test a simple query
      const quoteCount = await prisma.quote.count();
      this.addResult('Database', 'PASS', `Database accessible, ${quoteCount} quotes found`);
      
    } catch (error) {
      this.addResult('Database', 'FAIL', 'Database connection failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Validate Stripe configuration
   */
  async validateStripe(): Promise<void> {
    console.log('💳 Validating Stripe Configuration...');
    
    try {
      // Test Stripe API access
      const balance = await stripe.balance.retrieve();
      this.addResult('Stripe', 'PASS', 'Stripe API accessible', { 
        currency: balance.available[0]?.currency || 'usd' 
      });
      
    } catch (error) {
      this.addResult('Stripe', 'FAIL', 'Stripe API access failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Validate PDF service
   */
  async validatePDFService(): Promise<void> {
    console.log('📄 Validating PDF Service...');
    
    try {
      const pdfService = PDFService.getInstance();
      this.addResult('PDF Service', 'PASS', 'PDF service initialized successfully');
      
      // Test PDF generation with mock data
      const mockQuote = {
        id: 'test-quote-id',
        quoteNumber: 'TEST-001',
        amount: 100,
        createdAt: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'DRAFT',
        inquiry: {
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '555-1234',
          serviceType: 'CATERING',
          eventDate: new Date(),
          eventTime: '7:00 PM',
          eventLocation: 'Test Venue',
          guestCount: 50
        },
        quoteItems: [
          {
            description: 'Test Item',
            quantity: 1,
            unitPrice: 100,
            total: 100
          }
        ]
      };

      const { buffer } = await pdfService.generateQuotePDF(mockQuote as any);
      this.addResult('PDF Service', 'PASS', 'PDF generation successful', { 
        size: buffer.length 
      });
      
    } catch (error) {
      this.addResult('PDF Service', 'FAIL', 'PDF generation failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Validate email template system
   */
  async validateEmailTemplates(): Promise<void> {
    console.log('📧 Validating Email Templates...');
    
    try {
      // Test quote template
      const quoteTemplate = getEmailTemplate('quote', {
        customerName: 'Test Customer',
        quoteNumber: 'TEST-001',
        serviceType: 'CATERING',
        total: '100.00',
        deposit: '20.00',
        payUrl: 'https://checkout.stripe.com/pay/test'
      });

      if (quoteTemplate && quoteTemplate.html && quoteTemplate.text) {
        this.addResult('Email Templates', 'PASS', 'Quote template loaded successfully');
      } else {
        this.addResult('Email Templates', 'FAIL', 'Quote template missing or invalid');
      }

      // Test template routing (should not fallback to welcome)
      try {
        getEmailTemplate('nonexistent', {});
        this.addResult('Email Templates', 'FAIL', 'Template system allows fallback to welcome');
      } catch (error) {
        this.addResult('Email Templates', 'PASS', 'Template system properly rejects invalid templates');
      }
      
    } catch (error) {
      this.addResult('Email Templates', 'FAIL', 'Email template validation failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Validate quote service
   */
  async validateQuoteService(): Promise<void> {
    console.log('📋 Validating Quote Service...');
    
    try {
      const { QuoteService } = await import('../src/services/quote.service');
      
      // Test service methods exist
      if (typeof QuoteService.sendQuoteEmail === 'function') {
        this.addResult('Quote Service', 'PASS', 'sendQuoteEmail method available');
      } else {
        this.addResult('Quote Service', 'FAIL', 'sendQuoteEmail method missing');
      }

      if (typeof QuoteService.attachPaymentSession === 'function') {
        this.addResult('Quote Service', 'PASS', 'attachPaymentSession method available');
      } else {
        this.addResult('Quote Service', 'FAIL', 'attachPaymentSession method missing');
      }
      
    } catch (error) {
      this.addResult('Quote Service', 'FAIL', 'Quote service validation failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Run all validations
   */
  async runAllValidations(): Promise<void> {
    console.log('🚀 Starting Quote Flow Validation');
    console.log('=====================================');
    console.log('');

    await this.validateEnvironment();
    await this.validateDatabase();
    await this.validateStripe();
    await this.validatePDFService();
    await this.validateEmailTemplates();
    await this.validateQuoteService();

    console.log('');
    console.log('📊 Validation Results');
    console.log('=====================================');

    const passCount = this.results.filter(r => r.status === 'PASS').length;
    const failCount = this.results.filter(r => r.status === 'FAIL').length;
    const warnCount = this.results.filter(r => r.status === 'WARN').length;

    for (const result of this.results) {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${icon} ${result.component}: ${result.message}`);
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details)}`);
      }
    }

    console.log('');
    console.log(`📈 Summary: ${passCount} passed, ${failCount} failed, ${warnCount} warnings`);

    if (failCount > 0) {
      console.log('');
      console.log('❌ Validation failed. Please fix the issues above before using the quote system.');
      process.exit(1);
    } else {
      console.log('');
      console.log('🎉 All validations passed! The quote system is ready to use.');
    }
  }
}

// Run validation
async function main() {
  const validator = new QuoteFlowValidator();
  await validator.runAllValidations();
}

main().catch((error) => {
  console.error('💥 Validation script failed:', error);
  process.exit(1);
});


