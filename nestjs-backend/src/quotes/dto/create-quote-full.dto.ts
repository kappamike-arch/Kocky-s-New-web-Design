import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsArray, 
  IsBoolean, 
  IsDateString, 
  ValidateNested,
  IsEnum,
  Min
} from 'class-validator';

export class QuoteItemDto {
  @ApiProperty({ example: 'Grilled Chicken Platter' })
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 25.99 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;
}

export class QuotePackageDto {
  @ApiProperty({ example: 'Premium Bar Package' })
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  @IsArray()
  items: any[];

  @ApiProperty({ example: 500.00 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;
}

export class QuoteLaborDto {
  @ApiProperty({ example: 'Bartender Service' })
  @IsString()
  description: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  hours: number;

  @ApiProperty({ example: 30.00 })
  @IsNumber()
  @Min(0)
  rate: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  staffName?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;
}

export enum DiscountType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

export class CreateQuoteFullDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  inquiryId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ example: 'Food Truck Service - Smith Wedding' })
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  eventLocation?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  guestCount?: number;

  @ApiProperty({ type: [QuoteItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteItemDto)
  items: QuoteItemDto[];

  @ApiProperty({ type: [QuotePackageDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotePackageDto)
  packages?: QuotePackageDto[];

  @ApiProperty({ type: [QuoteLaborDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteLaborDto)
  laborItems?: QuoteLaborDto[];

  @ApiProperty({ required: false, example: 8.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiProperty({ required: false, example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiProperty({ required: false, enum: DiscountType })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiProperty({ required: false, example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  validityDays?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  generatePaymentLink?: boolean;
}
