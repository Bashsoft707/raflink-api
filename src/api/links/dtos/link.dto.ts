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
} from 'class-validator';
import { TEMPLATE_LINK_LAYOUT } from '../../../constants';

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
