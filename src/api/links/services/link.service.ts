import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreateUserLinkDto,
  UpdateLinkViewTimeDto,
  UpdateUserLinkDto,
} from '../dtos';
import { errorHandler, formatTime } from '../../../utils';
import { Link, LinkDocument } from '../schema/link.schema';

@Injectable()
export class LinkService {
  constructor(
    @InjectModel(Link.name)
    private readonly LinkModel: Model<LinkDocument>,
  ) {}

  async createUserLink(
    userId: Types.ObjectId,
    createLinkDto: CreateUserLinkDto,
  ) {
    try {
      const newLink = await this.LinkModel.create({ ...createLinkDto, userId });

      if (!newLink) {
        throw new InternalServerErrorException('Failed to create Link');
      }

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Link created successfully.',
        data: newLink,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async getUserLinks(userId: Types.ObjectId) {
    try {
      const userLinks = await this.LinkModel.find({ userId })
        .populate('userId', 'bio socialLinks')
        .exec();

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'User Links retrieved successfully.',
        data: userLinks,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async updateUserLink(
    id: string,
    user: Types.ObjectId,
    updateLinkDto: UpdateUserLinkDto,
  ) {
    try {
      const userLink = await this.LinkModel.findById(id);

      if (!userLink) {
        throw new NotFoundException('User Link not found');
      }

      if (userLink.userId?.toString() !== user.toString()) {
        throw new BadRequestException("Link doesn't belong to user");
      }

      const updatedUserLink = await this.LinkModel.findByIdAndUpdate(
        id,
        updateLinkDto,
        {
          new: true,
        },
      );

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User Link updated successfully.',
        data: updatedUserLink,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async updateClickCount(id: string, user: Types.ObjectId) {
    try {
      const userLink = await this.LinkModel.findById(id);

      if (!userLink) {
        throw new NotFoundException('User Link not found');
      }

      if (userLink.userId?.toString() !== user.toString()) {
        throw new BadRequestException("Link doesn't belong to user");
      }

      if (userLink.isDisabled) {
        throw new BadRequestException('Link is disabled');
      }

      const updatedLink = await this.LinkModel.findByIdAndUpdate(
        id,
        { clickCount: userLink.clickCount + 1 },
        { new: true },
      );

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User click count updated successfully.',
        data: updatedLink,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async updateViewTime(
    id: string,
    user: Types.ObjectId,
    dto: UpdateLinkViewTimeDto,
  ) {
    try {
      const userLink = await this.LinkModel.findById(id);

      if (!userLink) {
        throw new NotFoundException('User Link not found');
      }

      if (userLink.userId?.toString() !== user.toString()) {
        throw new BadRequestException("Link doesn't belong to user");
      }

      if (userLink.isDisabled) {
        throw new BadRequestException('Link is disabled');
      }

      const updatedLink = await this.LinkModel.findByIdAndUpdate(
        id,
        { viewTime: userLink.viewTime + dto.viewTime },
        { new: true },
      );

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User view time updated successfully.',
        data: updatedLink,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async deleteUserLink(id: string, user: Types.ObjectId) {
    try {
      const userLink = await this.LinkModel.findById(id);

      if (!userLink) {
        throw new NotFoundException('User Link not found');
      }

      if (userLink.userId?.toString() !== user.toString()) {
        throw new BadRequestException("Link doesn't belong to user");
      }

      await userLink.deleteOne();

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User Link deleted successfully.',
        data: null,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async getAnalytics(userId: Types.ObjectId) {
    try {
      const userLinks = await this.LinkModel.find({ userId });

      const totalClicks = userLinks.reduce(
        (sum, link) => sum + link.clickCount,
        0,
      );

      const activeSubLinks = userLinks.filter(
        (link) => !link.isDisabled,
      ).length;

      const totalViewTime = userLinks.reduce(
        (sum, link) => sum + link.viewTime,
        0,
      );
      const averageViewTime =
        userLinks.length > 0 ? Math.round(totalViewTime / userLinks.length) : 0;

      const closedDeals = userLinks.filter(
        (link) => link.clickCount > 0 && link.viewTime > 30,
      ).length;

      const earnings = closedDeals * 55.75;

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User analytics retrieved successfully.',
        data: {
          totalClicks,
          activeSubLinks,
          averageViewTime: formatTime(averageViewTime),
          closedDeals,
          earnings,
        },
      };
    } catch (error) {
      errorHandler(error);
    }
  }
}
