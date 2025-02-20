import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class OnboardingDto {
  @IsEmail()
  @IsOptional()
  @ApiProperty({
    description: 'Email',
    example: 'raflink@example.com',
    required: false,
    title: 'email',
  })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  email: string;
}

export type TokenData = {
  user: Types.ObjectId;
  email: string;
  verified: boolean;
  username?: string;
};
