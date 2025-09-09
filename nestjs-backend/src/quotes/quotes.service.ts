import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { CreateQuoteFullDto, DiscountType } from './dto/create-quote-full.dto';
import { EmailService } from '../common/services/email.service';
import { StripeService } from '../common/services/stripe.service';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { QuoteStatus, Prisma } from '@prisma/client';

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly stripeService: StripeService,
    @InjectQueue('quotes') private quotesQueue: Queue,
  ) {}

  async createFullQuote(createQuoteDto: CreateQuoteFullDto, userId?: string) {
    try {
      // Generate unique quote number
      const quoteNumber = await this.generateQuoteNumber();

      // Calculate totals
      const itemsTotal = createQuoteDto.items.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);

      const packagesTotal = createQuoteDto.packages?.reduce((sum, pkg) => {
        return sum + pkg.price;
      }, 0) || 0;

      const laborTotal = createQuoteDto.laborItems?.reduce((sum, labor) => {
        return sum + (labor.hours * labor.rate);
      }, 0) || 0;

      const subtotal = itemsTotal + packagesTotal + laborTotal;
      
      // Calculate discount
      let discountAmount = 0;
      if (createQuoteDto.discount) {
        if (createQuoteDto.discountType === DiscountType.PERCENTAGE) {
          discountAmount = (subtotal * createQuoteDto.discount) / 100;
        } else {
          discountAmount = createQuoteDto.discount;
        }
      }

      // Calculate tax
      const taxableAmount = subtotal - discountAmount;
      const taxRate = createQuoteDto.taxRate || 0;
      const taxAmount = (taxableAmount * taxRate) / 100;

      // Calculate total
      const total = taxableAmount + taxAmount;

      // Calculate validity date
      const validityDays = createQuoteDto.validityDays || 30;
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + validityDays);

      // Create quote with all related data
      const quote = await this.prisma.quote.create({
        data: {
          quoteNumber,
          inquiryId: createQuoteDto.inquiryId,
          customerId: createQuoteDto.customerId,
          title: createQuoteDto.title,
          description: createQuoteDto.description,
          eventDate: createQuoteDto.eventDate ? new Date(createQuoteDto.eventDate) : undefined,
          eventLocation: createQuoteDto.eventLocation,
          guestCount: createQuoteDto.guestCount,
          subtotal,
          taxRate,
          taxAmount,
          discount: discountAmount,
          discountType: createQuoteDto.discountType || DiscountType.FIXED,
          total,
          status: QuoteStatus.DRAFT,
          validUntil,
          notes: createQuoteDto.notes,
          internalNotes: createQuoteDto.internalNotes,
          termsAndConditions: createQuoteDto.termsAndConditions,
          templateId: createQuoteDto.templateId,
          createdBy: userId,
          // Create related items
          items: {
            create: createQuoteDto.items.map((item, index) => ({
              name: item.name,
              description: item.description,
              category: item.category,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
              isOptional: item.isOptional || false,
              sortOrder: index,
            })),
          },
          // Create packages if provided
          ...(createQuoteDto.packages && {
            packages: {
              create: createQuoteDto.packages.map((pkg, index) => ({
                name: pkg.name,
                description: pkg.description,
                items: pkg.items,
                price: pkg.price,
                isOptional: pkg.isOptional || false,
                sortOrder: index,
              })),
            },
          }),
          // Create labor items if provided
          ...(createQuoteDto.laborItems && {
            laborItems: {
              create: createQuoteDto.laborItems.map((labor, index) => ({
                description: labor.description,
                hours: labor.hours,
                rate: labor.rate,
                total: labor.hours * labor.rate,
                staffName: labor.staffName,
                isOptional: labor.isOptional || false,
                sortOrder: index,
              })),
            },
          }),
        },
        include: {
          items: true,
          packages: true,
          laborItems: true,
          customer: true,
          inquiry: true,
        },
      });

      // Generate Stripe payment link if requested
      if (createQuoteDto.generatePaymentLink) {
        try {
          const paymentLink = await this.createStripePaymentLink(quote);
          await this.prisma.quote.update({
            where: { id: quote.id },
            data: { stripePaymentLink: paymentLink },
          });
          quote.stripePaymentLink = paymentLink;
        } catch (error) {
          this.logger.error(`Failed to create payment link: ${error.message}`);
        }
      }

      this.logger.log(`Quote created: ${quote.quoteNumber}`);
      return quote;
    } catch (error) {
      this.logger.error(`Failed to create quote: ${error.message}`);
      throw error;
    }
  }

  async create(createQuoteDto: CreateQuoteDto) {
    try {
      // Calculate totals
      const subtotal = createQuoteDto.items.reduce(
        (sum, item) => sum + (item.unitPrice * item.quantity),
        0,
      );
      const tax = subtotal * (createQuoteDto.taxRate || 0.08);
      const discount = createQuoteDto.discount || 0;
      const total = subtotal + tax - discount;

      // Create quote with items
      const quote = await this.prisma.quote.create({
        data: {
          customerId: createQuoteDto.customerId,
          userId: createQuoteDto.userId,
          inquiryId: createQuoteDto.inquiryId,
          status: QuoteStatus.DRAFT,
          validUntil: new Date(createQuoteDto.validUntil),
          subtotal,
          tax,
          discount,
          total,
          notes: createQuoteDto.notes,
          terms: createQuoteDto.terms,
          items: {
            create: createQuoteDto.items.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            })),
          },
        },
        include: {
          items: true,
          customer: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Generate Stripe payment link if requested
      if (createQuoteDto.generatePaymentLink) {
        const paymentLink = await this.generatePaymentLink(quote);
        await this.prisma.quote.update({
          where: { id: quote.id },
          data: { stripePaymentLink: paymentLink },
        });
        quote.stripePaymentLink = paymentLink;
      }

      this.logger.log(`Quote created: ${quote.quoteNumber}`);
      return quote;
    } catch (error) {
      this.logger.error(`Failed to create quote: ${error.message}`);
      throw error;
    }
  }

  async findAll(query?: {
    status?: QuoteStatus;
    customerId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = query?.sortBy || 'createdAt';
    const order = query?.order || 'desc';

    const where = {
      ...(query?.status && { status: query.status }),
      ...(query?.customerId && { customerId: query.customerId }),
    };

    const [quotes, total] = await Promise.all([
      this.prisma.quote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              company: true,
            },
          },
          items: true,
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
      this.prisma.quote.count({ where }),
    ]);

    return {
      data: quotes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        inquiry: true,
      },
    });

    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }

    return quote;
  }

  async findByQuoteNumber(quoteNumber: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { quoteNumber },
      include: {
        items: true,
        customer: true,
      },
    });

    if (!quote) {
      throw new NotFoundException(`Quote ${quoteNumber} not found`);
    }

    return quote;
  }

  async update(id: string, updateQuoteDto: UpdateQuoteDto) {
    const quote = await this.findOne(id);

    // Recalculate totals if items changed
    let updateData: any = { ...updateQuoteDto };
    
    if (updateQuoteDto.items) {
      const subtotal = updateQuoteDto.items.reduce(
        (sum, item) => sum + (item.unitPrice * item.quantity),
        0,
      );
      const tax = subtotal * (updateQuoteDto.taxRate || quote.tax / quote.subtotal);
      const discount = updateQuoteDto.discount || quote.discount;
      const total = subtotal + tax - discount;

      updateData = {
        ...updateData,
        subtotal,
        tax,
        discount,
        total,
      };

      // Delete existing items and create new ones
      await this.prisma.quoteItem.deleteMany({
        where: { quoteId: id },
      });
    }

    const updatedQuote = await this.prisma.quote.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateQuoteDto.items && {
          items: {
            create: updateQuoteDto.items.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            })),
          },
        }),
      },
      include: {
        items: true,
        customer: true,
      },
    });

    this.logger.log(`Quote ${id} updated`);
    return updatedQuote;
  }

  async sendQuoteEmail(id: string) {
    const quote = await this.findOne(id);

    if (!quote.customer) {
      throw new BadRequestException('Quote has no customer associated');
    }

    // Mark quote as sent
    await this.prisma.quote.update({
      where: { id },
      data: {
        status: QuoteStatus.SENT,
        emailSent: true,
        emailSentAt: new Date(),
      },
    });

    // Queue email sending
    await this.quotesQueue.add('send-quote-email', {
      quoteId: id,
    });

    // Send email
    await this.emailService.sendQuoteEmail(quote, quote.customer);

    this.logger.log(`Quote ${quote.quoteNumber} sent via email`);
    return { message: 'Quote sent successfully' };
  }

  async generatePaymentLink(quoteOrId: any) {
    let quote;
    if (typeof quoteOrId === 'string') {
      quote = await this.findOne(quoteOrId);
    } else {
      quote = quoteOrId;
    }

    try {
      const paymentLink = await this.stripeService.createPaymentLink(
        quote.total,
        `Quote #${quote.quoteNumber}`,
        {
          quoteId: quote.id,
          quoteNumber: quote.quoteNumber,
        },
      );

      // Update quote with payment link
      if (typeof quoteOrId === 'string') {
        await this.prisma.quote.update({
          where: { id: quote.id },
          data: { stripePaymentLink: paymentLink },
        });
      }

      this.logger.log(`Payment link generated for quote ${quote.quoteNumber}`);
      return paymentLink;
    } catch (error) {
      this.logger.error(`Failed to generate payment link: ${error.message}`);
      throw new BadRequestException('Failed to generate payment link');
    }
  }

  async markAsAccepted(id: string) {
    const quote = await this.findOne(id);

    const updatedQuote = await this.prisma.quote.update({
      where: { id },
      data: {
        status: QuoteStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
      include: {
        customer: true,
        items: true,
      },
    });

    // Queue notification
    await this.quotesQueue.add('quote-accepted', {
      quoteId: id,
    });

    this.logger.log(`Quote ${quote.quoteNumber} marked as accepted`);
    return updatedQuote;
  }

  async markAsRejected(id: string, reason?: string) {
    const quote = await this.findOne(id);

    const updatedQuote = await this.prisma.quote.update({
      where: { id },
      data: {
        status: QuoteStatus.REJECTED,
        notes: reason ? `${quote.notes}\nRejection reason: ${reason}` : quote.notes,
      },
      include: {
        customer: true,
        items: true,
      },
    });

    this.logger.log(`Quote ${quote.quoteNumber} marked as rejected`);
    return updatedQuote;
  }

  async duplicate(id: string) {
    const quote = await this.findOne(id);

    const newQuote = await this.prisma.quote.create({
      data: {
        customerId: quote.customerId,
        userId: quote.userId,
        inquiryId: quote.inquiryId,
        status: QuoteStatus.DRAFT,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        subtotal: quote.subtotal,
        tax: quote.tax,
        discount: quote.discount,
        total: quote.total,
        notes: quote.notes,
        terms: quote.terms,
        items: {
          create: quote.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    this.logger.log(`Quote ${quote.quoteNumber} duplicated as ${newQuote.quoteNumber}`);
    return newQuote;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.quote.delete({
      where: { id },
    });

    this.logger.log(`Quote ${id} deleted`);
    return { message: 'Quote deleted successfully' };
  }

  async getStatistics(dateRange?: { startDate: string; endDate: string }) {
    const where = dateRange
      ? {
          createdAt: {
            gte: new Date(dateRange.startDate),
            lte: new Date(dateRange.endDate),
          },
        }
      : {};

    const [
      totalQuotes,
      statusCounts,
      totalValue,
      acceptanceRate,
      averageQuoteValue,
    ] = await Promise.all([
      this.prisma.quote.count({ where }),
      this.prisma.quote.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.quote.aggregate({
        where,
        _sum: { total: true },
      }),
      this.calculateAcceptanceRate(where),
      this.prisma.quote.aggregate({
        where,
        _avg: { total: true },
      }),
    ]);

    return {
      totalQuotes,
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      }, {} as Record<string, number>),
      totalValue: totalValue._sum.total || 0,
      acceptanceRate,
      averageQuoteValue: averageQuoteValue._avg.total || 0,
    };
  }

  private async calculateAcceptanceRate(where: any) {
    const [accepted, total] = await Promise.all([
      this.prisma.quote.count({
        where: { ...where, status: QuoteStatus.ACCEPTED },
      }),
      this.prisma.quote.count({
        where: {
          ...where,
          status: { in: [QuoteStatus.ACCEPTED, QuoteStatus.REJECTED] },
        },
      }),
    ]);

    return total > 0 ? (accepted / total) * 100 : 0;
  }

  private async createStripePaymentLink(quote: any): Promise<string> {
    const lineItems = [];

    // Add items
    for (const item of quote.items || []) {
      if (!item.isOptional) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name || item.description,
              description: item.description,
            },
            unit_amount: Math.round(item.unitPrice * 100), // Convert to cents
          },
          quantity: item.quantity,
        });
      }
    }

    // Add packages
    if (quote.packages) {
      for (const pkg of quote.packages) {
        if (!pkg.isOptional) {
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: pkg.name,
                description: pkg.description,
              },
              unit_amount: Math.round(pkg.price * 100),
            },
            quantity: 1,
          });
        }
      }
    }

    // Add labor
    if (quote.laborItems) {
      for (const labor of quote.laborItems) {
        if (!labor.isOptional) {
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: labor.description,
                description: `${labor.hours} hours at $${labor.rate}/hour`,
              },
              unit_amount: Math.round(labor.total * 100),
            },
            quantity: 1,
          });
        }
      }
    }

    // Create Stripe payment link
    const paymentLink = await this.stripeService.createPaymentLink({
      line_items: lineItems,
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.FRONTEND_URL}/quotes/${quote.id}/success`,
        },
      },
      metadata: {
        quoteId: quote.id,
        quoteNumber: quote.quoteNumber,
      },
    });

    return paymentLink.url;
  }

  async sendQuoteEmailWithPayment(id: string, recipientEmail?: string) {
    const quote = await this.findOne(id);

    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }

    const email = recipientEmail || quote.customer?.email;
    if (!email) {
      throw new BadRequestException('No email address provided');
    }

    // Generate payment link if not already exists
    if (!quote.stripePaymentLink && quote.status === QuoteStatus.DRAFT) {
      try {
        const paymentLink = await this.createStripePaymentLink(quote);
        await this.prisma.quote.update({
          where: { id },
          data: { stripePaymentLink: paymentLink },
        });
        quote.stripePaymentLink = paymentLink;
      } catch (error) {
        this.logger.error(`Failed to create payment link: ${error.message}`);
      }
    }

    // Build email HTML
    const emailHtml = this.buildQuoteEmailHtml(quote);

    // Send email
    await this.emailService.sendEmail(
      email,
      `Quote ${quote.quoteNumber} - ${quote.total ? `$${quote.total}` : ''}`,
      emailHtml,
    );

    // Update quote status to SENT
    await this.prisma.quote.update({
      where: { id },
      data: {
        status: QuoteStatus.SENT,
        sentAt: new Date(),
      },
    });

    this.logger.log(`Quote ${quote.quoteNumber} sent to ${email}`);
    return { message: 'Quote sent successfully', paymentLink: quote.stripePaymentLink };
  }

  private buildQuoteEmailHtml(quote: any): string {
    const viewUrl = `${process.env.FRONTEND_URL}/quotes/${quote.id}/view`;
    const payUrl = quote.stripePaymentLink || viewUrl;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Quote ${quote.quoteNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
          .quote-details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #f0f0f0; padding: 10px; text-align: left; }
          .items-table td { padding: 10px; border-bottom: 1px solid #eee; }
          .total-row { font-weight: bold; font-size: 1.2em; background: #f9f9f9; }
          .cta-button { display: inline-block; background: #FF6B35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Kocky's Bar & Grill</h1>
            <h2>Quote ${quote.quoteNumber}</h2>
          </div>
          
          <div class="content">
            <h3>Dear ${quote.customer?.name || 'Valued Customer'},</h3>
            
            <p>Thank you for your interest in our services. Please find your quote details below:</p>
            
            <div class="quote-details">
              <h4>${quote.title || 'Service Quote'}</h4>
              ${quote.eventDate ? `<p><strong>Event Date:</strong> ${new Date(quote.eventDate).toLocaleDateString()}</p>` : ''}
              ${quote.location ? `<p><strong>Location:</strong> ${quote.location}</p>` : ''}
              ${quote.guestCount ? `<p><strong>Guest Count:</strong> ${quote.guestCount}</p>` : ''}
            </div>

            <h3>Quote Details</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${(quote.items || []).map((item: any) => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.unitPrice.toFixed(2)}</td>
                    <td>$${item.total.toFixed(2)}</td>
                  </tr>
                `).join('')}
                
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;">Total:</td>
                  <td>$${quote.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${payUrl}" class="cta-button">View Quote & Pay</a>
            </div>

            <p><small>This quote is valid until ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'further notice'}.</small></p>
          </div>

          <div class="footer">
            <p>Thank you for choosing Kocky's Bar & Grill!</p>
            <p>Questions? Contact us at quotes@kockysbar.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async handleStripeWebhook(event: any) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
        case 'checkout.session.completed':
          const session = event.data.object;
          const quoteId = session.metadata?.quoteId;
          
          if (quoteId) {
            await this.prisma.quote.update({
              where: { id: quoteId },
              data: {
                status: QuoteStatus.PAID,
                paidAt: new Date(),
                stripeCheckoutId: session.id,
              },
            });
            
            this.logger.log(`Quote ${quoteId} marked as PAID via webhook`);
            
            // Queue notification
            await this.quotesQueue.add('payment-received', {
              quoteId,
              amount: session.amount_total / 100,
            });
          }
          break;
      }
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`);
      throw error;
    }
  }
}
