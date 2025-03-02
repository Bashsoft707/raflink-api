import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { TEMPLATE_LINK_LAYOUT } from '../../../constants';

@Schema({
  timestamps: true,
})
export class Link {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    enum: TEMPLATE_LINK_LAYOUT,
    default: TEMPLATE_LINK_LAYOUT.CLASSIC,
  })
  layout: string;

  @Prop({ lowercase: true, required: true })
  name: string;

  @Prop({ type: String, required: true, lowercase: true })
  linkUrl: String;

  @Prop({ type: String, lowercase: true })
  thumbnail: String;

  @Prop({ type: Number, default: 0 })
  clickCount: Number;

  @Prop({ type: Boolean, default: false })
  lockLink: Boolean;
}

export type LinkDocument = Link & Document<Types.ObjectId>;
export const LinkSchema = SchemaFactory.createForClass(Link);
