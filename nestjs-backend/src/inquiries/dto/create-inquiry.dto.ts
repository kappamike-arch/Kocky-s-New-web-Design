import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEmail, IsString, IsOptional, IsEnum, MinLength, MaxLength 
} from 'class-validator';
import { Priority } from '@prisma/client';

export class CreateInquiryDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '(555) 123-4567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Catering for Corporate Event' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  subject: string;

  @ApiProperty({ 
    example: 'We are interested in catering services for our annual company party...' 
  })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message: string;

  @ApiProperty({ enum: Priority, default: Priority.MEDIUM, required: false })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({ example: 'website', required: false })
  @IsOptional()
  @IsString()
  source?: string;

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
  assignedTo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
