import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards 
} from '@nestjs/common';
import { 
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery 
} from '@nestjs/swagger';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { UpdateInquiryStatusDto } from './dto/update-inquiry-status.dto';
import { BulkUpdateStatusDto } from './dto/bulk-update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole, InquiryStatus, Priority } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Inquiries')
@Controller('api/inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Public()
  @Post('submit')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute for public submissions
  @ApiOperation({ summary: 'Submit a new inquiry (public)' })
  @ApiResponse({ status: 201, description: 'Inquiry submitted successfully' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  submitInquiry(@Body() createInquiryDto: CreateInquiryDto) {
    return this.inquiriesService.create(createInquiryDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new inquiry (internal)' })
  @ApiResponse({ status: 201, description: 'Inquiry created successfully' })
  create(@Body() createInquiryDto: CreateInquiryDto) {
    return this.inquiriesService.create(createInquiryDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all inquiries with filtering' })
  @ApiQuery({ name: 'status', required: false, enum: InquiryStatus })
  @ApiQuery({ name: 'priority', required: false, enum: Priority })
  @ApiQuery({ name: 'assignedTo', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Inquiries retrieved successfully' })
  findAll(@Query() query: any) {
    return this.inquiriesService.findAll(query);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get inquiry statistics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.inquiriesService.getStatistics(
      startDate && endDate ? { startDate, endDate } : undefined,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get inquiry by ID' })
  @ApiResponse({ status: 200, description: 'Inquiry retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  findOne(@Param('id') id: string) {
    return this.inquiriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update inquiry' })
  @ApiResponse({ status: 200, description: 'Inquiry updated successfully' })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  update(@Param('id') id: string, @Body() updateInquiryDto: UpdateInquiryDto) {
    return this.inquiriesService.update(id, updateInquiryDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update inquiry status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateInquiryStatusDto,
  ) {
    return this.inquiriesService.updateStatus(id, updateStatusDto);
  }

  @Post('bulk-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update inquiry status' })
  @ApiResponse({ status: 200, description: 'Bulk update successful' })
  bulkUpdateStatus(@Body() bulkUpdateDto: BulkUpdateStatusDto) {
    return this.inquiriesService.bulkUpdateStatus(
      bulkUpdateDto.ids,
      bulkUpdateDto.status,
      bulkUpdateDto.assignedTo,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete inquiry' })
  @ApiResponse({ status: 200, description: 'Inquiry deleted successfully' })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  remove(@Param('id') id: string) {
    return this.inquiriesService.remove(id);
  }
}
