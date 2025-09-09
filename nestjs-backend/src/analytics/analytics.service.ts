import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecordEventDto } from './dto/record-event.dto';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('analytics') private analyticsQueue: Queue,
  ) {}

  async recordEvent(eventDto: RecordEventDto, ipAddress?: string, userAgent?: string) {
    try {
      const event = await this.prisma.analyticsEvent.create({
        data: {
          ...eventDto,
          ipAddress,
          userAgent,
          createdAt: new Date(),
        },
      });

      // Queue for additional processing (e.g., geolocation)
      await this.analyticsQueue.add('process-event', {
        eventId: event.id,
      });

      this.logger.log(`Event recorded: ${event.eventType} - ${event.eventName}`);
      return event;
    } catch (error) {
      this.logger.error(`Failed to record event: ${error.message}`);
      throw error;
    }
  }

  async recordPageView(
    sessionId: string,
    page: string,
    referrer?: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.recordEvent(
      {
        sessionId,
        eventType: 'page_view',
        eventName: `Page View: ${page}`,
        page,
        referrer,
        userId,
        eventData: { timestamp: new Date().toISOString() },
      },
      ipAddress,
      userAgent,
    );
  }

  async getDashboardData(dateRange?: { startDate: string; endDate: string }) {
    const where = dateRange
      ? {
          createdAt: {
            gte: new Date(dateRange.startDate),
            lte: new Date(dateRange.endDate),
          },
        }
      : {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        };

    const [
      totalVisits,
      uniqueVisitors,
      pageViews,
      avgSessionDuration,
      topPages,
      topReferrers,
      deviceStats,
      hourlyTraffic,
      conversionStats,
      realtimeVisitors,
    ] = await Promise.all([
      this.getTotalVisits(where),
      this.getUniqueVisitors(where),
      this.getPageViews(where),
      this.getAverageSessionDuration(where),
      this.getTopPages(where),
      this.getTopReferrers(where),
      this.getDeviceStats(where),
      this.getHourlyTraffic(where),
      this.getConversionStats(where),
      this.getRealtimeVisitors(),
    ]);

    return {
      overview: {
        totalVisits,
        uniqueVisitors,
        pageViews,
        avgSessionDuration,
        bounceRate: this.calculateBounceRate(totalVisits, pageViews),
      },
      topPages,
      topReferrers,
      deviceStats,
      hourlyTraffic,
      conversionStats,
      realtimeVisitors,
    };
  }

  async getUserJourney(sessionId: string) {
    const events = await this.prisma.analyticsEvent.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      select: {
        eventType: true,
        eventName: true,
        page: true,
        eventData: true,
        createdAt: true,
      },
    });

    return events;
  }

  async getConversionFunnel(funnelSteps: string[]) {
    const results = [];

    for (let i = 0; i < funnelSteps.length; i++) {
      const step = funnelSteps[i];
      const count = await this.prisma.analyticsEvent.count({
        where: {
          eventName: step,
        },
      });

      const dropoffRate: number = i > 0 && results[i - 1].count > 0
        ? ((results[i - 1].count - count) / results[i - 1].count) * 100
        : 0;

      results.push({
        step,
        count,
        dropoffRate: `${dropoffRate.toFixed(2)}%`,
      });
    }

    return results;
  }

  async getHeatmapData(page: string, dateRange?: { startDate: string; endDate: string }) {
    const where = {
      page,
      eventType: 'click',
      ...(dateRange && {
        createdAt: {
          gte: new Date(dateRange.startDate),
          lte: new Date(dateRange.endDate),
        },
      }),
    };

    const clickEvents = await this.prisma.analyticsEvent.findMany({
      where,
      select: {
        eventData: true,
      },
    });

    // Process click coordinates from eventData
    const heatmapData = clickEvents
      .filter(event => event.eventData && typeof event.eventData === 'object')
      .map(event => {
        const data = event.eventData as any;
        return {
          x: data.x || 0,
          y: data.y || 0,
          value: 1,
        };
      });

    return heatmapData;
  }

  async getRevenueAnalytics(dateRange?: { startDate: string; endDate: string }) {
    const where = dateRange
      ? {
          createdAt: {
            gte: new Date(dateRange.startDate),
            lte: new Date(dateRange.endDate),
          },
        }
      : {};

    const [
      totalRevenue,
      orderCount,
      averageOrderValue,
      topProducts,
      revenueByDay,
      customerLifetimeValue,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where,
        _sum: { total: true },
      }),
      this.prisma.order.count({ where }),
      this.prisma.order.aggregate({
        where,
        _avg: { total: true },
      }),
      this.getTopProducts(where),
      this.getRevenueByDay(where),
      this.getCustomerLifetimeValue(),
    ]);

    return {
      totalRevenue: totalRevenue._sum.total || 0,
      orderCount,
      averageOrderValue: averageOrderValue._avg.total || 0,
      topProducts,
      revenueByDay,
      customerLifetimeValue,
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyReport() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const dateRange = {
        startDate: new Date(yesterday.setHours(0, 0, 0, 0)).toISOString(),
        endDate: new Date(yesterday.setHours(23, 59, 59, 999)).toISOString(),
      };

      const dashboardData = await this.getDashboardData(dateRange);
      const revenueData = await this.getRevenueAnalytics(dateRange);

      // Queue email report
      await this.analyticsQueue.add('send-daily-report', {
        date: yesterday.toDateString(),
        dashboardData,
        revenueData,
      });

      this.logger.log('Daily analytics report generated');
    } catch (error) {
      this.logger.error(`Failed to generate daily report: ${error.message}`);
    }
  }

  // Private helper methods
  private async getTotalVisits(where: any) {
    return this.prisma.analyticsEvent.count({
      where: {
        ...where,
        eventType: 'page_view',
      },
    });
  }

  private async getUniqueVisitors(where: any) {
    const result = await this.prisma.analyticsEvent.findMany({
      where: {
        ...where,
        eventType: 'page_view',
      },
      distinct: ['sessionId'],
      select: { sessionId: true },
    });
    return result.length;
  }

  private async getPageViews(where: any) {
    return this.prisma.analyticsEvent.count({
      where: {
        ...where,
        eventType: 'page_view',
      },
    });
  }

  private async getAverageSessionDuration(where: any) {
    const sessions = await this.prisma.analyticsEvent.groupBy({
      by: ['sessionId'],
      where,
      _min: { createdAt: true },
      _max: { createdAt: true },
    });

    if (sessions.length === 0) return 0;

    const totalDuration = sessions.reduce((sum, session) => {
      if (session._min.createdAt && session._max.createdAt) {
        const duration = session._max.createdAt.getTime() - session._min.createdAt.getTime();
        return sum + duration;
      }
      return sum;
    }, 0);

    return Math.round(totalDuration / sessions.length / 1000); // in seconds
  }

  private async getTopPages(where: any) {
    const pages = await this.prisma.analyticsEvent.groupBy({
      by: ['page'],
      where: {
        ...where,
        eventType: 'page_view',
        page: { not: null },
      },
      _count: true,
      orderBy: { _count: { page: 'desc' } },
      take: 10,
    });

    return pages.map(p => ({
      page: p.page,
      views: p._count,
    }));
  }

  private async getTopReferrers(where: any) {
    const referrers = await this.prisma.analyticsEvent.groupBy({
      by: ['referrer'],
      where: {
        ...where,
        referrer: { not: null },
      },
      _count: true,
      orderBy: { _count: { referrer: 'desc' } },
      take: 10,
    });

    return referrers.map(r => ({
      referrer: r.referrer,
      count: r._count,
    }));
  }

  private async getDeviceStats(where: any) {
    const events = await this.prisma.analyticsEvent.findMany({
      where,
      select: { userAgent: true },
    });

    const stats = {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    };

    events.forEach(event => {
      const ua = event.userAgent?.toLowerCase() || '';
      if (ua.includes('mobile')) {
        stats.mobile++;
      } else if (ua.includes('tablet') || ua.includes('ipad')) {
        stats.tablet++;
      } else {
        stats.desktop++;
      }
    });

    return stats;
  }

  private async getHourlyTraffic(where: any) {
    const events = await this.prisma.analyticsEvent.findMany({
      where: {
        ...where,
        eventType: 'page_view',
      },
      select: { createdAt: true },
    });

    const hourlyData = Array(24).fill(0);
    events.forEach(event => {
      const hour = event.createdAt.getHours();
      hourlyData[hour]++;
    });

    return hourlyData.map((count, hour) => ({
      hour: `${hour}:00`,
      visits: count,
    }));
  }

  private async getConversionStats(where: any) {
    const [inquiries, quotes, orders, reservations] = await Promise.all([
      this.prisma.inquiry.count({ where }),
      this.prisma.quote.count({ where }),
      this.prisma.order.count({ where }),
      this.prisma.reservation.count({ where }),
    ]);

    return {
      inquiries,
      quotes,
      orders,
      reservations,
    };
  }

  private async getRealtimeVisitors() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const activeVisitors = await this.prisma.analyticsEvent.findMany({
      where: {
        createdAt: { gte: fiveMinutesAgo },
        eventType: 'page_view',
      },
      distinct: ['sessionId'],
      select: {
        sessionId: true,
        page: true,
        createdAt: true,
      },
    });

    return {
      count: activeVisitors.length,
      pages: activeVisitors.map(v => v.page),
    };
  }

  private calculateBounceRate(totalVisits: number, pageViews: number): string {
    if (totalVisits === 0) return '0%';
    const bounceRate = ((totalVisits - pageViews) / totalVisits) * 100;
    return `${Math.max(0, bounceRate).toFixed(2)}%`;
  }

  private async getTopProducts(where: any) {
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: where,
      },
      include: {
        menuItem: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    });

    const productMap = new Map();
    orderItems.forEach(item => {
      const key = item.menuItem.name;
      if (productMap.has(key)) {
        const existing = productMap.get(key);
        productMap.set(key, {
          ...existing,
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.total,
        });
      } else {
        productMap.set(key, {
          name: item.menuItem.name,
          category: item.menuItem.category,
          quantity: item.quantity,
          revenue: item.total,
        });
      }
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private async getRevenueByDay(where: any) {
    const orders = await this.prisma.order.findMany({
      where,
      select: {
        total: true,
        createdAt: true,
      },
    });

    const dailyRevenue = new Map();
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      const current = dailyRevenue.get(date) || 0;
      dailyRevenue.set(date, current + order.total);
    });

    return Array.from(dailyRevenue.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }

  private async getCustomerLifetimeValue() {
    const customers = await this.prisma.customer.findMany({
      select: {
        id: true,
        totalSpent: true,
        createdAt: true,
      },
      where: {
        totalSpent: { gt: 0 },
      },
    });

    if (customers.length === 0) return 0;

    const totalValue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    return totalValue / customers.length;
  }
}
