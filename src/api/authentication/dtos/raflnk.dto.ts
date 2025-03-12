import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateStaffDto {
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
    example: 'egbon',
    required: true,
    title: 'username',
  })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  username: string;

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

// export type TokenData = {
//   user: Types.ObjectId;
//   email: string;
//   verified: boolean;
//   username?: string;
// };
