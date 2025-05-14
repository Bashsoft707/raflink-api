import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Pagination } from '../../../common/dto/pagination.dto';

export class CreateUserDto {
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

export class UserFilterDto extends Pagination {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Name',
    example: 'bash',
    required: false,
    title: 'name',
  })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  name: string;
}
