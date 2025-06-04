import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsPositive,
  IsDateString,
  IsObject,
  Min,
  IsMongoId,
} from 'class-validator';
import { TEMPLATE_LINK_LAYOUT } from '../../../constants';
import { Transform } from 'class-transformer';

export class CreateUserLinkDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Social media platform name',
    example: 'Website',
    required: true,
    title: 'name',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Link url',
    example: 'www.instagram.com/raff',
    required: true,
    title: 'linkUrl',
  })
  linkUrl: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Thumbnail url',
    example: 'www.youtube.com/raff/images',
    required: true,
    title: 'thumbnail',
  })
  thumbnail: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(TEMPLATE_LINK_LAYOUT)
  @ApiProperty({
    description: 'Links layout',
    example: TEMPLATE_LINK_LAYOUT.CLASSIC,
    required: true,
    title: 'layout',
  })
  layout: string;

  @IsBoolean()
  @ApiProperty({
    description: 'Lock link',
    example: false,
    default: false,
    required: true,
    title: 'lockLink',
  })
  lockLink: boolean;

  @IsMongoId()
  @IsOptional()
  @ApiProperty({
    description: 'Link category',
    example: '67b6c6f202cc89efe1d651tn',
    required: false,
    title: 'category',
  })
  category: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiProperty({
    description: 'Cuts',
    example: 2,
    required: false,
    title: 'cuts',
  })
  cuts: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Discount type',
    example: 'amount',
    required: false,
    title: 'discountType',
  })
  discountType: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiProperty({
    description: 'Affiliate earnings',
    example: 50,
    required: false,
    title: 'affiliateEarnings',
  })
  affiliateEarnings: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiProperty({
    description: 'Discount amount',
    example: 10,
    required: false,
    title: 'discountAmount',
  })
  discountAmount: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Earning type',
    example: 'Affiliates',
    required: false,
    title: 'earningType',
  })
  earningType: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Offer id',
    example: '68305ee40080eb004b296957',
    required: false,
    title: 'offerId',
  })
  offerId: string;
}

export class UpdateUserLinkDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Social media platform name',
    example: 'Website',
    required: false,
    title: 'name',
  })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Link url',
    example: 'www.instagram.com/raff',
    required: false,
    title: 'linkUrl',
  })
  linkUrl: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Thumbnail url',
    example: 'www.youtube.com/raff/images',
    required: false,
    title: 'thumbnail',
  })
  thumbnail: string;

  @IsString()
  @IsOptional()
  @IsEnum(TEMPLATE_LINK_LAYOUT)
  @ApiProperty({
    description: 'Links layout',
    example: TEMPLATE_LINK_LAYOUT.CLASSIC,
    required: false,
    title: 'layout',
  })
  layout: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: 'Lock link',
    example: false,
    default: false,
    required: false,
    title: 'lockLink',
  })
  lockLink: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiProperty({
    description: 'Link index',
    example: 5,
    required: false,
    title: 'linkIndex',
  })
  linkIndex: number;

  @IsMongoId()
  @IsOptional()
  @ApiProperty({
    description: 'Link category',
    example: '67b6c6f202cc89efe1d651tn',
    required: false,
    title: 'category',
  })
  category: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiProperty({
    description: 'Cuts',
    example: 2,
    required: false,
    title: 'cuts',
  })
  cuts: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Discount type',
    example: 'amount',
    required: false,
    title: 'discountType',
  })
  discountType: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiProperty({
    description: 'Affiliate earnings',
    example: 50,
    required: false,
    title: 'affiliateEarnings',
  })
  affiliateEarnings: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiProperty({
    description: 'Discount amount',
    example: 10,
    required: false,
    title: 'discountAmount',
  })
  discountAmount: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Earning type',
    example: 'Affiliates',
    required: false,
    title: 'earningType',
  })
  earningType: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Offer id',
    example: '68305ee40080eb004b296957',
    required: false,
    title: 'offerId',
  })
  offerId: string;
}

export class UpdateLinkViewTimeDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({
    description: 'View time',
    example: 5,
    required: true,
    title: 'viewTime',
  })
  viewTime: number;
}

export class GraphFilterDto {
  @ApiProperty({
    description: 'startDate',
    example: '2024-08-01',
    title: 'startDate',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate: string;

  @ApiProperty({
    description: 'endDate',
    example: '2024-08-01',
    title: 'endDate',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate: string;
}

export class UpdateClickCountDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'User ip address',
    example: '89.112.0',
    required: false,
    title: 'ipAddress',
  })
  ipAddress: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Link url',
    example: 'www.instagram.com/raff',
    required: false,
    title: 'referrer',
  })
  referrer: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Device type',
    example: 'Mobile',
    required: false,
    title: 'deviceType',
  })
  deviceType: string;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Geolocation',
    example: { country: 'Nigeria', city: 'Lagos' },
    required: false,
    title: 'geoLocation',
  })
  geoLocation: {
    country?: string;
    city?: string;
  };
}

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Category name',
    example: 'Amazon products',
    required: true,
    title: 'categoryName',
  })
  categoryName: string;
}

export class TrackerDto {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  @ApiProperty({
    description: 'Sales amount',
    example: 500,
    required: true,
    title: 'amount',
  })
  amount: number;

  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Affiliate id',
    example: '67b6c6f202cc89efe1d651tn',
    required: true,
    title: 'affiliate_id',
  })
  affiliate_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Order Id',
    example: 'ORD-123456',
    required: true,
    title: 'order_id',
  })
  order_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Vendor Id',
    example: '67b6c6f202cc89efe1d651gw',
    required: true,
    title: 'vendor_id',
  })
  vendor_id: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Offer id',
    example: '68305ee40080eb004b296957',
    required: false,
    title: 'offer_id',
  })
  offer_id: string;
}
