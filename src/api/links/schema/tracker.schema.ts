import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Tracker {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Link',
    required: true,
  })
  affiliateId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, required: true })
  orderId: string;
}

export type TrackerDocument = Tracker & Document<Types.ObjectId>;
export const TrackerSchema = SchemaFactory.createForClass(Tracker);
