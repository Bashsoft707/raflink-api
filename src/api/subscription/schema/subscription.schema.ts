import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../authentication/schema/';
import { SubscriptionPlan } from './subscriptionPlan.schema';
import { SubscriptionStatus } from '../../../constants';

@Schema({ timestamps: true })
export class Subscription extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true })
  stripeCustomerId: string;

  @Prop({ required: true })
  stripeSubscriptionId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true,
  })
  plan: SubscriptionPlan;

  @Prop({ type: String, required: true })
  paymentMethodId: string;

  @Prop({
    required: true,
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: string;

  @Prop()
  currentPeriodStart: Date;

  @Prop()
  currentPeriodEnd: Date;

  @Prop({ default: false })
  cancelAtPeriodEnd: boolean;

  @Prop()
  canceledAt: Date;

  @Prop()
  trialStart: Date;

  @Prop()
  trialEnd: Date;

  @Prop({ type: String })
  coupon: string;

  @Prop({ type: Number, required: true })
  amountPaid: number;

  @Prop({ type: String })
  cardLastFourDigit: string;

  @Prop({ type: String })
  cardType: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ type: String })
  invoiceUrl: string;

  @Prop({ type: String })
  receiptPdf: string;
}

export type SubscriptionDocument = Subscription & Document;
export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
