import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { SOCIAL_LINKS_POSITON } from '../../../constants';

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
}

export type UserTemplateDocument = UserTemplate & Document<Types.ObjectId>;
export const UserTemplateSchema = SchemaFactory.createForClass(UserTemplate);
