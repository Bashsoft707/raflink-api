import { IsString, IsOptional } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  paymentMethodId: string;

  @IsString()
  planId: string;

  @IsString()
  @IsOptional()
  coupon?: string;
}

export class UpdateSubscriptionDto {
  @IsString()
  newPlanId: string;
}
