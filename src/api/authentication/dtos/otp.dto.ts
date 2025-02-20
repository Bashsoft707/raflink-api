import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { OnboardingDto } from './user.dto';
export class ValidateOtpDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'otp',
    example: '1234',
    required: true,
    title: 'otp',
  })
  otp: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Email',
    example: 'raflink@co.ng',
    required: true,
    title: 'email',
  })
  email: string;
}

export class OtpDto extends PickType(OnboardingDto, ['email'] as const) {
  @IsEmail()
  @IsOptional()
  @ApiProperty({
    description: 'Email',
    example: 'raflink@example.com',
    required: false,
    title: 'email',
  })
  email: string;
}
