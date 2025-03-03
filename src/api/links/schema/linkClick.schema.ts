import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({
  timestamps: true,
})
export class LinkClick {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Link', required: true })
  linkId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  ipAddress: string;

  @Prop({ type: String })
  referrer: string;

  @Prop({ type: Date, default: Date.now })
  clickDate: Date;

  @Prop({ type: Object })
  geoLocation: {
    country?: string;
    city?: string;
  };

  @Prop({ type: String })
  deviceType: string;
}

export type LinkClickDocument = LinkClick & Document;
export const LinkClickSchema = SchemaFactory.createForClass(LinkClick);
