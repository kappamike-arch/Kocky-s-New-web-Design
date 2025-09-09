import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { UpdateInquiryStatusDto } from './dto/update-inquiry-status.dto';
import { EmailService } from '../common/services/email.service';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Prisma, InquiryStatus, Priority } from '@prisma/client';

@Injectable()
export class InquiriesService {
  private readonly logger = new Logger(InquiriesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    @InjectQueue('inquiries') private inquiriesQueue: Queue,
  ) {}

  async create(createInquiryDto: CreateInquiryDto) {
    try {
      // Create inquiry
      const inquiry = await this.prisma.inquiry.create({
        data: {
          ...createInquiryDto,
          status: InquiryStatus.NEW,
        },
        include: {
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

      // Queue email notification
      await this.inquiriesQueue.add('send-notification', {
        inquiryId: inquiry.id,
        type: 'new',
      });

      // Send confirmation email to customer
      await this.sendConfirmationEmail(inquiry);

      this.logger.log(`New inquiry created: ${inquiry.id}`);
      return inquiry;
    } catch (error) {
      this.logger.error(`Failed to create inquiry: ${error.message}`);
      throw error;
    }
  }

  async findAll(query?: {
    status?: InquiryStatus;
    priority?: Priority;
    assignedTo?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = query?.sortBy || 'createdAt';
    const order = query?.order || 'desc';

    const where: Prisma.InquiryWhereInput = {
      ...(query?.status && { status: query.status }),
      ...(query?.priority && { priority: query.priority }),
      ...(query?.assignedTo && { assignedTo: query.assignedTo }),
      ...(query?.search && {
        OR: [
          { subject: { contains: query.search, mode: 'insensitive' } },
          { message: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { name: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...(query?.startDate && {
        createdAt: {
          gte: new Date(query.startDate),
          ...(query?.endDate && { lte: new Date(query.endDate) }),
        },
      }),
    };

    const [inquiries, total] = await Promise.all([
      this.prisma.inquiry.findMany({
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
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              quotes: true,
            },
          },
        },
      }),
      this.prisma.inquiry.count({ where }),
    ]);

    return {
      data: inquiries,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id },
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        quotes: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
          },
        },
      },
    });

    if (!inquiry) {
      throw new NotFoundException(`Inquiry with ID ${id} not found`);
    }

    return inquiry;
  }

  async update(id: string, updateInquiryDto: UpdateInquiryDto) {
    await this.findOne(id); // Check if exists

    const inquiry = await this.prisma.inquiry.update({
      where: { id },
      data: updateInquiryDto,
      include: {
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

    this.logger.log(`Inquiry ${id} updated`);
    return inquiry;
  }

  async updateStatus(id: string, updateStatusDto: UpdateInquiryStatusDto) {
    const inquiry = await this.findOne(id);

    const updatedInquiry = await this.prisma.inquiry.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
        ...(updateStatusDto.notes && { notes: updateStatusDto.notes }),
        ...(updateStatusDto.assignedTo && { assignedTo: updateStatusDto.assignedTo }),
        ...(updateStatusDto.status === InquiryStatus.RESOLVED && { 
          resolvedAt: new Date() 
        }),
      },
      include: {
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

    // Send status update notification
    if (updateStatusDto.notifyCustomer) {
      await this.inquiriesQueue.add('send-status-update', {
        inquiryId: id,
        oldStatus: inquiry.status,
        newStatus: updateStatusDto.status,
      });
    }

    this.logger.log(`Inquiry ${id} status updated to ${updateStatusDto.status}`);
    return updatedInquiry;
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    await this.prisma.inquiry.delete({
      where: { id },
    });

    this.logger.log(`Inquiry ${id} deleted`);
    return { message: 'Inquiry deleted successfully' };
  }

  async getStatistics(dateRange?: { startDate: string; endDate: string }) {
    const where: Prisma.InquiryWhereInput = dateRange
      ? {
          createdAt: {
            gte: new Date(dateRange.startDate),
            lte: new Date(dateRange.endDate),
          },
        }
      : {};

    const [
      totalInquiries,
      statusCounts,
      priorityCounts,
      averageResolutionTime,
      recentInquiries,
    ] = await Promise.all([
      this.prisma.inquiry.count({ where }),
      this.prisma.inquiry.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.inquiry.groupBy({
        by: ['priority'],
        where,
        _count: true,
      }),
      this.getAverageResolutionTime(where),
      this.prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          subject: true,
          status: true,
          priority: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      totalInquiries,
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      }, {} as Record<string, number>),
      priorityCounts: priorityCounts.reduce((acc, curr) => {
        acc[curr.priority] = curr._count;
        return acc;
      }, {} as Record<string, number>),
      averageResolutionTime,
      recentInquiries,
    };
  }

  async bulkUpdateStatus(ids: string[], status: InquiryStatus, assignedTo?: string) {
    const result = await this.prisma.inquiry.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        status,
        ...(assignedTo && { assignedTo }),
        ...(status === InquiryStatus.RESOLVED && { resolvedAt: new Date() }),
      },
    });

    this.logger.log(`Bulk updated ${result.count} inquiries to status ${status}`);
    return result;
  }

  private async sendConfirmationEmail(inquiry: any) {
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Thank You for Your Inquiry</h1>
          <p>Dear ${inquiry.name},</p>
          <p>We've received your inquiry and will get back to you as soon as possible.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Inquiry Details:</h3>
            <p><strong>Reference ID:</strong> ${inquiry.id}</p>
            <p><strong>Subject:</strong> ${inquiry.subject}</p>
            <p><strong>Message:</strong></p>
            <p>${inquiry.message}</p>
          </div>
          <p>Our team typically responds within 24-48 hours during business days.</p>
          <p>Best regards,<br>Kocky's Bar & Grill Team</p>
        </div>
      `;

      await this.emailService.sendEmail(
        inquiry.email,
        `Re: ${inquiry.subject} - Inquiry Received`,
        html,
      );
    } catch (error) {
      this.logger.error(`Failed to send confirmation email: ${error.message}`);
    }
  }

  private async getAverageResolutionTime(where: Prisma.InquiryWhereInput) {
    const resolvedInquiries = await this.prisma.inquiry.findMany({
      where: {
        ...where,
        status: InquiryStatus.RESOLVED,
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    });

    if (resolvedInquiries.length === 0) {
      return 0;
    }

    const totalTime = resolvedInquiries.reduce((acc, inquiry) => {
      const resolutionTime = inquiry.resolvedAt!.getTime() - inquiry.createdAt.getTime();
      return acc + resolutionTime;
    }, 0);

    // Return average in hours
    return Math.round((totalTime / resolvedInquiries.length) / (1000 * 60 * 60));
  }
}
