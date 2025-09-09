import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/services/email.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { CampaignStatus, SubscriberStatus } from '@prisma/client';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    @InjectQueue('email-campaigns') private campaignQueue: Queue,
  ) {}

  async create(createCampaignDto: CreateCampaignDto) {
    try {
      const campaign = await this.prisma.emailCampaign.create({
        data: {
          ...createCampaignDto,
          status: CampaignStatus.DRAFT,
        },
      });

      this.logger.log(`Campaign created: ${campaign.id}`);
      return campaign;
    } catch (error) {
      this.logger.error(`Failed to create campaign: ${error.message}`);
      throw error;
    }
  }

  async findAll(query?: {
    status?: CampaignStatus;
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

    const where = query?.status ? { status: query.status } : {};

    const [campaigns, total] = await Promise.all([
      this.prisma.emailCampaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          _count: {
            select: {
              recipients: true,
            },
          },
        },
      }),
      this.prisma.emailCampaign.count({ where }),
    ]);

    return {
      data: campaigns,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const campaign = await this.prisma.emailCampaign.findUnique({
      where: { id },
      include: {
        recipients: {
          include: {
            subscriber: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            recipients: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto) {
    const campaign = await this.findOne(id);

    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new BadRequestException('Can only edit draft campaigns');
    }

    return this.prisma.emailCampaign.update({
      where: { id },
      data: updateCampaignDto,
    });
  }

  async remove(id: string) {
    const campaign = await this.findOne(id);

    if (campaign.status === CampaignStatus.SENDING || campaign.status === CampaignStatus.SENT) {
      throw new BadRequestException('Cannot delete sent or sending campaigns');
    }

    await this.prisma.emailCampaign.delete({
      where: { id },
    });

    return { message: 'Campaign deleted successfully' };
  }

  async sendCampaign(id: string, targetAudience?: {
    tags?: string[];
    status?: SubscriberStatus;
    subscriberIds?: string[];
  }) {
    const campaign = await this.findOne(id);

    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new BadRequestException('Campaign is not in draft status');
    }

    // Get target subscribers
    const where = {
      ...(targetAudience?.subscriberIds && { id: { in: targetAudience.subscriberIds } }),
      ...(targetAudience?.tags && { tags: { hasSome: targetAudience.tags } }),
      ...(targetAudience?.status ? { status: targetAudience.status } : { status: SubscriberStatus.ACTIVE }),
    };

    const subscribers = await this.prisma.emailSubscriber.findMany({
      where,
    });

    if (subscribers.length === 0) {
      throw new BadRequestException('No subscribers found for the target audience');
    }

    // Create recipient records
    const recipientData = subscribers.map(sub => ({
      campaignId: id,
      subscriberId: sub.id,
    }));

    await this.prisma.campaignRecipient.createMany({
      data: recipientData,
      skipDuplicates: true,
    });

    // Update campaign status
    await this.prisma.emailCampaign.update({
      where: { id },
      data: { status: CampaignStatus.SCHEDULED },
    });

    // Queue campaign for sending
    await this.campaignQueue.add('send-campaign', {
      campaignId: id,
    });

    this.logger.log(`Campaign ${id} queued for sending to ${subscribers.length} recipients`);

    return {
      message: 'Campaign queued for sending',
      recipients: subscribers.length,
    };
  }

  async sendTestEmail(id: string, testEmail: string) {
    const campaign = await this.findOne(id);

    const html = this.processTemplate(campaign.content, {
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      unsubscribeLink: `${process.env.FRONTEND_URL}/unsubscribe?email=${testEmail}`,
    });

    await this.emailService.sendEmail(
      testEmail,
      `[TEST] ${campaign.subject}`,
      html,
    );

    return { message: 'Test email sent successfully' };
  }

  async duplicateCampaign(id: string) {
    const campaign = await this.findOne(id);

    const newCampaign = await this.prisma.emailCampaign.create({
      data: {
        name: `${campaign.name} (Copy)`,
        subject: campaign.subject,
        content: campaign.content,
        fromName: campaign.fromName,
        fromEmail: campaign.fromEmail,
        replyTo: campaign.replyTo,
        status: CampaignStatus.DRAFT,
      },
    });

    return newCampaign;
  }

  async getCampaignStats(id: string) {
    const campaign = await this.findOne(id);

    const stats = await this.prisma.campaignRecipient.aggregate({
      where: { campaignId: id },
      _count: {
        _all: true,
        sent: true,
        opened: true,
        clicked: true,
        unsubscribed: true,
        bounced: true,
      },
    });

    const openRate = stats._count.sent > 0
      ? ((stats._count.opened / stats._count.sent) * 100).toFixed(2)
      : 0;

    const clickRate = stats._count.opened > 0
      ? ((stats._count.clicked / stats._count.opened) * 100).toFixed(2)
      : 0;

    const unsubscribeRate = stats._count.sent > 0
      ? ((stats._count.unsubscribed / stats._count.sent) * 100).toFixed(2)
      : 0;

    const bounceRate = stats._count.sent > 0
      ? ((stats._count.bounced / stats._count.sent) * 100).toFixed(2)
      : 0;

    return {
      campaign,
      stats: {
        totalRecipients: stats._count._all,
        sent: stats._count.sent,
        opened: stats._count.opened,
        clicked: stats._count.clicked,
        unsubscribed: stats._count.unsubscribed,
        bounced: stats._count.bounced,
        openRate: `${openRate}%`,
        clickRate: `${clickRate}%`,
        unsubscribeRate: `${unsubscribeRate}%`,
        bounceRate: `${bounceRate}%`,
      },
    };
  }

  async trackOpen(campaignId: string, subscriberId: string) {
    await this.prisma.campaignRecipient.updateMany({
      where: {
        campaignId,
        subscriberId,
        opened: false,
      },
      data: {
        opened: true,
        openedAt: new Date(),
      },
    });

    // Update campaign stats
    await this.prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        opens: { increment: 1 },
      },
    });
  }

  async trackClick(campaignId: string, subscriberId: string) {
    await this.prisma.campaignRecipient.updateMany({
      where: {
        campaignId,
        subscriberId,
        clicked: false,
      },
      data: {
        clicked: true,
        clickedAt: new Date(),
      },
    });

    // Update campaign stats
    await this.prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        clicks: { increment: 1 },
      },
    });
  }

  async trackUnsubscribe(campaignId: string, subscriberId: string) {
    await this.prisma.campaignRecipient.updateMany({
      where: {
        campaignId,
        subscriberId,
        unsubscribed: false,
      },
      data: {
        unsubscribed: true,
      },
    });

    // Update subscriber status
    await this.prisma.emailSubscriber.update({
      where: { id: subscriberId },
      data: {
        status: SubscriberStatus.UNSUBSCRIBED,
        unsubscribedAt: new Date(),
      },
    });

    // Update campaign stats
    await this.prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        unsubscribes: { increment: 1 },
      },
    });
  }

  private processTemplate(template: string, variables: any): string {
    let processed = template;
    
    // Replace variables in template
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, variables[key]);
    });

    // Add tracking pixel for opens
    const trackingPixel = `<img src="${process.env.FRONTEND_URL}/api/campaigns/track/open/${variables.campaignId}/${variables.subscriberId}" width="1" height="1" />`;
    processed += trackingPixel;

    return processed;
  }
}
