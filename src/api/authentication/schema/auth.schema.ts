import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Auth {
  @Prop({ lowercase: true, unique: true, index: true, required: true })
  email: string;

  @Prop({ default: null })
  password: string;

  @Prop({ unique: true, index: true })
  uusername: string;

  @Prop({ type: Boolean, default: false })
  verified: boolean;
}

export type AuthDocument = Auth & Document<Types.ObjectId>;
export const AuthSchema = SchemaFactory.createForClass(Auth);
