import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Notification {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Merchant' })
  merchantId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  earningUpdate: boolean;

  @Prop({ type: Boolean, default: true })
  performance: boolean;

  @Prop({ type: Boolean, default: true })
  brandOpportunities: boolean;

  @Prop({ type: Boolean, default: true })
  announcements: boolean;

  @Prop({ type: Boolean, default: true })
  collaborationRequest: boolean;

  @Prop({ type: Boolean, default: false })
  paymentUpdates: boolean;
}

export type NotificationDocument = Notification & Document<Types.ObjectId>;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
