import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsDateString } from 'class-validator';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Summer Sale Campaign' })
  @IsString()
  name: string;

  @ApiProperty({ example: '🌞 Summer Sale - 50% Off Everything!' })
  @IsString()
  subject: string;

  @ApiProperty({ example: '<html><body><h1>Summer Sale!</h1>...</body></html>' })
  @IsString()
  content: string;

  @ApiProperty({ example: "Kocky's Bar & Grill" })
  @IsString()
  fromName: string;

  @ApiProperty({ example: 'newsletter@kockysbar.com' })
  @IsEmail()
  fromEmail: string;

  @ApiProperty({ example: 'info@kockysbar.com', required: false })
  @IsOptional()
  @IsEmail()
  replyTo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
