import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { TransactionStatus } from '../../../constants';

@Schema({
  timestamps: true,
})
export class Transaction {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Merchant',
  })
  merchantId: MongooseSchema.Types.ObjectId;

  // @Prop({ type: String, lowercase: true, required: true })
  // name: string;

  @Prop({ type: String, required: true, lowercase: true })
  description: string;

  @Prop({ type: String })
  cardLastFourDigit: string;

  @Prop({ type: String })
  cardType: string;

  @Prop({ index: true, unique: true })
  transactionRef: string;

  @Prop({ default: null })
  currency: string;

  @Prop({ type: String, required: true })
  transactionType: string;

  @Prop({ enum: TransactionStatus, required: true })
  status: TransactionStatus;

  @Prop({ type: Date, required: true })
  transactionDate: Date;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String })
  invoiceUrl: string;

  @Prop({ type: String })
  receiptPdf: string;
}

export type TransactionDocument = Transaction & Document<Types.ObjectId>;
export const TransactionSchema = SchemaFactory.createForClass(Transaction);
