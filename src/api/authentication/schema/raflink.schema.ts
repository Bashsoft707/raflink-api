import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Raflink {
  @Prop({ lowercase: true, unique: true, index: true, required: true })
  email: string;

  @Prop({ lowercase: true, sparse: true, required: true })
  fullName: string;

  @Prop({ lowercase: true, sparse: true, required: true, default: 'admin' })
  role: string;

  @Prop()
  @Exclude()
  password: string;

  @Prop({ lowercase: true })
  contactInfo: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ default: null })
  @Exclude()
  refreshToken: string;

  //   @Prop({ default: null })
  //   stripeCustomerId: string;
}

export type RaflinkDocument = Raflink & Document<Types.ObjectId>;
export const RaflinkSchema = SchemaFactory.createForClass(Raflink);

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
