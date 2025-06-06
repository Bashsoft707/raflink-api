import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { SOCIALS } from '../../../constants';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    type: String,
    lowercase: true,
    unique: true,
    index: true,
    required: true,
  })
  email: string;

  @Prop({
    type: String,
    lowercase: true,
    unique: true,
    sparse: true,
    default: undefined,
  })
  displayName: string;

  @Prop({
    type: String,
    lowercase: true,
    unique: true,
    sparse: true,
    default: undefined,
  })
  username: string;

  @Prop({ type: String, lowercase: true })
  bio: string;

  @Prop({ type: String, lowercase: true })
  image: string;

  @Prop({ type: String, lowercase: true })
  backgroundColor: string;

  @Prop({ type: String, lowercase: true })
  backgroundImage: string;

  @Prop({ type: String, lowercase: true })
  textColor: string;

  @Prop({ type: String, lowercase: true })
  subtitleColor: string;

  @Prop({ type: String, lowercase: true })
  containerColor: string;

  @Prop(
    raw([
      {
        name: { enum: SOCIALS, type: String },
        linkUrl: { type: String },
        thumbnail: { type: String },
        followersCount: { type: Number, default: 0 },
      },
    ]),
  )
  socialLinks: Array<{
    name: string;
    linkUrl: string;
    thumbnail: string;
    followersCount: string;
  }>;

  @Prop({ type: [String] })
  promotedContent: string[];

  @Prop({ lowercase: true })
  goals: string;

  @Prop({ type: Boolean, default: false })
  verified: boolean;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ default: null })
  @Exclude()
  refreshToken: string;

  @Prop({ default: null })
  stripeCustomerId: string;

  @Prop({ type: Number, default: 0 })
  profileViewTime: number;

  @Prop({ type: String, lowercase: true })
  templateImage: string;

  @Prop({ type: String })
  templateBackground: string;

  @Prop({ type: Number, default: 0 })
  shareCount: number;

  @Prop({ type: Boolean, default: false })
  hideLogo: boolean;

  @Prop({ type: Boolean, default: false })
  twoFactorEnabled: boolean;

  @Prop({ type: String, default: null })
  @Exclude()
  twoFactorSecret: string;

  @Prop({ type: Boolean, default: false })
  twoFactorVerified: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  isPremium: boolean;
}

export type UserDocument = User & Document<Types.ObjectId>;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.path('username').validate(function (value) {
  if (value === null || value === undefined || value === '') {
    return true;
  }
  return true;
});

UserSchema.path('displayName').validate(function (value) {
  if (value === null || value === undefined || value === '') {
    return true;
  }
  return true;
});
