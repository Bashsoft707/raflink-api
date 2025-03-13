import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { Pagination } from '../../../common/dto/pagination.dto';

export class TransactionFilterDTO extends Pagination {
  @ApiProperty({
    description: 'Transaction type',
    example: 'subscription',
    required: false,
    title: 'transactionType',
  })
  @IsString()
  @IsOptional()
  transactionType: string;

  @ApiProperty({
    description: 'Transaction Status',
    example: 'PENDING',
    title: 'status',
    required: false,
  })
  @IsString()
  @IsOptional()
  status: string;

  @ApiProperty({
    description: 'startDate',
    example: '2024-08-01',
    title: 'startDate',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate: string;

  @ApiProperty({
    description: 'endDate',
    example: '2024-08-01',
    title: 'endDate',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate: string;
}
