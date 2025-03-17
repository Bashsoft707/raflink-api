import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  // IsBoolean,
  // IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  // IsNumber,
  // IsPositive,
  // IsDateString,
  // IsObject,
  IsArray,
  IsUrl,
  IsObject,
  IsDateString,
  ValidateNested,
} from 'class-validator';

export class DurationDto {
  @IsOptional()
  @IsString()
  @IsDateString(
    {},
    { message: 'startDate must be a valid date string (YYYY-MM-DD)' },
  )
  startDate: string;

  @IsOptional()
  @IsString()
  @IsDateString(
    {},
    { message: 'endDate must be a valid date string (YYYY-MM-DD)' },
  )
  endDate: string;

  @IsNotEmpty()
  @IsString()
  durationName: string;
}

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of the offer',
    example: 'Exclusive 70% off Mobbin Pro',
    required: true,
    title: 'name',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The description of the offer',
    example: 'Help researchers and designers level up their workflow......',
    required: true,
    title: 'description',
  })
  description: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Image',
    example: 'https://image.com',
    required: false,
    title: 'image',
  })
  image: string;

  @IsNotEmpty()
  @IsUrl()
  @ApiProperty({
    description: 'The url to the affiliate program landing page',
    example: 'https://mobbin.com/pricing',
    required: true,
    title: 'Url',
  })
  url: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The type of discount',
    example: 'Percentage Discount',
    required: true,
    title: 'discountType',
  })
  discountType: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The percentage amount the user gets as discount',
    example: '70% off',
    required: true,
    title: 'discountAmount',
  })
  discountAmount: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Who can access the offer',
    example: 'New Users',
    required: true,
    title: 'eligibity',
  })
  eligibity: string;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => DurationDto)
  @ApiProperty({
    description: 'The duration during which the offer will be available',
    example: {
      startDate: '2025-02-26',
      endDate: '2025-03-03',
      durationName: '1 week',
    },
    required: true,
  })
  duration: DurationDto;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The amount the user gets to each click of the link',
    example: '0.2',
    required: true,
    title: 'payoutPerClick',
  })
  payoutPerClick: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Description on how the influencer should go about the offer',
    example: 'Click on the link, ......',
    required: true,
    title: 'instructions',
  })
  instructions: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description:
      'The amount the user gets for each conversion like signup or purchase',
    example: '0.2',
    required: true,
    title: 'payoutPerConversion',
  })
  payoutPerConversion: string;

  @IsNotEmpty()
  @IsArray()
  //   @IsString()
  @ApiProperty({
    description: 'The audience being targetted',
    example: ['Designers', 'Developers', 'Product managers'],
    required: true,
    title: 'targetAudience',
  })
  targetAudience: string[];
}
