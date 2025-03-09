import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

interface Benefit {
  name: string;
  isAvailable: boolean;
}

@Schema({ timestamps: true })
export class SubscriptionPlan {
  @Prop({ type: String, required: true })
  priceId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ type: Number, default: 0 })
  oldPrice: number;

  @Prop([Object])
  benefits: Benefit[];

  @Prop({
    type: String,
    required: true,
    enum: ['month', 'year', 'week', 'day'],
  })
  duration: string;

  @Prop({ type: String, required: true })
  currency: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export type SubscriptionPlanDocument = SubscriptionPlan & Document;
export const SubscriptionPlanSchema =
  SchemaFactory.createForClass(SubscriptionPlan);
