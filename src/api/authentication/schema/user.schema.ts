import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { SOCIALS } from '../../../constants';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ lowercase: true, unique: true, index: true, required: true })
  email: string;

  @Prop({ lowercase: true, unique: true, sparse: true, default: undefined })
  displayName: string;

  @Prop({ lowercase: true, unique: true, sparse: true, default: undefined })
  username: string;

  @Prop({ lowercase: true })
  bio: string;

  @Prop({ lowercase: true })
  image: string;

  @Prop(
    raw([
      {
        name: { enum: SOCIALS, type: String },
        linkUrl: { type: String },
        thumbnail: { type: String },
      },
    ]),
  )
  socialLinks: Array<{
    name: string;
    linkUrl: string;
    thumbnail: string;
  }>;

  @Prop({ type: [String] })
  promotedContent: string[];

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
