import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class RecordEventDto {
  @ApiProperty({ example: 'session-123abc' })
  @IsString()
  sessionId: string;

  @ApiProperty({ example: 'page_view' })
  @IsString()
  eventType: string;

  @ApiProperty({ example: 'Homepage View' })
  @IsString()
  eventName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ required: false, example: '/menu' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({ required: false, example: 'https://google.com' })
  @IsOptional()
  @IsString()
  referrer?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  eventData?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;
}
