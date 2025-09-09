import { PartialType } from '@nestjs/swagger';
import { CreateSubscriberDto } from './create-subscriber.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { SubscriberStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSubscriberDto extends PartialType(CreateSubscriberDto) {
  @ApiProperty({ enum: SubscriberStatus, required: false })
  @IsOptional()
  @IsEnum(SubscriberStatus)
  status?: SubscriberStatus;
}
