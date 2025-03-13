import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { errorHandler } from '../../../utils';
import { Transaction, TransactionDocument } from '../schema';
import { TransactionFilterDTO } from '../dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  createTransaction(payload) {
    this.transactionModel.create(payload);
  }

  async getUserTransactions(
    userId: Types.ObjectId,
    query: TransactionFilterDTO,
  ) {
    try {
      const { page, limit, startDate, endDate, status, transactionType } =
        query;
      const skip = (page - 1) * limit;

      const baseQuery = { userId };

      if (startDate) {
        const beginDate = new Date(startDate);
        const FinishDate = new Date(endDate);
        beginDate.setHours(0, 0, 0, 0);
        FinishDate.setHours(23, 59, 59, 999);

        baseQuery['created_at'] = { $gte: beginDate, $lte: FinishDate };
      }

      if (status) {
        baseQuery['status'] = String(status);
      }

      if (transactionType) {
        baseQuery['transactionType'] = String(transactionType);
      }

      const [userTransactions, count] = await Promise.all([
        this.transactionModel
          .find(baseQuery)
          .populate('userId', 'displayName')
          .skip(skip)
          .limit(limit)
          .exec(),
        this.transactionModel.countDocuments(baseQuery),
      ]);

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User transactions retrieved successfully.',
        data: { userTransactions, count, page, pageSize: limit },
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async getUserTransactionById(userId: Types.ObjectId, id: string) {
    try {
      const userTransaction = await this.transactionModel
        .findOne({
          _id: id,
          userId,
        })
        .populate('userId')
        .exec();

      if (!userTransaction) {
        throw new NotFoundException('User transaction not found');
      }

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User transaction retrieved successfully.',
        data: userTransaction,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async getTransactions(query: TransactionFilterDTO) {
    try {
      const { page, limit, startDate, endDate, status, transactionType } =
        query;
      const skip = (page - 1) * limit;

      const baseQuery = {};

      if (startDate) {
        const beginDate = new Date(startDate);
        const FinishDate = new Date(endDate);
        beginDate.setHours(0, 0, 0, 0);
        FinishDate.setHours(23, 59, 59, 999);

        baseQuery['created_at'] = { $gte: beginDate, $lte: FinishDate };
      }

      if (status) {
        baseQuery['status'] = String(status);
      }

      if (transactionType) {
        baseQuery['transactionType'] = String(transactionType);
      }

      const [transactions, count] = await Promise.all([
        this.transactionModel
          .find(baseQuery)
          .populate('userId', 'displayName')
          .skip(skip)
          .limit(limit)
          .exec(),
        this.transactionModel.countDocuments(baseQuery),
      ]);

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Transactions retrieved successfully.',
        data: { transactions, count, page, pageSize: limit },
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async getSingleTransaction(id: string) {
    try {
      const transaction = await this.transactionModel
        .findOne({ _id: id }, '-userId')
        .exec();

      if (!transaction) {
        throw new NotFoundException('Transaction record not found');
      }

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Single transaction retrieved successfully.',
        data: transaction,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }
}
