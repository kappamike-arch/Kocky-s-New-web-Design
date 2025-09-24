import PDFDocument from 'pdfkit';
import { Quote, ContactInquiry, QuoteItem, Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { logger } from '../utils/logger';

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const existsAsync = promisify(fs.exists);

interface QuoteWithDetails extends Quote {
  inquiry: ContactInquiry;
  quoteItems: QuoteItem[];
}

export class PDFService {
  private static instance: PDFService;
  private uploadsDir: string;

  private constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads', 'quotes');
    this.ensureUploadsDirectory();
  }

  public static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  private async ensureUploadsDirectory() {
    try {
      const exists = await existsAsync(this.uploadsDir);
      if (!exists) {
        await mkdirAsync(this.uploadsDir, { recursive: true });
      }
    } catch (error) {
      // Directory might already exist
      if (!fs.existsSync(this.uploadsDir)) {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
      }
    }
  }

  public async generateQuotePDF(quote: QuoteWithDetails): Promise<{ buffer: Buffer; filename: string }> {
    const pdfId = `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info(`📄 PDF GENERATION STARTED [${pdfId}]`, {
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      customerName: quote.inquiry?.name,
      customerEmail: quote.inquiry?.email,
      itemCount: quote.quoteItems?.length || 0,
      totalAmount: quote.amount
    });

    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        // Store PDF chunks
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const filename = `quote-${quote.quoteNumber}.pdf`;
          
          logger.info(`✅ PDF GENERATED SUCCESSFULLY [${pdfId}]`, {
            quoteId: quote.id,
            quoteNumber: quote.quoteNumber,
            filename,
            bufferSize: buffer.length,
            bufferSizeKB: Math.round(buffer.length / 1024)
          });
          
          resolve({ buffer, filename });
        });

        doc.on('error', (error) => {
          logger.error(`❌ PDF GENERATION ERROR [${pdfId}]`, {
            quoteId: quote.id,
            error: error.message,
            stack: error.stack
          });
          reject(error);
        });

        // Add header with logo and company info
        await this.addHeader(doc);

        // Add quote title and number
        doc.moveDown(2);
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fillColor('#FF6B35')
           .text('QUOTE', { align: 'center' });
        
        doc.fontSize(14)
           .fillColor('#333333')
           .text(`Quote #${quote.quoteNumber}`, { align: 'center' });

        // Add dates
        doc.moveDown();
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#666666');
        
        const createdDate = new Date(quote.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        const validUntil = quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : 'N/A';

        doc.text(`Date Created: ${createdDate}`, { align: 'center' });
        doc.text(`Valid Until: ${validUntil}`, { align: 'center' });

        // Add status badge
        doc.moveDown();
        this.addStatusBadge(doc, quote.status);

        // Draw separator line
        doc.moveDown();
        doc.moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .stroke('#E0E0E0');

        // Customer Information Section
        doc.moveDown();
        this.addSectionTitle(doc, 'Customer Information');
        
        const inquiry = quote.inquiry;
        doc.fontSize(11)
           .font('Helvetica')
           .fillColor('#333333');
        
        doc.text(`Name: ${inquiry.name || 'N/A'}`);
        doc.text(`Email: ${inquiry.email || 'N/A'}`);
        doc.text(`Phone: ${inquiry.phone || 'N/A'}`);
        if (inquiry.companyName) {
          doc.text(`Company: ${inquiry.companyName}`);
        }

        // Event Details Section
        doc.moveDown();
        this.addSectionTitle(doc, 'Event Details');
        
        doc.fontSize(11)
           .font('Helvetica');
        
        doc.text(`Service Type: ${this.formatServiceType(inquiry.serviceType)}`);
        
        if (inquiry.eventDate) {
          const eventDate = new Date(inquiry.eventDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          doc.text(`Event Date: ${eventDate}`);
        }
        
        if (inquiry.eventTime) {
          doc.text(`Event Time: ${inquiry.eventTime}`);
        }
        
        if (inquiry.eventLocation) {
          doc.text(`Location: ${inquiry.eventLocation}`);
        }
        
        if (inquiry.guestCount) {
          doc.text(`Number of Guests: ${inquiry.guestCount}`);
        }

        // Skip Service Details section to avoid raw JSON display
        // The event details are already shown above in the Event Details section

        // Line Items Section
        doc.moveDown();
        this.addSectionTitle(doc, 'Quote Details');
        
        // Create items table
        this.addItemsTable(doc, quote.quoteItems);

        // Financial Summary
        doc.moveDown();
        this.addFinancialSummary(doc, quote);

        // Terms and Conditions
        if (quote.terms) {
          doc.moveDown();
          this.addSectionTitle(doc, 'Terms and Conditions');
          
          doc.fontSize(10)
             .font('Helvetica')
             .fillColor('#666666')
             .text(quote.terms, {
               align: 'justify',
               lineGap: 2
             });
        }

        // Notes
        if (quote.notes) {
          doc.moveDown();
          this.addSectionTitle(doc, 'Additional Notes');
          
          doc.fontSize(10)
             .font('Helvetica')
             .fillColor('#666666')
             .text(quote.notes, {
               align: 'justify',
               lineGap: 2
             });
        }

        // Footer
        this.addFooter(doc);

        // Finalize PDF
        doc.end();

      } catch (error) {
        logger.error(`❌ PDF GENERATION FAILED [${pdfId}]`, {
          quoteId: quote.id,
          quoteNumber: quote.quoteNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        reject(error);
      }
    });
  }

  /**
   * Generate a simple fallback PDF when main generation fails
   */
  public async generateFallbackPDF(quote: QuoteWithDetails): Promise<{ buffer: Buffer; filename: string }> {
    const pdfId = `pdf_fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info(`📄 FALLBACK PDF GENERATION STARTED [${pdfId}]`, {
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber
    });

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const filename = `quote-${quote.quoteNumber}-fallback.pdf`;
          
          logger.info(`✅ FALLBACK PDF GENERATED [${pdfId}]`, {
            quoteId: quote.id,
            filename,
            bufferSize: buffer.length
          });
          
          resolve({ buffer, filename });
        });

        // Simple fallback content
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fillColor('#e63946')
           .text('Kocky\'s Bar & Grill', 50, 50);

        doc.fontSize(16)
           .font('Helvetica')
           .fillColor('#333')
           .text(`Quote: ${quote.quoteNumber}`, 50, 100);

        if (quote.inquiry) {
          doc.text(`Customer: ${quote.inquiry.name}`, 50, 130);
          doc.text(`Email: ${quote.inquiry.email}`, 50, 150);
        }

        doc.text(`Total: $${Number(quote.amount || 0).toFixed(2)}`, 50, 180);

        doc.text('This is a simplified quote document.', 50, 220);
        doc.text('For full details, please contact us at (559) 266-5500', 50, 240);

        doc.end();

      } catch (error) {
        logger.error(`❌ FALLBACK PDF FAILED [${pdfId}]`, {
          quoteId: quote.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        reject(error);
      }
    });
  }

  private async addHeader(doc: any) {
    const logoPath = this.getLogoPath();
    let logoAdded = false;

    // Try to add logo if path is configured
    if (logoPath) {
      const logoExists = await this.logoExists(logoPath);
      if (logoExists) {
        logoAdded = await this.addLogoToPDF(doc, logoPath, 50, 50);
      }
    }

    // Company name and contact info positioning
    const companyX = logoAdded ? 220 : 50; // Position next to logo or at left margin
    const contactX = 400; // Right-aligned contact info

    // Company name
    doc.fontSize(28)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text("KOCKY'S", companyX, 50);
    
    doc.fontSize(14)
       .font('Helvetica')
       .fillColor('#FF6B35')
       .text('BAR & GRILL', companyX, 80);

    // Contact info (right aligned)
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666666');
    
    const contactY = 50;
    doc.text('(559) 217-5719', contactX, contactY, { width: 145, align: 'right' });
    doc.text('info@kockysbar.com', contactX, contactY + 15, { width: 145, align: 'right' });
    doc.text('123 Main Street', contactX, contactY + 30, { width: 145, align: 'right' });
    doc.text('City, State 12345', contactX, contactY + 45, { width: 145, align: 'right' });

    // Log header creation
    logger.info('PDF header created', {
      logoAdded,
      logoPath: logoPath || 'none',
      companyX,
      contactX
    });
  }

  private addFooter(doc: any) {
    const pageHeight = doc.page.height;
    const y = pageHeight - 100;

    // Draw separator line
    doc.moveTo(50, y)
       .lineTo(545, y)
       .stroke('#E0E0E0');

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666666');

    doc.text('Thank you for choosing Kocky\'s Bar & Grill!', 50, y + 15, {
      align: 'center',
      width: 495
    });

    doc.fontSize(9)
       .text('This quote is valid for the period specified above. Prices subject to change after expiration.', 50, y + 35, {
      align: 'center',
      width: 495
    });

    // Page number
    doc.text(`Page 1 of 1`, 50, y + 55, {
      align: 'center',
      width: 495
    });
  }

  private addSectionTitle(doc: any, title: string) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#333333')
       .text(title);
    doc.moveDown(0.5);
  }

  private addStatusBadge(doc: any, status: string) {
    const statusColors: Record<string, string> = {
      'DRAFT': '#6B7280',
      'SENT': '#3B82F6',
      'ACCEPTED': '#10B981',
      'DECLINED': '#EF4444',
      'EXPIRED': '#F59E0B',
      'PAID': '#10B981'
    };

    const color = statusColors[status] || '#6B7280';
    const x = 250;
    const y = doc.y;
    const width = 100;
    const height = 25;

    // Draw badge background
    doc.roundedRect(x, y, width, height, 3)
       .fill(color);

    // Add status text
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#FFFFFF')
       .text(status, x, y + 7, {
         width: width,
         align: 'center'
       });

    // Reset color
    doc.fillColor('#333333');
  }

  private addItemsTable(doc: any, items: QuoteItem[]) {
    const tableTop = doc.y;
    const itemX = 50;
    const quantityX = 300;
    const priceX = 380;
    const totalX = 460;

    // Table headers
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#666666');

    doc.text('Description', itemX, tableTop);
    doc.text('Qty', quantityX, tableTop);
    doc.text('Unit Price', priceX, tableTop);
    doc.text('Total', totalX, tableTop);

    // Draw header underline
    doc.moveTo(itemX, tableTop + 20)
       .lineTo(545, tableTop + 20)
       .stroke('#E0E0E0');

    // Table rows
    let y = tableTop + 30;
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#333333');

    items.forEach((item) => {
      const unitPrice = parseFloat(item.unitPrice?.toString() || '0');
      const total = parseFloat(item.total?.toString() || '0');

      doc.text(item.description || '', itemX, y, { width: 240 });
      doc.text(item.quantity.toString(), quantityX, y);
      doc.text(`$${unitPrice.toFixed(2)}`, priceX, y);
      doc.text(`$${total.toFixed(2)}`, totalX, y);

      y += 25;

      // Check if we need a new page
      if (y > doc.page.height - 150) {
        doc.addPage();
        y = 50;
      }
    });

    doc.y = y;
  }

  private addFinancialSummary(doc: any, quote: Quote) {
    const summaryX = 350;
    let y = doc.y + 20;

    // Draw separator line
    doc.moveTo(summaryX - 20, y - 10)
       .lineTo(545, y - 10)
       .stroke('#E0E0E0');

    doc.fontSize(11)
       .font('Helvetica');

    // Calculate totals
    const amount = parseFloat(quote.amount?.toString() || '0');
    const depositAmount = parseFloat(quote.depositAmount?.toString() || '0');
    const taxRate = parseFloat(quote.taxRate?.toString() || '0');
    const gratuityRate = parseFloat(quote.gratuityRate?.toString() || '0');
    
    const subtotal = amount;
    const tax = subtotal * (taxRate / 100);
    const gratuity = subtotal * (gratuityRate / 100);
    const total = subtotal + tax + gratuity;

    // Subtotal
    doc.text('Subtotal:', summaryX, y);
    doc.text(`$${subtotal.toFixed(2)}`, 460, y);
    y += 20;

    // Tax
    if (taxRate > 0) {
      doc.text(`Tax (${taxRate}%):`, summaryX, y);
      doc.text(`$${tax.toFixed(2)}`, 460, y);
      y += 20;
    }

    // Gratuity
    if (gratuityRate > 0) {
      doc.text(`Gratuity (${gratuityRate}%):`, summaryX, y);
      doc.text(`$${gratuity.toFixed(2)}`, 460, y);
      y += 20;
    }

    // Draw total separator
    doc.moveTo(summaryX, y - 5)
       .lineTo(545, y - 5)
       .stroke('#333333');

    // Total
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#FF6B35');
    
    doc.text('Total:', summaryX, y + 5);
    doc.text(`$${total.toFixed(2)}`, 460, y + 5);
    y += 30;

    // Deposit
    if (depositAmount > 0) {
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#333333');
      
      const depositType = quote.depositType || 'FIXED';
      const depositLabel = depositType === 'PERCENTAGE' ? 
        `Deposit (${depositAmount}%):` : 'Deposit Required:';
      
      const depositValue = depositType === 'PERCENTAGE' ? 
        total * (depositAmount / 100) : depositAmount;
      
      doc.text(depositLabel, summaryX, y);
      doc.text(`$${depositValue.toFixed(2)}`, 460, y);
      y += 20;

      // Balance due
      const balanceDue = total - depositValue;
      doc.text('Balance Due:', summaryX, y);
      doc.text(`$${balanceDue.toFixed(2)}`, 460, y);
      
      if (quote.balanceDueDate) {
        y += 20;
        const dueDate = new Date(quote.balanceDueDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        doc.fontSize(10)
           .fillColor('#666666')
           .text(`Due: ${dueDate}`, summaryX, y);
      }
    }

    doc.y = y + 30;
  }

  private formatServiceType(type: string): string {
    const types: Record<string, string> = {
      'FOOD_TRUCK': 'Food Truck Service',
      'MOBILE_BAR': 'Mobile Bar Service',
      'CATERING': 'Catering Service',
      'RESERVATION': 'Restaurant Reservation'
    };
    return types[type] || type;
  }

  private formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  public async savePDFToFile(quote: QuoteWithDetails): Promise<string> {
    const { buffer, filename } = await this.generateQuotePDF(quote);
    const filepath = path.join(this.uploadsDir, filename);
    await writeFileAsync(filepath, buffer);
    return filepath;
  }

  /**
   * Get the company logo path from environment variables
   */
  private getLogoPath(): string | null {
    const logoPath = process.env.COMPANY_LOGO_PATH;
    if (!logoPath) {
      logger.warn('No COMPANY_LOGO_PATH environment variable set');
      return null;
    }

    // Handle relative paths
    const fullPath = path.isAbsolute(logoPath) 
      ? logoPath 
      : path.join(process.cwd(), logoPath);

    return fullPath;
  }

  /**
   * Check if logo file exists and is readable
   */
  private async logoExists(logoPath: string): Promise<boolean> {
    try {
      await fs.promises.access(logoPath, fs.constants.R_OK);
      return true;
    } catch (error) {
      logger.warn(`Logo file not accessible: ${logoPath}`, { error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  /**
   * Get logo dimensions for proper scaling
   */
  private async getLogoDimensions(logoPath: string): Promise<{ width: number; height: number } | null> {
    try {
      // For now, we'll use a default aspect ratio and let PDFKit handle the scaling
      // In a production environment, you might want to use a library like 'image-size'
      // to get actual dimensions
      return { width: 150, height: 60 }; // Default dimensions for 150px wide logo
    } catch (error) {
      logger.error('Failed to get logo dimensions', { error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }

  /**
   * Add logo to PDF document
   */
  private async addLogoToPDF(doc: any, logoPath: string, x: number, y: number): Promise<boolean> {
    try {
      const dimensions = await this.getLogoDimensions(logoPath);
      if (!dimensions) {
        return false;
      }

      // Add the logo image to the PDF
      doc.image(logoPath, x, y, { 
        width: dimensions.width,
        height: dimensions.height,
        fit: [dimensions.width, dimensions.height]
      });

      logger.info('Logo added to PDF successfully', {
        logoPath,
        x,
        y,
        width: dimensions.width,
        height: dimensions.height
      });

      return true;
    } catch (error) {
      logger.error('Failed to add logo to PDF', {
        logoPath,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }
}
