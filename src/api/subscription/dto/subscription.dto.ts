import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Stripe payment method id',
    example: 'pm_1J4C2z2eZvKYlo2C3LsZc8rF',
    required: true,
    title: 'paymentMethodId',
  })
  paymentMethodId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Stripe plan id',
    example: 'price_1J4C2z2eZvKYlo2C3LsZc8rF',
    required: true,
    title: 'planId',
  })
  planId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Stripe coupon id',
    example: 'coupon_1J4C2z2eZvKYlo2C3LsZc8rF',
    required: false,
    title: 'coupon',
  })
  coupon?: string;
}

export class UpdateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Stripe subscription id',
    example: 'sub_1J4C2z2eZvKYlo2C3LsZc8rF',
    required: true,
    title: 'newPlanId',
  })
  newPlanId: string;
}
