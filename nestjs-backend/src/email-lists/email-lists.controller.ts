import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Query, 
  UseGuards, UseInterceptors, UploadedFile, HttpCode, HttpStatus,
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, 
  ApiQuery, ApiConsumes, ApiBody 
} from '@nestjs/swagger';
import { EmailListsService } from './email-lists.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { BulkUploadDto } from './dto/bulk-upload.dto';
import { AddRemoveTagsDto } from './dto/add-remove-tags.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole, SubscriberStatus } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Email Lists')
@Controller('api/email-lists')
export class EmailListsController {
  constructor(private readonly emailListsService: EmailListsService) {}

  @Public()
  @Post('subscribe')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  @ApiOperation({ summary: 'Public newsletter subscription' })
  @ApiResponse({ status: 201, description: 'Successfully subscribed' })
  @ApiResponse({ status: 400, description: 'Email already exists' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  subscribe(@Body() createSubscriberDto: CreateSubscriberDto) {
    return this.emailListsService.create(createSubscriberDto);
  }

  @Public()
  @Post('unsubscribe/:email')
  @ApiOperation({ summary: 'Unsubscribe from newsletter' })
  @ApiResponse({ status: 200, description: 'Successfully unsubscribed' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  unsubscribe(@Param('email') email: string, @Query('reason') reason?: string) {
    return this.emailListsService.unsubscribe(email, reason);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add subscriber (internal)' })
  @ApiResponse({ status: 201, description: 'Subscriber added successfully' })
  create(@Body() createSubscriberDto: CreateSubscriberDto) {
    return this.emailListsService.create(createSubscriberDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all subscribers' })
  @ApiQuery({ name: 'status', required: false, enum: SubscriberStatus })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Subscribers retrieved successfully' })
  findAll(@Query() query: any) {
    return this.emailListsService.findAll(query);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get email list statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics() {
    return this.emailListsService.getStatistics();
  }

  @Get('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export subscribers as CSV' })
  @ApiQuery({ name: 'status', required: false, enum: SubscriberStatus })
  @ApiResponse({ status: 200, description: 'Export generated successfully' })
  export(@Query('status') status?: SubscriberStatus) {
    return this.emailListsService.exportSubscribers(status);
  }

  @Post('bulk-upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Bulk upload subscribers from CSV/Excel' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
        },
        source: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Bulk upload completed' })
  @ApiResponse({ status: 400, description: 'Invalid file format' })
  bulkUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body() options?: BulkUploadDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.emailListsService.bulkUpload(file, options);
  }

  @Post('tags/add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add tags to subscribers' })
  @ApiResponse({ status: 200, description: 'Tags added successfully' })
  addTags(@Body() dto: AddRemoveTagsDto) {
    return this.emailListsService.addTags(dto.subscriberIds, dto.tags);
  }

  @Post('tags/remove')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove tags from subscribers' })
  @ApiResponse({ status: 200, description: 'Tags removed successfully' })
  removeTags(@Body() dto: AddRemoveTagsDto) {
    return this.emailListsService.removeTags(dto.subscriberIds, dto.tags);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscriber by ID' })
  @ApiResponse({ status: 200, description: 'Subscriber retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Subscriber not found' })
  findOne(@Param('id') id: string) {
    return this.emailListsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update subscriber' })
  @ApiResponse({ status: 200, description: 'Subscriber updated successfully' })
  @ApiResponse({ status: 404, description: 'Subscriber not found' })
  update(@Param('id') id: string, @Body() updateSubscriberDto: UpdateSubscriberDto) {
    return this.emailListsService.update(id, updateSubscriberDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete subscriber' })
  @ApiResponse({ status: 200, description: 'Subscriber deleted successfully' })
  @ApiResponse({ status: 404, description: 'Subscriber not found' })
  remove(@Param('id') id: string) {
    return this.emailListsService.remove(id);
  }
}
