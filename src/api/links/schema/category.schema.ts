import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Category {
  @Prop({ type: String, required: true, lowercase: true })
  categoryName: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, lowercase: true })
  type: string;
}

export type CategoryDocument = Category & Document<Types.ObjectId>;
export const CategorySchema = SchemaFactory.createForClass(Category);
