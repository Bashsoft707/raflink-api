import {
  BadRequestException,
  // BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  // NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { errorHandler } from '../../../utils';
import { Offer, OfferDocument } from '../schema';
import { CreateOfferDto, FilterOfferDto, UpdateOfferDto } from '../dto';
import { Category, CategoryDocument } from '../../links/schema/category.schema';
import { CreateCategoryDto } from '../../links/dtos';

@Injectable()
export class OfferService {
  constructor(
    @InjectModel(Offer.name)
    private readonly OfferModel: Model<OfferDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async createOffer(userId: Types.ObjectId, createOfferDto: CreateOfferDto) {
    const { duration, ...rest } = createOfferDto;

    // if (createOfferDto.category) {
    //   const category = await this.categoryModel
    //     .findOne({ userId, _id: createOfferDto.category })
    //     .exec();

    //   if (!category) {
    //     throw new BadRequestException('Category not found');
    //   }
    // }

    const data = {
      ...rest,
      durationName: duration.durationName,
      startDate: duration.startDate ? new Date(duration.startDate) : null,
      endDate: duration.endDate ? new Date(duration.endDate) : null,
    };

    try {
      const newOffer = await this.OfferModel.create({
        ...data,
        merchantId: userId,
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

  async getUserOffers(merchantId: Types.ObjectId, query: FilterOfferDto) {
    try {
      const { name, promoted } = query;
      const baseQuery: any = { merchantId };

      if (name) baseQuery.name = new RegExp(name, 'i');

      if (typeof promoted === 'string')
        baseQuery.promoted = promoted.toLowerCase() === 'true';

      const userOffers = await this.OfferModel.find(baseQuery)
        .populate('userId')
        .exec();

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
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
      const userOffer = await this.OfferModel.findOne({
        _id: id,
        merchantId: userId,
      })
        .populate('userId')
        .exec();

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User Offer retrieved successfully.',
        data: userOffer,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async updateOffer(
    userId: Types.ObjectId,
    id: string,
    updateOfferDto: UpdateOfferDto,
  ) {
    const { duration, ...rest } = updateOfferDto;

    const userOffer = await this.OfferModel.findOne({
      _id: id,
      merchantId: userId,
    })
      .populate('userId')
      .exec();

    if (!userOffer) {
      throw new NotFoundException('Offer not found');
    }

    const data = {
      ...rest,
      durationName:
        duration && duration.durationName
          ? duration.durationName
          : userOffer.durationName,
      startDate:
        duration && duration.startDate
          ? new Date(duration.startDate)
          : userOffer.startDate,
      endDate:
        duration && duration.endDate
          ? new Date(duration.endDate)
          : userOffer.endDate,
    };

    try {
      const updatedOffer = await this.OfferModel.findByIdAndUpdate(id, data, {
        new: true,
      });

      if (!updatedOffer) {
        throw new InternalServerErrorException('Failed to update Offer');
      }

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Offer updated successfully.',
        data: updatedOffer,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async getOffers(query: FilterOfferDto) {
    try {
      const { name, promoted } = query;
      const baseQuery: any = { status: 'active' };

      if (name) baseQuery.name = new RegExp(name, 'i');

      if (typeof promoted === 'string')
        baseQuery.promoted = promoted.toLowerCase() === 'true';

      const offers = await this.OfferModel.find(baseQuery, '-userId').exec();

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Offers retrieved successfully.',
        data: offers,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async getSingleOffer(id: string) {
    try {
      const userOffer = await this.OfferModel.findOne(
        { _id: id },
        '-userId',
      ).exec();

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Single offer retrieved successfully.',
        data: userOffer,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async getOffersAnalytics(userId: Types.ObjectId) {
    try {
      const offers = await this.OfferModel.countDocuments({
        merchantId: userId,
      });

      const data = {
        totalOffer: offers,
        totalAffiliates: 0,
        topOffers: 0,
        topAffiliates: 0,
        trafficSources: {},
      };
      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Single offer retrieved successfully.',
        data: data,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async toggleOfferStatus(userId: Types.ObjectId, offerId: string) {
    try {
      const offer = await this.OfferModel.findOne({
        _id: offerId,
        merchantId: userId,
      });

      if (!offer) {
        return {
          status: 'fail',
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Offer not found.',
          data: null,
          error: null,
        };
      }

      offer.status = offer.status === 'active' ? 'deactivated' : 'active';
      await offer.save();
      // const updatedOffer = this.OfferModel.findOneAndReplace(
      //   { _id: offerId },
      //   { $set: { status: 'deactivated' } },
      //   { new: true },
      // );
      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: `Offer ${offer.status}`,
        data: offer,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async createCategory(dto: CreateCategoryDto) {
    try {
      const { categoryName } = dto;

      const exisitingCategory = await this.categoryModel
        .findOne({ categoryName: categoryName.toLowerCase(), type: 'offer' })
        .exec();

      if (exisitingCategory) {
        throw new BadRequestException(
          `Category ${categoryName} already exists`,
        );
      }

      const newCategory = await this.categoryModel.create({
        categoryName,
        type: 'offer',
      });

      if (!newCategory) {
        throw new InternalServerErrorException('Failed to create category');
      }

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Offer category created successfully.',
        data: newCategory,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async getCategory() {
    try {
      const category = await this.categoryModel
        .find({ type: 'offer' })
        .lean()
        .exec();

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Offer categories retrieved successfully.',
        data: category,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async promoteOffer(id: string) {
    try {
      const offer = await this.OfferModel.findById(id);

      if (!offer) {
        throw new NotFoundException('Offer not found');
      }

      const promotedOffer = await this.OfferModel.findByIdAndUpdate(
        id,
        { promoted: true },
        {
          new: true,
        },
      );

      if (!promotedOffer) {
        throw new InternalServerErrorException('Failed to promote offer');
      }

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Offer promoted successfully.',
        data: promotedOffer,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }
}
