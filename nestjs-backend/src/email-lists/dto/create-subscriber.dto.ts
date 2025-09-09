import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateSubscriberDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false, example: 'website' })
  @IsOptional()
  @IsString()
  source?: string;
}
