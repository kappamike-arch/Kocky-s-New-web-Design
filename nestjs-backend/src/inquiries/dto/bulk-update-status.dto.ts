import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { InquiryStatus } from '@prisma/client';

export class BulkUpdateStatusDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  ids: string[];

  @ApiProperty({ enum: InquiryStatus })
  @IsEnum(InquiryStatus)
  status: InquiryStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assignedTo?: string;
}
