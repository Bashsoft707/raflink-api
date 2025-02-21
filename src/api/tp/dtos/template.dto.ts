import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SOCIAL_LINKS_POSITON, TEMPLATE_LINK_LAYOUT } from '../../../constants';

class AffiliateLink {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Social media platform name',
    example: 'Website',
    required: true,
    title: 'name',
  })
  name: string;

  @IsString()
  @IsOptional()
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

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Template name',
    example: 'popstar',
    required: true,
    title: 'username',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Template background color',
    example: '#fff',
    required: true,
    title: 'backgroundColor',
  })
  backgroundColor: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(SOCIAL_LINKS_POSITON)
  @ApiProperty({
    description: 'Links position',
    example: SOCIAL_LINKS_POSITON.TOP,
    required: true,
    title: 'socialLinksPosition',
  })
  socialLinksPosition: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AffiliateLink)
  @ApiProperty({
    description: 'Array of objects of social links',
    example: [
      {
        name: 'website',
        linkUrl: 'www.raflink.com',
        thumbnail: 'www.raflink.com/images',
        layout: TEMPLATE_LINK_LAYOUT.CLASSIC,
        lockLink: false,
      },
    ],
    required: false,
    title: 'affiliateLinks',
  })
  affiliateLinks: AffiliateLink[];
}

export class CreateUserTemplateDto {
  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Template id',
    example: '67b6c6f202cc89efe1d651tn',
    required: true,
    title: 'templateId',
  })
  templateId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Template name',
    example: 'popstar',
    required: true,
    title: 'name',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Template background color',
    example: '#fff',
    required: true,
    title: 'backgroundColor',
  })
  backgroundColor: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(SOCIAL_LINKS_POSITON)
  @ApiProperty({
    description: 'Links position',
    example: SOCIAL_LINKS_POSITON.TOP,
    required: true,
    title: 'socialLinksPosition',
  })
  socialLinksPosition: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AffiliateLink)
  @ApiProperty({
    description: 'Array of objects of social links',
    example: [
      {
        name: 'website',
        linkUrl: 'www.raflink.com',
        thumbnail: 'www.raflink.com/images',
        layout: TEMPLATE_LINK_LAYOUT.CLASSIC,
        lockLink: false,
      },
    ],
    required: false,
    title: 'affiliateLinks',
  })
  affiliateLinks: AffiliateLink[];
}
