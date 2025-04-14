import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsObject,
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
    title: 'name',
  })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Background Image',
    example: 'https://imgg.com/background',
    required: false,
    title: 'backgroundImage',
  })
  backgroundImage: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Background Color',
    example: '#FFFFFF',
    required: false,
    title: 'backgroundColor',
  })
  backgroundColor: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Text Color',
    example: '#000000',
    required: false,
    title: 'textColor',
  })
  textColor: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Subtitle Color',
    example: '#FEFEFE',
    required: false,
    title: 'subtitleColor',
  })
  subtitleColor: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Container Color',
    example: '#FAFAFA',
    required: false,
    title: 'containerColor',
  })
  containerColor: string;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Template styles',
    example: '{}',
    required: false,
    title: 'templateStyle',
  })
  templateStyle: Object;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Socual Links styles',
    example: '{}',
    required: false,
    title: 'socialLinksStyle',
  })
  socialLinksStyle: Object;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Link Styles',
    example: '{}',
    required: false,
    title: 'linkStyle',
  })
  linkStyle: Object;

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

  // @IsString()
  // @IsOptional()
  // @ApiProperty({
  //   description: 'Template name',
  //   example: 'popstar',
  //   required: false,
  //   title: 'name',
  // })
  // name: string;

  // @IsString()
  // @IsOptional()
  // @ApiProperty({
  //   description: 'Background Image',
  //   example: 'https://imgg.com/background',
  //   required: false,
  //   title: 'backgroundImage',
  // })
  // backgroundImage: string;

  // @IsString()
  // @IsOptional()
  // @ApiProperty({
  //   description: 'Background Color',
  //   example: '#FFFFFF',
  //   required: false,
  //   title: 'backgroundColor',
  // })
  // backgroundColor: string;

  // @IsString()
  // @IsOptional()
  // @ApiProperty({
  //   description: 'Text Color',
  //   example: '#000000',
  //   required: false,
  //   title: 'textColor',
  // })
  // textColor: string;

  // @IsString()
  // @IsOptional()
  // @ApiProperty({
  //   description: 'Subtitle Color',
  //   example: '#FEFEFE',
  //   required: false,
  //   title: 'subtitleColor',
  // })
  // subtitleColor: string;

  // @IsString()
  // @IsOptional()
  // @ApiProperty({
  //   description: 'Container Color',
  //   example: '#FAFAFA',
  //   required: false,
  //   title: 'containerColor',
  // })
  // containerColor: string;

  // @IsObject()
  // @IsOptional()
  // @ApiProperty({
  //   description: 'Template styles',
  //   example: '{}',
  //   required: false,
  //   title: 'templateStyle',
  // })
  // templateStyle: Object;

  // @IsObject()
  // @IsOptional()
  // @ApiProperty({
  //   description: 'Socual Links styles',
  //   example: '{}',
  //   required: false,
  //   title: 'socialLinksStyle',
  // })
  // socialLinksStyle: Object;

  // @IsObject()
  // @IsOptional()
  // @ApiProperty({
  //   description: 'Link Styles',
  //   example: '{}',
  //   required: false,
  //   title: 'linkStyle',
  // })
  // linkStyle: Object;

  // @IsString()
  // @IsNotEmpty()
  // @IsEnum(SOCIAL_LINKS_POSITON)
  // @ApiProperty({
  //   description: 'Links position',
  //   example: SOCIAL_LINKS_POSITON.TOP,
  //   required: true,
  //   title: 'socialLinksPosition',
  // })
  // socialLinksPosition: string;
}

export class UpdateTemplateDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Template name',
    example: 'popstar',
    required: false,
    title: 'name',
  })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Background Image',
    example: 'https://imgg.com/background',
    required: false,
    title: 'backgroundImage',
  })
  backgroundImage: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Background Color',
    example: '#FFFFFF',
    required: false,
    title: 'backgroundColor',
  })
  backgroundColor: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Text Color',
    example: '#000000',
    required: false,
    title: 'textColor',
  })
  textColor: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Subtitle Color',
    example: '#FEFEFE',
    required: false,
    title: 'subtitleColor',
  })
  subtitleColor: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Container Color',
    example: '#FAFAFA',
    required: false,
    title: 'containerColor',
  })
  containerColor: string;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Template styles',
    example: '{}',
    required: false,
    title: 'templateStyle',
  })
  templateStyle: Object;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Socual Links styles',
    example: '{}',
    required: false,
    title: 'socialLinksStyle',
  })
  socialLinksStyle: Object;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Link Styles',
    example: '{}',
    required: false,
    title: 'linkStyle',
  })
  linkStyle: Object;

  @IsString()
  @IsOptional()
  @IsEnum(SOCIAL_LINKS_POSITON)
  @ApiProperty({
    description: 'Links position',
    example: SOCIAL_LINKS_POSITON.TOP,
    required: false,
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

export class UpdateUserTemplateDto extends UpdateTemplateDto {
  @IsString()
  @IsOptional()
  @IsEnum(SOCIAL_LINKS_POSITON)
  @ApiProperty({
    description: 'Links position',
    example: SOCIAL_LINKS_POSITON.TOP,
    required: false,
    title: 'socialLinksPosition',
  })
  socialLinksPosition: string;
}
