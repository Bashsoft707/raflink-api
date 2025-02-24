import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Otp {
  @Prop({ type: String, lowercase: true, index: true, required: true })
  email: string;

  @Prop({ type: String, required: true })
  otp: string;

  @Prop({ type: Date, default: () => new Date(Date.now() + 10 * 60 * 1000) })
  otpExpiration: Date;
}

export type OtpDocument = Otp & Document<Types.ObjectId>;
export const OtpSchema = SchemaFactory.createForClass(Otp);
