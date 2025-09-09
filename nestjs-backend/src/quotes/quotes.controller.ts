import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards 
} from '@nestjs/common';
import { 
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery 
} from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { CreateQuoteFullDto } from './dto/create-quote-full.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, QuoteStatus } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Quotes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Create a new quote' })
  @ApiResponse({ status: 201, description: 'Quote created successfully' })
  create(
    @Body() createQuoteDto: CreateQuoteDto,
    @CurrentUser() user: any,
  ) {
    return this.quotesService.create({
      ...createQuoteDto,
      userId: user.id,
    });
  }

  @Post('full')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Create a full quote with items, packages, and labor' })
  @ApiResponse({ status: 201, description: 'Full quote created successfully' })
  createFull(
    @Body() createQuoteDto: CreateQuoteFullDto,
    @CurrentUser() user: any,
  ) {
    return this.quotesService.createFullQuote(createQuoteDto, user?.id);
  }

  @Post('webhook/stripe')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  handleStripeWebhook(@Body() event: any) {
    return this.quotesService.handleStripeWebhook(event);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Get all quotes' })
  @ApiQuery({ name: 'status', required: false, enum: QuoteStatus })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Quotes retrieved successfully' })
  findAll(@Query() query: any) {
    return this.quotesService.findAll(query);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get quote statistics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.quotesService.getStatistics(
      startDate && endDate ? { startDate, endDate } : undefined,
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Get quote by ID' })
  @ApiResponse({ status: 200, description: 'Quote retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(id);
  }

  @Get('number/:quoteNumber')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Get quote by quote number' })
  @ApiResponse({ status: 200, description: 'Quote retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  findByQuoteNumber(@Param('quoteNumber') quoteNumber: string) {
    return this.quotesService.findByQuoteNumber(quoteNumber);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Update quote' })
  @ApiResponse({ status: 200, description: 'Quote updated successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  update(
    @Param('id') id: string,
    @Body() updateQuoteDto: UpdateQuoteDto,
  ) {
    return this.quotesService.update(id, updateQuoteDto);
  }

  @Post(':id/send-email')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Send quote via email with payment link' })
  @ApiResponse({ status: 200, description: 'Quote sent successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  sendEmail(
    @Param('id') id: string,
    @Body('email') email?: string,
  ) {
    return this.quotesService.sendQuoteEmailWithPayment(id, email);
  }

  @Post(':id/payment-link')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Generate Stripe payment link' })
  @ApiResponse({ status: 200, description: 'Payment link generated' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  generatePaymentLink(@Param('id') id: string) {
    return this.quotesService.generatePaymentLink(id);
  }

  @Post(':id/accept')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Mark quote as accepted' })
  @ApiResponse({ status: 200, description: 'Quote marked as accepted' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  markAsAccepted(@Param('id') id: string) {
    return this.quotesService.markAsAccepted(id);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Mark quote as rejected' })
  @ApiResponse({ status: 200, description: 'Quote marked as rejected' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  markAsRejected(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.quotesService.markAsRejected(id, reason);
  }

  @Post(':id/duplicate')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Duplicate quote' })
  @ApiResponse({ status: 201, description: 'Quote duplicated successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  duplicate(@Param('id') id: string) {
    return this.quotesService.duplicate(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete quote' })
  @ApiResponse({ status: 200, description: 'Quote deleted successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  remove(@Param('id') id: string) {
    return this.quotesService.remove(id);
  }
}
