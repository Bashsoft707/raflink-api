import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { RegisterDto } from './auth.dto';

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

export class OtpDto extends PickType(RegisterDto, ['email'] as const) {
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
