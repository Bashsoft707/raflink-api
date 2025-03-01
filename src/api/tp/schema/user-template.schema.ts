import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { SOCIAL_LINKS_POSITON, TEMPLATE_LINK_LAYOUT } from '../../../constants';

@Schema({
  timestamps: true,
})
export class UserTemplate {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Template',
    required: true,
  })
  templateId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: SOCIAL_LINKS_POSITON })
  socialLinksPosition: string;

  @Prop({ lowercase: true, required: true })
  name: string;

  @Prop({ type: Object })
  templateStyle: Object;

  @Prop({ type: Object })
  socialLinksStyle: Object;

  @Prop({ type: Object })
  linkStyle: Object;

  @Prop(
    raw([
      {
        name: { type: String },
        linkUrl: { type: String },
        thumbnail: { type: String },
        layout: {
          enum: TEMPLATE_LINK_LAYOUT,
          type: String,
          default: TEMPLATE_LINK_LAYOUT.CLASSIC,
        },
        clickCount: { type: Number, default: 0 },
        lockLink: { type: Boolean, default: false },
      },
    ]),
  )
  affiliateLinks: Array<{
    name: string;
    linkUrl: string;
    thumbnail: string;
    layout: string;
    clickCount: boolean;
    lockLink: boolean;
  }>;
}

export type UserTemplateDocument = UserTemplate & Document<Types.ObjectId>;
export const UserTemplateSchema = SchemaFactory.createForClass(UserTemplate);
