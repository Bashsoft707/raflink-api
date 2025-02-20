import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ lowercase: true, unique: true, index: true, required: true })
  email: string;

  @Prop({ lowercase: true, unique: true })
  displayName: string;

  @Prop({ lowecase: true, unique: true })
  username: string;

  @Prop({ lowercase: true })
  bio: string;

  @Prop({ lowecase: true })
  image: string;

  @Prop({
    type: Object,
    default: {
      instagram: '',
      youtube: '',
      whatsapp: '',
      tiktok: '',
      website: '',
    },
  })
  socialLinks: {
    instagram: string;
    youtube: string;
    whatsapp: string;
    tiktok: string;
    website: string;
  };

  @Prop({ lowercase: true })
  goals: string;

  @Prop({ type: Boolean, default: false })
  verified: boolean;

  @Prop({ default: null })
  @Exclude()
  refreshToken: string;
}

export type UserDocument = User & Document<Types.ObjectId>;
export const UserSchema = SchemaFactory.createForClass(User);
