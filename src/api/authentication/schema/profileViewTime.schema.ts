import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({
  timestamps: true,
})
export class ProfileView {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  ipAddress: string;

  @Prop({ type: String })
  referrer: string;

  @Prop({ type: Number })
  viewTime: number;

  @Prop({ type: Date, default: Date.now })
  viewDate: Date;

  @Prop({ type: Object })
  geoLocation: {
    country?: string;
    city?: string;
  };

  @Prop({ type: String })
  deviceType: string;
}

export type ProfileViewDocument = ProfileView & Document;
export const ProfileViewSchema = SchemaFactory.createForClass(ProfileView);
