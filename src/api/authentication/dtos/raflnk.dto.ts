import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateStaffDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The name of the user',
    example: 'Samuel Jimoh',
    required: true,
    title: 'fullName',
  })
  fullName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'unique username for the user',
    example: 'samuel@gmail.com',
    required: true,
    title: 'email',
  })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  email: string;

  // @IsNotEmpty()
  // @IsString()
  // @ApiProperty({
  //   description: 'unique username for the user',
  //   example: 'egbon',
  //   required: true,
  //   title: 'username',
  // })
  // @Transform(({ value }) => String(value).toLowerCase().trim())
  // username: string;

  @IsNotEmpty()
  @IsString()
  // @IsPhoneNumber()
  @ApiProperty({
    description: 'Business phone number',
    example: '+23481245678',
    required: true,
    title: 'contactInfo',
  })
  contactInfo: string;
}

export class StaffLoginDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'unique username for the user',
    example: 'samuel@gmail.com',
    required: true,
    title: 'email',
  })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  email: string;

  // @IsNotEmpty()
  // @IsString()
  // @ApiProperty({
  //   description: 'unique username for the user',
  //   example: 'egbon',
  //   required: true,
  //   title: 'username',
  // })
  // @Transform(({ value }) => String(value).toLowerCase().trim())
  // username: string;

  @IsNotEmpty()
  @IsString()
  // @IsPhoneNumber()
  @ApiProperty({
    description: 'the user password',
    example: 'Lycanthrope_10',
    required: true,
    title: 'password',
  })
  password: string;
}

// export type TokenData = {
//   user: Types.ObjectId;
//   email: string;
//   verified: boolean;
//   username?: string;
// };
