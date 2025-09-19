import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { mailer } from '../lib/mailer';
import { compileMJML, replaceTemplateVariables } from '../lib/mjml';
// import pLimit from 'p-limit'; // Temporarily disabled due to ES module issues

const prisma = new PrismaClient();

class EmailScheduler {
  private isRunning = false;
  // private sendingLimit = pLimit(parseInt(process.env.SENDING_RATE_PER_SEC || '50')); // Temporarily disabled

  constructor() {
    this.startScheduler();
  }

  private startScheduler() {
    // Run every minute to check for scheduled campaigns
    cron.schedule('* * * * *', async () => {
      if (!this.isRunning) {
        await this.processScheduledCampaigns();
      }
    });

    console.log('Email scheduler started - checking for scheduled campaigns every minute');
  }

  private async processScheduledCampaigns() {
    try {
      this.isRunning = true;

      // Find campaigns that are scheduled and ready to send
      const scheduledCampaigns = await prisma.emailCampaign.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledAt: {
            lte: new Date()
          }
        },
        include: {
          template: true
        }
      });

      console.log(`Found ${scheduledCampaigns.length} scheduled campaigns ready to send`);

      for (const campaign of scheduledCampaigns) {
        await this.sendCampaign(campaign);
      }
    } catch (error) {
      console.error('Error processing scheduled campaigns:', error);
    } finally {
      this.isRunning = false;
    }
  }

  private async sendCampaign(campaign: any) {
    try {
      console.log(`Starting to send campaign: ${campaign.name}`);

      // Update campaign status to SENDING
      await prisma.emailCampaign.update({
        where: { id: campaign.id },
        data: { status: 'SENDING' }
      });

      // Get recipients
      const where: any = {
        consentEmail: true,
        unsubscribedAt: null
      };

      if (campaign.segmentTags && Array.isArray(campaign.segmentTags) && campaign.segmentTags.length > 0) {
        where.tags = { hasSome: campaign.segmentTags };
      }

      const contacts = await prisma.emailContact.findMany({ where });
      console.log(`Found ${contacts.length} recipients for campaign: ${campaign.name}`);

      if (contacts.length === 0) {
        console.log(`No recipients found for campaign: ${campaign.name}`);
        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: { 
            status: 'SENT',
            sentAt: new Date()
          }
        });
        return;
      }

      // Compile template if needed
      let html = campaign.html;
      if (!html && campaign.template) {
        const compiled = compileMJML(campaign.template.mjml);
        if (compiled.errors.length > 0) {
          console.error(`MJML compilation failed for campaign ${campaign.name}:`, compiled.errors);
          await prisma.emailCampaign.update({
            where: { id: campaign.id },
            data: { status: 'CANCELLED' }
          });
          return;
        }
        html = compiled.html;
      }

      // Send emails in batches
      const batchSize = parseInt(process.env.SENDING_BATCH || '200');
      let sentCount = 0;
      let failedCount = 0;

      for (let i = 0; i < contacts.length; i += batchSize) {
        const batch = contacts.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(contacts.length / batchSize)} for campaign: ${campaign.name}`);
        
        const promises = batch.map(contact => 
          (async () => {
            try {
              // Replace template variables
              const personalizedHtml = replaceTemplateVariables(html, {
                firstName: contact.firstName || 'there',
                lastName: contact.lastName || '',
                email: contact.email,
                contactId: contact.id
              });

              const success = await mailer.sendEmail({
                to: contact.email,
                from: campaign.fromEmail,
                subject: campaign.subject,
                html: personalizedHtml
              }, {
                contactId: contact.id,
                campaignId: campaign.id,
                baseUrl: process.env.BACKEND_PUBLIC_URL || '${UPLOADS_URL}'
              });

              if (success) {
                sentCount++;
              } else {
                failedCount++;
              }
            } catch (error) {
              console.error(`Failed to send to ${contact.email}:`, error);
              failedCount++;
            }
          })()
        );

        await Promise.all(promises);

        // Small delay between batches to avoid overwhelming the SMTP server
        if (i + batchSize < contacts.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Update campaign status
      await prisma.emailCampaign.update({
        where: { id: campaign.id },
        data: { 
          status: 'SENT',
          sentAt: new Date()
        }
      });

      console.log(`Campaign ${campaign.name} completed: ${sentCount} sent, ${failedCount} failed`);
    } catch (error) {
      console.error(`Error sending campaign ${campaign.name}:`, error);
      
      // Mark campaign as cancelled on error
      await prisma.emailCampaign.update({
        where: { id: campaign.id },
        data: { status: 'CANCELLED' }
      });
    }
  }

  // Manual method to send a campaign immediately
  async sendCampaignNow(campaignId: string) {
    try {
      const campaign = await prisma.emailCampaign.findUnique({
        where: { id: campaignId },
        include: { template: true }
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.status !== 'DRAFT') {
        throw new Error('Campaign must be in DRAFT status to send immediately');
      }

      await this.sendCampaign(campaign);
    } catch (error) {
      console.error('Error sending campaign immediately:', error);
      throw error;
    }
  }

  // Get campaign statistics
  async getCampaignStats(campaignId: string) {
    try {
      const [sent, opened, clicked, bounced, unsubscribed] = await Promise.all([
        prisma.emailEvent.count({
          where: { campaignId, type: 'SENT' }
        }),
        prisma.emailEvent.count({
          where: { campaignId, type: 'OPEN' }
        }),
        prisma.emailEvent.count({
          where: { campaignId, type: 'CLICK' }
        }),
        prisma.emailEvent.count({
          where: { campaignId, type: 'BOUNCE' }
        }),
        prisma.emailEvent.count({
          where: { campaignId, type: 'UNSUBSCRIBE' }
        })
      ]);

      return {
        sent,
        opened,
        clicked,
        bounced,
        unsubscribed,
        openRate: sent > 0 ? (opened / sent * 100).toFixed(2) : '0',
        clickRate: sent > 0 ? (clicked / sent * 100).toFixed(2) : '0',
        bounceRate: sent > 0 ? (bounced / sent * 100).toFixed(2) : '0'
      };
    } catch (error) {
      console.error('Error getting campaign stats:', error);
      throw error;
    }
  }

  // Clean up old events (optional maintenance)
  async cleanupOldEvents(daysOld = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const deleted = await prisma.emailEvent.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      });

      console.log(`Cleaned up ${deleted.count} email events older than ${daysOld} days`);
      return deleted.count;
    } catch (error) {
      console.error('Error cleaning up old events:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const emailScheduler = new EmailScheduler();
export default emailScheduler;
