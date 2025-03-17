import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsNotEmpty, IsString } from 'class-validator';

export class UpdateShareCountDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Share count',
    example: 1,
    required: true,
    title: 'shareCount',
  })
  shareCount: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Shared to',
    example: 'instagram',
    required: true,
    title: 'sharedTo',
  })
  sharedTo: string;
}
