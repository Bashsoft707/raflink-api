import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SOCIAL_LINKS_POSITON, TEMPLATE_LINK_LAYOUT } from '../../../constants';

@Schema({
  timestamps: true,
})
export class Template {
  @Prop({ lowercase: true, required: true })
  backgroundColor: string;

  @Prop({ enum: SOCIAL_LINKS_POSITON, required: true })
  socialLinksPosition: string;

  @Prop({ lowercase: true, required: true, unique: true, index: true })
  name: string;

  @Prop({ lowercase: true, type: String })
  backgroundUrl: string;

  @Prop({ lowercase: true, type: String })
  backgroundImage: string;

  @Prop({ type: Object })
  templateCss: Object;

  @Prop({ type: Object })
  linkCss: Object;

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
        lockLink: { type: Boolean, default: false },
      },
    ]),
  )
  affiliateLinks: Array<{
    name: string;
    linkUrl: string;
    thumbnail: string;
    layout: string;
    lockLink: boolean;
  }>;
}

export type TemplateDocument = Template & Document<Types.ObjectId>;
export const TemplateSchema = SchemaFactory.createForClass(Template);
