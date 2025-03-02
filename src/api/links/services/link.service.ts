import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateUserLinkDto, UpdateUserLinkDto } from '../dtos';
import { errorHandler } from '../../../utils';
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
}
