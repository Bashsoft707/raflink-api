import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
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
    required: false,
    title: 'thumbnail',
  })
  thumbnail: string;
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

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SocialLink)
  @ApiProperty({
    description: 'Array of objects of social links',
    example: [
      {
        name: 'website',
        linkUrl: 'www.raflink.com',
        thumbnail: 'www.raflink.com/images',
      },
    ],
    required: false,
    title: 'affiliateLinks',
  })
  socialLinks: SocialLink[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({
    description: 'User promoted content',
    example: ['Travel', 'Gaming'],
    required: false,
    title: 'promotedContent',
  })
  promotedContent: string[];
}

export type TokenData = {
  user: Types.ObjectId;
  email: string;
  verified: boolean;
  username?: string;
};

export class VerifyUsernameDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Username',
    example: 'raff',
    required: true,
    title: 'username',
  })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  username: string;
}
