import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { QuotesModule } from './quotes/quotes.module';
import { MenuModule } from './menu/menu.module';
import { PagesModule } from './pages/pages.module';
import { EmailListsModule } from './email-lists/email-lists.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.THROTTLE_TTL || '60', 10) * 1000,
      limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
    }]),

    // Job scheduling
    ScheduleModule.forRoot(),

    // Queue management (for email sending, etc.)
    BullModule.forRoot({
      redis: process.env.REDIS_URL || 'redis://localhost:6379',
    }),

    // Core modules
    PrismaModule,
    CommonModule,
    
    // Feature modules
    AuthModule,
    UsersModule,
    CustomersModule,
    InquiriesModule,
    QuotesModule,
    MenuModule,
    PagesModule,
    EmailListsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}