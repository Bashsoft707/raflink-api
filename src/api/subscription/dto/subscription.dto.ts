import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEnum,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';

class Benefit {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Benefit name',
    example: 'benefit1',
    required: true,
    title: 'name',
  })
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Is benefit available',
    example: true,
    required: true,
    title: 'isAvailable',
  })
  isAvailable: boolean;
}

export class CreateSubscriptionPlanDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Plan name',
    example: 'Basic',
    required: true,
    title: 'name',
  })
  name: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Plan price',
    example: 100,
    required: true,
    title: 'price',
  })
  price: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['month', 'year', 'week', 'day'])
  @ApiProperty({
    description: 'Plan duration',
    example: 'monthly',
    required: true,
    title: 'duration',
  })
  duration: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Currency',
    example: 'usd',
    required: false,
    title: 'currency',
  })
  currency: string;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Benefit)
  @ApiProperty({
    description: 'Plan benefits',
    example: [{ name: 'benefit1', isAvailable: true }],
    required: true,
    title: 'benefits',
  })
  benefits: Benefit[];
}

export class UpdateSubscriptionPlanDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Plan name',
    example: 'Basic',
    required: false,
    title: 'name',
  })
  name: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Benefit)
  @ApiProperty({
    description: 'Plan benefits',
    example: [{ name: 'benefit1', isAvailable: true }],
    required: false,
    title: 'benefits',
  })
  benefits: Benefit[];
}

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
    example: '67c38ebc900455d361074a2c',
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
    example: '67c38ebc900455d361074a2c',
    required: true,
    title: 'newPlanId',
  })
  newPlanId: string;
}
