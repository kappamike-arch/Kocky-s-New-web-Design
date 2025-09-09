import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { BulkUploadDto } from './dto/bulk-upload.dto';
import { Prisma, SubscriberStatus } from '@prisma/client';
import * as csv from 'csv-parse';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

@Injectable()
export class EmailListsService {
  private readonly logger = new Logger(EmailListsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createSubscriberDto: CreateSubscriberDto) {
    try {
      // Check if email already exists
      const existing = await this.prisma.emailSubscriber.findUnique({
        where: { email: createSubscriberDto.email },
      });

      if (existing) {
        if (existing.status === SubscriberStatus.UNSUBSCRIBED) {
          // Reactivate if previously unsubscribed
          return this.prisma.emailSubscriber.update({
            where: { id: existing.id },
            data: {
              ...createSubscriberDto,
              status: SubscriberStatus.ACTIVE,
              subscribedAt: new Date(),
              unsubscribedAt: null,
            },
          });
        }
        throw new BadRequestException('Email already exists in the list');
      }

      return this.prisma.emailSubscriber.create({
        data: {
          ...createSubscriberDto,
          status: SubscriberStatus.ACTIVE,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create subscriber: ${error.message}`);
      throw error;
    }
  }

  async findAll(query?: {
    status?: SubscriberStatus;
    search?: string;
    tags?: string[];
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = query?.sortBy || 'subscribedAt';
    const order = query?.order || 'desc';

    const where: Prisma.EmailSubscriberWhereInput = {
      ...(query?.status && { status: query.status }),
      ...(query?.tags && { tags: { hasSome: query.tags } }),
      ...(query?.search && {
        OR: [
          { email: { contains: query.search, mode: 'insensitive' } },
          { firstName: { contains: query.search, mode: 'insensitive' } },
          { lastName: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [subscribers, total] = await Promise.all([
      this.prisma.emailSubscriber.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          _count: {
            select: {
              campaigns: true,
            },
          },
        },
      }),
      this.prisma.emailSubscriber.count({ where }),
    ]);

    return {
      data: subscribers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const subscriber = await this.prisma.emailSubscriber.findUnique({
      where: { id },
      include: {
        campaigns: {
          orderBy: { sentAt: 'desc' },
          take: 10,
          include: {
            campaign: {
              select: {
                id: true,
                name: true,
                subject: true,
                sentAt: true,
              },
            },
          },
        },
      },
    });

    if (!subscriber) {
      throw new NotFoundException(`Subscriber with ID ${id} not found`);
    }

    return subscriber;
  }

  async update(id: string, updateSubscriberDto: UpdateSubscriberDto) {
    await this.findOne(id);

    return this.prisma.emailSubscriber.update({
      where: { id },
      data: updateSubscriberDto,
    });
  }

  async unsubscribe(email: string, reason?: string) {
    const subscriber = await this.prisma.emailSubscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      throw new NotFoundException(`Subscriber with email ${email} not found`);
    }

    return this.prisma.emailSubscriber.update({
      where: { email },
      data: {
        status: SubscriberStatus.UNSUBSCRIBED,
        unsubscribedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.emailSubscriber.delete({
      where: { id },
    });

    return { message: 'Subscriber removed successfully' };
  }

  async bulkUpload(file: Express.Multer.File, options?: BulkUploadDto) {
    try {
      const results = await this.parseFile(file);
      const successfulImports = [];
      const failedImports = [];

      for (const row of results) {
        try {
          const subscriber = await this.prisma.emailSubscriber.upsert({
            where: { email: row.email },
            update: {
              firstName: row.firstName || undefined,
              lastName: row.lastName || undefined,
              tags: options?.tags || [],
              source: options?.source || 'import',
            },
            create: {
              email: row.email,
              firstName: row.firstName || undefined,
              lastName: row.lastName || undefined,
              tags: options?.tags || [],
              source: options?.source || 'import',
              status: SubscriberStatus.ACTIVE,
            },
          });
          successfulImports.push(subscriber);
        } catch (error) {
          failedImports.push({
            email: row.email,
            error: error.message,
          });
        }
      }

      // Clean up uploaded file
      fs.unlinkSync(file.path);

      this.logger.log(`Bulk upload completed: ${successfulImports.length} succeeded, ${failedImports.length} failed`);

      return {
        success: successfulImports.length,
        failed: failedImports.length,
        failedRecords: failedImports,
      };
    } catch (error) {
      this.logger.error(`Bulk upload failed: ${error.message}`);
      // Clean up uploaded file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new BadRequestException(`Failed to process file: ${error.message}`);
    }
  }

  async exportSubscribers(status?: SubscriberStatus) {
    const subscribers = await this.prisma.emailSubscriber.findMany({
      where: status ? { status } : undefined,
      select: {
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        tags: true,
        source: true,
        subscribedAt: true,
      },
    });

    // Convert to CSV format
    const csvData = subscribers.map(sub => ({
      Email: sub.email,
      'First Name': sub.firstName || '',
      'Last Name': sub.lastName || '',
      Status: sub.status,
      Tags: sub.tags.join(', '),
      Source: sub.source || '',
      'Subscribed Date': sub.subscribedAt.toISOString(),
    }));

    return csvData;
  }

  async getStatistics() {
    const [
      totalSubscribers,
      activeSubscribers,
      unsubscribed,
      bounced,
      recentSubscribers,
      topSources,
      growthData,
    ] = await Promise.all([
      this.prisma.emailSubscriber.count(),
      this.prisma.emailSubscriber.count({ where: { status: SubscriberStatus.ACTIVE } }),
      this.prisma.emailSubscriber.count({ where: { status: SubscriberStatus.UNSUBSCRIBED } }),
      this.prisma.emailSubscriber.count({ where: { status: SubscriberStatus.BOUNCED } }),
      this.prisma.emailSubscriber.findMany({
        where: {
          subscribedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        orderBy: { subscribedAt: 'desc' },
        take: 5,
        select: {
          email: true,
          subscribedAt: true,
        },
      }),
      this.prisma.emailSubscriber.groupBy({
        by: ['source'],
        _count: true,
        orderBy: { _count: { source: 'desc' } },
        take: 5,
      }),
      this.getGrowthData(),
    ]);

    const unsubscribeRate = totalSubscribers > 0
      ? ((unsubscribed / totalSubscribers) * 100).toFixed(2)
      : 0;

    return {
      totalSubscribers,
      activeSubscribers,
      unsubscribed,
      bounced,
      unsubscribeRate: `${unsubscribeRate}%`,
      recentSubscribers,
      topSources,
      growthData,
    };
  }

  async addTags(subscriberIds: string[], tags: string[]) {
    const result = await this.prisma.emailSubscriber.updateMany({
      where: { id: { in: subscriberIds } },
      data: {
        tags: { push: tags },
      },
    });

    return { updated: result.count };
  }

  async removeTags(subscriberIds: string[], tags: string[]) {
    // This requires a raw query or fetching and updating each subscriber
    const subscribers = await this.prisma.emailSubscriber.findMany({
      where: { id: { in: subscriberIds } },
    });

    const updatePromises = subscribers.map(sub => {
      const newTags = sub.tags.filter(tag => !tags.includes(tag));
      return this.prisma.emailSubscriber.update({
        where: { id: sub.id },
        data: { tags: newTags },
      });
    });

    await Promise.all(updatePromises);

    return { updated: subscribers.length };
  }

  private async parseFile(file: Express.Multer.File): Promise<any[]> {
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      return this.parseCSV(file.path);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      return this.parseExcel(file.path);
    } else {
      throw new BadRequestException('Unsupported file format. Please upload CSV or Excel file.');
    }
  }

  private parseCSV(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = fs.createReadStream(filePath);
      const parser = csv.parse({
        columns: true,
        skip_empty_lines: true,
      });

      stream.pipe(parser)
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  private parseExcel(filePath: string): any[] {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  }

  private async getGrowthData() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const dailyGrowth = await this.prisma.$queryRaw`
      SELECT 
        DATE(subscribed_at) as date,
        COUNT(*) as new_subscribers
      FROM email_subscribers
      WHERE subscribed_at >= ${thirtyDaysAgo}
      GROUP BY DATE(subscribed_at)
      ORDER BY date ASC
    `;

    return dailyGrowth;
  }
}
