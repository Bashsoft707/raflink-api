import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Offer {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
  })
  merchantId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, lowercase: true, required: true })
  name: string;

  @Prop({ type: String, required: true, lowercase: true })
  description: string;

  @Prop({ type: String, lowercase: true })
  image: string;

  @Prop({ type: String, required: true })
  url: string;

  @Prop({ type: String, required: true })
  discountType: string;

  @Prop({ type: String, required: true })
  discountAmount: string;

  @Prop({ type: String, required: true })
  eligibity: string;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ type: String, required: true })
  payoutPerClick: string;

  @Prop({ type: String, required: true })
  payoutPerConversion: string;

  @Prop({ type: [String] })
  targetAudience: string[];

  @Prop({ type: Boolean, default: false })
  verified: boolean;

  @Prop({ type: Number, default: 0 })
  percentageCut: number;

  @Prop({ type: Number, default: 0 })
  discount: number;
}

export type OfferDocument = Offer & Document<Types.ObjectId>;
export const OfferSchema = SchemaFactory.createForClass(Offer);
