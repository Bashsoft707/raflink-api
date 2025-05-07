import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsPositive,
  IsObject,
  IsBoolean,
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
    required: false,
    title: 'thumbnail',
  })
  thumbnail: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiProperty({
    description: 'Social media followers count',
    example: 5,
    required: false,
    title: 'smFollowersCount',
  })
  followersCount: number;
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
        followersCount: 5,
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

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Template Image',
    example: 'https://imgg.com',
    required: false,
    title: 'templateImage',
  })
  templateImage: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Template background color',
    example: '#FFF',
    required: false,
    title: 'templateBackground',
  })
  templateBackground: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: 'Hide logo',
    example: false,
    required: false,
    title: 'hidLogo',
  })
  hideLogo: boolean;
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

export class UpdateViewTimeDto {
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

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({
    description: 'View time on user profile',
    example: 10,
    required: true,
    title: 'viewTime',
  })
  viewTime: number;
}

export class VerifyTwoFactorDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Token',
    example: '204509',
    required: true,
    title: 'token',
  })
  token: string;
}

export class UserDetailsDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
    required: true,
    title: 'First Name',
  })
  @Transform(({ value }) => String(value).trim())
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
    required: true,
    title: 'Last Name',
  })
  @Transform(({ value }) => String(value).trim())
  lastName: string;

  @IsEmail()
  @ApiProperty({
    description: 'Email address of the user',
    example: 'raflink@example.com',
    required: true,
    title: 'Email',
  })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  email: string;

  @IsString()
  @ApiProperty({
    description: 'Phone number of the user',
    example: '+2349038275617',
    required: true,
    title: 'Phone Number',
  })
  phone: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'User address',
    example: '123 Street Name, City, Country',
    required: false,
    title: 'Address',
  })
  address1: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'City of residence',
    example: 'Lagos',
    required: false,
    title: 'City',
  })
  city: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'State or Province of residence',
    example: 'Lagos State',
    required: false,
    title: 'State',
  })
  state: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Postal code or ZIP code of the user',
    example: '23401',
    required: false,
    title: 'Zip Code',
  })
  zip: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Country of residence',
    example: 'Nigeria',
    required: false,
    title: 'Country',
  })
  country: string;
}
