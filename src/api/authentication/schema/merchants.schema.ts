import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Merchant {
  @Prop({ lowercase: true, unique: true, index: true, required: true })
  email: string;

  @Prop({ lowercase: true, unique: true, sparse: true, default: undefined })
  businessName: string;

  @Prop({ lowercase: true, unique: true, sparse: true, default: undefined })
  country: string;

  @Prop({ lowercase: true })
  contactInfo: string;

  @Prop({ lowercase: true })
  businessCategory: string;

  @Prop({ lowercase: true })
  websiteUrl: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ required: false })
  businessLogo: string;

  @Prop({ default: null })
  @Exclude()
  refreshToken: string;

  //   @Prop({ default: null })
  //   stripeCustomerId: string;
}

export type MerchantDocument = Merchant & Document<Types.ObjectId>;
export const MerchantSchema = SchemaFactory.createForClass(Merchant);

// UserSchema.path('username').validate(function (value) {
//   if (value === null || value === undefined || value === '') {
//     return true;
//   }
//   return true;
// });

// UserSchema.path('displayName').validate(function (value) {
//   if (value === null || value === undefined || value === '') {
//     return true;
//   }
//   return true;
// });
