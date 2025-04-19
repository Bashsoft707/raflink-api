// notification.dto.ts
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Pagination } from 'src/common/dto/pagination.dto';

export class UpdateNotificationDto {
  @ApiProperty({
    description: 'Enable/disable earning updates',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  earningUpdate?: boolean;

  @ApiProperty({
    description: 'Enable/disable performance notifications',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  performance?: boolean;

  @ApiProperty({
    description: 'Enable/disable brand opportunities notifications',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  brandOpportunities?: boolean;

  @ApiProperty({
    description: 'Enable/disable announcements',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  announcements?: boolean;

  @ApiProperty({
    description: 'Enable/disable collaboration requests',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  collaborationRequest?: boolean;

  @ApiProperty({
    description: 'Enable/disable payment updates',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  paymentUpdates?: boolean;
}

export class NotificationFilterDTO extends Pagination {
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
