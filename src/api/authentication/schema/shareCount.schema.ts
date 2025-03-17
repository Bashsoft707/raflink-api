import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({
  timestamps: true,
})
export class ShareCount {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Link' })
  linkId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true })
  sharedData: string;

  @Prop({ type: String, required: true })
  sharedTo: string;

  @Prop({ type: Number, required: true })
  shareCount: number;

  @Prop({ type: Date })
  shareDate: Date;
}

export type ShareCountDocument = ShareCount & Document;
export const ShareCountSchema = SchemaFactory.createForClass(ShareCount);
