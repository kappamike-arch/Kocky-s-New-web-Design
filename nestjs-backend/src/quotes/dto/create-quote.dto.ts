import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, IsNumber, IsOptional, IsArray, IsBoolean, 
  IsDateString, ValidateNested, Min 
} from 'class-validator';
import { Type } from 'class-transformer';

class QuoteItemDto {
  @ApiProperty({ example: 'Catering Service for 50 people' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 500.00 })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateQuoteDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  inquiryId?: string;

  @ApiProperty({ example: '2024-12-31T23:59:59Z' })
  @IsDateString()
  validUntil: string;

  @ApiProperty({ type: [QuoteItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteItemDto)
  items: QuoteItemDto[];

  @ApiProperty({ example: 0.08, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiProperty({ example: 50.00, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiProperty({ default: false, required: false })
  @IsOptional()
  @IsBoolean()
  generatePaymentLink?: boolean;
}
