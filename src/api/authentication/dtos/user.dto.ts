import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';

export class OnboardingDto {
  @IsEmail()
  @ApiProperty({
    description: 'Email',
    example: 'raflink@example.com',
    required: true,
    title: 'email',
  })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  email: string;
}

class SocialLink {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Website',
    example: 'www.raflink.com',
    required: false,
    title: 'website',
  })
  website: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Instagram',
    example: 'www.instagram.com/raff',
    required: false,
    title: 'instagram',
  })
  instagram: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Youtube',
    example: 'www.youtube.com/raff',
    required: false,
    title: 'youtube',
  })
  youtube: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Tiktok',
    example: 'www.tiktok.com/raff',
    required: false,
    title: 'tiktok',
  })
  tiktok: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Whatsapp',
    example: 'https://wa.me/0700000000',
    required: false,
    title: 'whatsapp',
  })
  whatsapp: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Unique username',
    example: 'bash',
    required: false,
    title: 'username',
  })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  username: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'User display name',
    example: 'Raff',
    required: false,
    title: 'displayName',
  })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  displayName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'User bio',
    example: 'I am a software engineer',
    required: false,
    title: 'bio',
  })
  bio: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Image',
    example: 'https://imgg.com',
    required: false,
    title: 'image',
  })
  image: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'User goals',
    example: 'Get rich',
    required: false,
    title: 'goals',
  })
  goals: string;

  @IsObject()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SocialLink)
  @ApiProperty({
    description: 'Object of social links',
    example: {
      instagram: 'www.instagram.com/raff',
      website: 'www.raflink.com',
      tiktok: 'www.tiktok.com/raff',
      whatsapp: 'www.wa.me/0700000000000',
      youtube: 'www.youtube.com/raff',
    },
    required: false,
    title: 'socialLinks',
  })
  socialLinks: SocialLink;
}

export type TokenData = {
  user: Types.ObjectId;
  email: string;
  verified: boolean;
  username?: string;
};
