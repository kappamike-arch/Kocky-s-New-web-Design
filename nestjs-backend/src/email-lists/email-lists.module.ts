import { Module } from '@nestjs/common';
import { EmailListsService } from './email-lists.service';
import { EmailListsController } from './email-lists.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { BullModule } from '@nestjs/bull';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-campaigns',
    }),
    MulterModule.register({
      dest: './uploads',
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [EmailListsController, CampaignsController],
  providers: [EmailListsService, CampaignsService],
  exports: [EmailListsService, CampaignsService],
})
export class EmailListsModule {}