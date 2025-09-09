import { 
  Controller, Get, Post, Body, Query, UseGuards, 
  Req, Res, HttpStatus, HttpCode, Param 
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { 
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery 
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { RecordEventDto } from './dto/record-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Analytics')
@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Post('event')
  @ApiOperation({ summary: 'Record analytics event' })
  @ApiResponse({ status: 201, description: 'Event recorded successfully' })
  @HttpCode(HttpStatus.CREATED)
  async recordEvent(
    @Body() recordEventDto: RecordEventDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString();
    const userAgent = req.headers['user-agent'];
    return this.analyticsService.recordEvent(recordEventDto, ipAddress, userAgent);
  }

  @Public()
  @Post('pageview')
  @ApiOperation({ summary: 'Record page view' })
  @ApiResponse({ status: 201, description: 'Page view recorded' })
  @HttpCode(HttpStatus.CREATED)
  async recordPageView(
    @Body() body: {
      sessionId: string;
      page: string;
      referrer?: string;
      userId?: string;
    },
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString();
    const userAgent = req.headers['user-agent'];
    return this.analyticsService.recordPageView(
      body.sessionId,
      body.page,
      body.referrer,
      body.userId,
      ipAddress,
      userAgent,
    );
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard analytics data' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved' })
  getDashboard(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getDashboardData(
      startDate && endDate ? { startDate, endDate } : undefined,
    );
  }

  @Get('revenue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Revenue data retrieved' })
  getRevenue(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getRevenueAnalytics(
      startDate && endDate ? { startDate, endDate } : undefined,
    );
  }

  @Get('user-journey/:sessionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user journey for a session' })
  @ApiResponse({ status: 200, description: 'User journey retrieved' })
  getUserJourney(@Param('sessionId') sessionId: string) {
    return this.analyticsService.getUserJourney(sessionId);
  }

  @Get('funnel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get conversion funnel data' })
  @ApiResponse({ status: 200, description: 'Funnel data retrieved' })
  getConversionFunnel(@Query('steps') steps: string[]) {
    return this.analyticsService.getConversionFunnel(steps);
  }

  @Get('heatmap')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get heatmap data for a page' })
  @ApiQuery({ name: 'page', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Heatmap data retrieved' })
  getHeatmap(
    @Query('page') page: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getHeatmapData(
      page,
      startDate && endDate ? { startDate, endDate } : undefined,
    );
  }

  @Public()
  @Get('track.gif')
  @ApiOperation({ summary: 'Tracking pixel endpoint' })
  @HttpCode(HttpStatus.OK)
  async trackPixel(
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Record the tracking event
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString();
    const userAgent = req.headers['user-agent'];
    
    await this.analyticsService.recordEvent(
      {
        sessionId: query.sessionId || 'anonymous',
        eventType: 'pixel_track',
        eventName: query.event || 'email_open',
        eventData: query,
      },
      ipAddress,
      userAgent,
    );

    // Return a 1x1 transparent GIF
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64',
    );
    
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
    res.end(pixel);
  }

  @Public()
  @Post('track/click')
  @ApiOperation({ summary: 'Track link clicks' })
  @HttpCode(HttpStatus.OK)
  async trackClick(
    @Body() body: {
      sessionId: string;
      url: string;
      element?: string;
      x?: number;
      y?: number;
    },
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString();
    const userAgent = req.headers['user-agent'];
    
    return this.analyticsService.recordEvent(
      {
        sessionId: body.sessionId,
        eventType: 'click',
        eventName: `Click: ${body.element || body.url}`,
        page: req.headers.referer?.toString(),
        eventData: {
          url: body.url,
          element: body.element,
          x: body.x,
          y: body.y,
        },
      },
      ipAddress,
      userAgent,
    );
  }

  @Public()
  @Post('track/conversion')
  @ApiOperation({ summary: 'Track conversion events' })
  @HttpCode(HttpStatus.OK)
  async trackConversion(
    @Body() body: {
      sessionId: string;
      conversionType: string;
      value?: number;
      metadata?: any;
    },
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString();
    const userAgent = req.headers['user-agent'];
    
    return this.analyticsService.recordEvent(
      {
        sessionId: body.sessionId,
        eventType: 'conversion',
        eventName: `Conversion: ${body.conversionType}`,
        page: req.headers.referer?.toString(),
        eventData: {
          type: body.conversionType,
          value: body.value,
          ...body.metadata,
        },
      },
      ipAddress,
      userAgent,
    );
  }
}
