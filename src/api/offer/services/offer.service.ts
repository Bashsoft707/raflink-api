import {
  // BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  // NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { errorHandler } from '../../../utils';
import { Offer, OfferDocument } from '../schema';
import { CreateOfferDto } from '../dto';

@Injectable()
export class OfferService {
  constructor(
    @InjectModel(Offer.name)
    private readonly OfferModel: Model<OfferDocument>,
  ) {}

  async createOffer(userId: Types.ObjectId, createOfferDto: CreateOfferDto) {
    const { duration, ...rest } = createOfferDto;

    const data = {
      ...rest,
      startDate: new Date(duration.startDate),
      endDate: new Date(duration.endDate),
    };

    try {
      const newOffer = await this.OfferModel.create({
        ...data,
        userId,
      });

      if (!newOffer) {
        throw new InternalServerErrorException('Failed to create Offer');
      }

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Offer created successfully.',
        data: newOffer,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async getUserOffers(userId: Types.ObjectId) {
    try {
      const userOffers = await this.OfferModel.find({ userId })
        .populate('userId')
        .exec();

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'User Offers retrieved successfully.',
        data: userOffers,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async getOfferById(userId: Types.ObjectId, id: string) {
    try {
      const userOffer = await this.OfferModel.findOne({ _id: id, userId })
        .populate('userId')
        .exec();

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'User Offer retrieved successfully.',
        data: userOffer,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }
}
