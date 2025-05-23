import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { TEMPLATE_LINK_LAYOUT } from '../../../constants';

@Schema({
  timestamps: true,
})
export class Link {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Offer' })
  offerId: string;

  @Prop({
    required: true,
    enum: TEMPLATE_LINK_LAYOUT,
    default: TEMPLATE_LINK_LAYOUT.CLASSIC,
  })
  layout: string;

  @Prop({ lowercase: true, required: true })
  name: string;

  @Prop({ type: String, required: true, lowercase: true })
  linkUrl: string;

  @Prop({ type: String, lowercase: true })
  thumbnail: string;

  @Prop({ type: Number, default: 0 })
  clickCount: number;

  @Prop({ type: Boolean, default: false })
  lockLink: boolean;

  @Prop({ type: Boolean, default: false })
  isDisabled: boolean;

  @Prop({ type: Number, default: 0 })
  viewTime: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Category',
    index: true,
  })
  category: MongooseSchema.Types.ObjectId;

  @Prop({ type: Number })
  linkIndex: number;

  @Prop({ type: Number, default: 0 })
  cuts: number;

  @Prop({ type: Number, default: 0 })
  closedDeals: number;

  @Prop({ type: Number, default: 0 })
  estimatedEarnings: number;

  @Prop({ type: Number, default: 0 })
  affiliateEarnings: number;

  @Prop({ type: String })
  discountType: string;

  @Prop({ type: Number, default: 0 })
  discountAmount: number;

  @Prop({ type: String })
  earningType: string;

  @Prop({ type: Number, default: 0 })
  shareCount: number;
}

export type LinkDocument = Link & Document<Types.ObjectId>;
export const LinkSchema = SchemaFactory.createForClass(Link);
