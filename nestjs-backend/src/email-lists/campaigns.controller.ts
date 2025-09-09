import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  Query, UseGuards, Res, HttpCode, HttpStatus 
} from '@nestjs/common';
import type { Response } from 'express';
import { 
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery 
} from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { SendCampaignDto } from './dto/send-campaign.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole, CampaignStatus } from '@prisma/client';

@ApiTags('Email Campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Create a new campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully' })
  create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.create(createCampaignDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Get all campaigns' })
  @ApiQuery({ name: 'status', required: false, enum: CampaignStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully' })
  findAll(@Query() query: any) {
    return this.campaignsService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Get campaign by ID' })
  @ApiResponse({ status: 200, description: 'Campaign retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Get(':id/stats')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Get campaign statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  getStats(@Param('id') id: string) {
    return this.campaignsService.getCampaignStats(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Update campaign' })
  @ApiResponse({ status: 200, description: 'Campaign updated successfully' })
  @ApiResponse({ status: 400, description: 'Can only edit draft campaigns' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  update(@Param('id') id: string, @Body() updateCampaignDto: UpdateCampaignDto) {
    return this.campaignsService.update(id, updateCampaignDto);
  }

  @Post(':id/send')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Send campaign to subscribers' })
  @ApiResponse({ status: 200, description: 'Campaign queued for sending' })
  @ApiResponse({ status: 400, description: 'Invalid campaign status' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  sendCampaign(@Param('id') id: string, @Body() sendDto: SendCampaignDto) {
    return this.campaignsService.sendCampaign(id, sendDto);
  }

  @Post(':id/test')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Send test email' })
  @ApiResponse({ status: 200, description: 'Test email sent successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  sendTest(@Param('id') id: string, @Body('email') email: string) {
    return this.campaignsService.sendTestEmail(id, email);
  }

  @Post(':id/duplicate')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Duplicate campaign' })
  @ApiResponse({ status: 201, description: 'Campaign duplicated successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  duplicate(@Param('id') id: string) {
    return this.campaignsService.duplicateCampaign(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete campaign' })
  @ApiResponse({ status: 200, description: 'Campaign deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete sent campaigns' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  remove(@Param('id') id: string) {
    return this.campaignsService.remove(id);
  }

  // Tracking endpoints
  @Public()
  @Get('track/open/:campaignId/:subscriberId')
  @ApiOperation({ summary: 'Track email open (tracking pixel)' })
  @HttpCode(HttpStatus.OK)
  async trackOpen(
    @Param('campaignId') campaignId: string,
    @Param('subscriberId') subscriberId: string,
    @Res() res: Response,
  ) {
    await this.campaignsService.trackOpen(campaignId, subscriberId);
    
    // Return a 1x1 transparent pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64',
    );
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(pixel);
  }

  @Public()
  @Get('track/click/:campaignId/:subscriberId')
  @ApiOperation({ summary: 'Track link click' })
  async trackClick(
    @Param('campaignId') campaignId: string,
    @Param('subscriberId') subscriberId: string,
    @Query('url') url: string,
    @Res() res: Response,
  ) {
    await this.campaignsService.trackClick(campaignId, subscriberId);
    
    // Redirect to the actual URL
    res.redirect(url || process.env.FRONTEND_URL || 'https://staging.kockys.com');
  }

  @Public()
  @Post('track/unsubscribe/:campaignId/:subscriberId')
  @ApiOperation({ summary: 'Track and process unsubscribe' })
  async trackUnsubscribe(
    @Param('campaignId') campaignId: string,
    @Param('subscriberId') subscriberId: string,
  ) {
    await this.campaignsService.trackUnsubscribe(campaignId, subscriberId);
    return { message: 'Successfully unsubscribed' };
  }
}
