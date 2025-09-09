import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { SubscriberStatus } from '@prisma/client';

export class SendCampaignDto {
  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false, enum: SubscriberStatus })
  @IsOptional()
  @IsEnum(SubscriberStatus)
  status?: SubscriberStatus;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subscriberIds?: string[];
}
