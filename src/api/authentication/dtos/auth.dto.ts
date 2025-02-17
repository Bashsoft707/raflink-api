import { ApiProperty, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsAlpha,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Auth } from '../schema';
import { Types } from 'mongoose';
import { HttpStatus } from '@nestjs/common';

export class RegisterDto {
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

  @IsString()
  @MaxLength(20)
  @ApiProperty({
    description: 'Password',
    example: 'haJhsjk@#4jaiijsk',
    required: false,
    title: 'password',
  })
  @MinLength(7, {
    message: 'Password must be greater than 7 characters',
  })
  @Matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@<>%()&|#$+&*~_.,?;:/^^\\-]).{8,}$/,
    {
      message:
        'Password must be at least one uppercase, lowercase, number and special character',
    },
  )
  @IsOptional()
  @ValidateIf((o: RegisterDto) => {
    return typeof o.password !== undefined;
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Username',
    example: 'bash',
    required: true,
    title: 'username',
  })
  @IsAlpha()
  username: string;

  // @IsString()
  // @IsNotEmpty()
  // @ApiProperty({
  //   description: 'Last Name',
  //   example: 'dubaril',
  //   required: true,
  //   title: 'lastName',
  // })
  // @Transform(
  //   ({ value }) =>
  //     String(value).trim().charAt(0).toUpperCase() +
  //     value.substring(1).toLowerCase(),
  // )
  // @IsAlpha()
  // lastName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'otp',
    example: '1234',
    required: true,
    title: 'otp',
  })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  otp: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'referral code',
    example: 'FDGJRY',
    required: false,
    title: 'referralCode',
  })
  @Transform(({ value }) => String(value).trim().toUpperCase())
  referralCode: string;
}

export class ResetPasswordDTO {
  @IsString()
  @ApiProperty({
    description: 'otp',
    example: '055363',
    required: true,
    title: 'otp',
  })
  otp: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @ApiProperty({
    description: 'New Password',
    example: 'Password',
    required: true,
    title: 'newPassword',
  })
  newPassword: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Email or Phone Number',
    example: 'raflink@example.com',
    required: true,
    title: 'email',
  })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  identifier: string;
}

export class VerifyOtpDTO extends PickType(ResetPasswordDTO, [
  'identifier',
] as const) {
  @IsString()
  @ApiProperty({
    description: 'otp',
    example: '055363',
    required: true,
    title: 'otp',
  })
  otp: string;
}

export class ChangePasswordDTO extends PickType(ResetPasswordDTO, [
  'otp',
  'newPassword',
] as const) {
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @ApiProperty({
    description: 'New Password',
    example: 'Password',
    required: true,
    title: 'newPassword',
  })
  oldPassword: string;
}

export type TokenData = {
  user: Types.ObjectId;
  email: string;
  verified: boolean;
  username: string;
};

export class AuthResponse {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: HttpStatus.CREATED })
  statusCode: HttpStatus;

  @ApiProperty({ example: 'User Registration Successful' })
  message: string;

  @ApiProperty({
    example: {
      userId: '644ec4999b38b22e9d7be8a5',
      accountNumber: '7031000099',
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNjQ0ZWM0OTk5YjM4',
      refreshToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNjQ0ZWM0OTk5YjM4Y',
    },
  })
  data: {
    userId: Auth;
    accountNumber: string;
    accessToken: string;
    refreshToken: string;
  };

  @ApiProperty({ example: null })
  error: Record<string, any> | string;
}

export class BadRequestResponse {
  @ApiProperty({ example: 'fail' })
  status: string;

  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  statusCode: HttpStatus;

  @ApiProperty({ example: 'Email or Phone number already exist' })
  message: string;

  @ApiProperty({
    example: null,
  })
  data: {
    userId: Auth;
    accountNumber: string;
    accessToken: string;
    refreshToken: string;
  };

  @ApiProperty({ example: 'Bad Request' })
  error: Record<string, any> | string;
}
