import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateMerchantDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Name of business',
    example: 'My Goods',
    required: true,
    title: 'businessName',
  })
  businessName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The country the business is located',
    example: 'Nigeria',
    required: true,
    title: 'country',
  })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  country: string;

  @IsNotEmpty()
  @IsString()
  // @IsPhoneNumber()
  @ApiProperty({
    description: 'Business phone number',
    example: '+23481245678',
    required: true,
    title: 'contactInfo',
  })
  contactInfo: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Category of business',
    example: 'I have a website and i have an affiliate program',
    required: true,
    title: 'businessCategory',
  })
  businessCategory: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The url of the website',
    example: 'www.getrichfast.com',
    required: false,
    title: 'websiteUrl',
  })
  websiteUrl: string;

  @IsBoolean()
  @ApiProperty({
    description: 'To notified if the user is verified or not',
    example: 'true',
    required: false,
    title: 'verified',
  })
  verified: boolean;
}

export type TokenData = {
  user: Types.ObjectId;
  email: string;
  verified: boolean;
  username?: string;
};
