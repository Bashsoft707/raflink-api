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
  GraphFilterDto,
  UpdateClickCountDto,
  UpdateLinkViewTimeDto,
  UpdateUserLinkDto,
} from '../dtos';
import { errorHandler, formatTime } from '../../../utils';
import { Link, LinkClickDocument, LinkClick, LinkDocument } from '../schema';
import { User, UserDocument } from 'src/api/authentication/schema';

@Injectable()
export class LinkService {
  constructor(
    @InjectModel(Link.name)
    private readonly LinkModel: Model<LinkDocument>,
    @InjectModel(LinkClick.name)
    private readonly LinkClickModel: Model<LinkClickDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
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

  async updateClickCount(
    id: string,
    user: Types.ObjectId,
    clickData: UpdateClickCountDto,
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
        { clickCount: userLink.clickCount + 1 },
        { new: true },
      );

      const clickRecord = await this.LinkClickModel.create({
        linkId: id,
        userId: user,
        ipAddress: clickData.ipAddress,
        referrer: clickData.referrer,
        geoLocation: clickData.geoLocation,
        deviceType: clickData.deviceType,
        clickDate: new Date(),
      });

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User click count updated successfully.',
        data: { totalClicks: updatedLink?.clickCount, clickRecord },
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

  async getFilteredAnalytics(userId: Types.ObjectId, dto: GraphFilterDto) {
    try {
      const { startDate, endDate } = dto;

      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const timeDiff = Number(end) - Number(start);
      const dayCount = timeDiff / (1000 * 60 * 60 * 24);
      let filterType;

      if (dayCount <= 7) {
        filterType = 'daily';
      } else if (dayCount > 7 && dayCount < 30) {
        filterType = 'weekly';
      } else {
        filterType = 'monthly';
      }

      const linkClicks: any = await this.LinkClickModel.find({
        userId,
        createdAt: { $gte: start, $lte: end },
      });

      const analyticsData: any = [];

      if (filterType === 'daily') {
        // Daily processing
        const days = Math.ceil(dayCount) + 1;

        for (let i = 0; i < days; i++) {
          const periodStart = new Date(start);
          periodStart.setDate(start.getDate() + i);
          periodStart.setHours(0, 0, 0, 0);

          const periodEnd = new Date(periodStart);
          periodEnd.setHours(23, 59, 59, 999);

          const filteredLinks = linkClicks.filter(
            (link) =>
              link.createdAt >= periodStart && link.createdAt <= periodEnd,
          );

          const activeSubLinks = filteredLinks.filter(
            (link) => !link.isDisabled,
          ).length;

          analyticsData.push({
            period: periodStart.toDateString(),
            activeSubLinks,
          });
        }
      } else if (filterType === 'weekly') {
        const startCopy = new Date(start);
        const dayOfWeek = startCopy.getDay(); // 0 is Sunday

        const firstSunday = new Date(startCopy);
        firstSunday.setDate(startCopy.getDate() - dayOfWeek);

        const weekCount = Math.ceil((dayCount + dayOfWeek) / 7);

        for (let i = 0; i < weekCount; i++) {
          const weekStart = new Date(firstSunday);
          weekStart.setDate(firstSunday.getDate() + i * 7);
          weekStart.setHours(0, 0, 0, 0);

          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);

          const filteredLinks = linkClicks.filter(
            (link) => link.createdAt >= weekStart && link.createdAt <= weekEnd,
          );

          const activeSubLinks = filteredLinks.filter(
            (link) => !link.isDisabled,
          ).length;

          const weekEndFormatted = weekEnd
            .toDateString()
            .split(' ')
            .slice(1)
            .join(' ');
          const weekStartFormatted = weekStart
            .toDateString()
            .split(' ')
            .slice(1)
            .join(' ');

          analyticsData.push({
            period: `Week ${i + 1} - ${weekStartFormatted} - ${weekEndFormatted}`,
            activeSubLinks,
          });
        }
      } else {
        const startMonth = start.getMonth();
        const startYear = start.getFullYear();
        const endMonth = end.getMonth();
        const endYear = end.getFullYear();

        const monthCount =
          (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

        const months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];

        for (let i = 0; i < monthCount; i++) {
          const currentMonth = (startMonth + i) % 12;
          const currentYear = startYear + Math.floor((startMonth + i) / 12);

          const monthStart = new Date(currentYear, currentMonth, 1);
          const monthEnd = new Date(
            currentYear,
            currentMonth + 1,
            0,
            23,
            59,
            59,
            999,
          );

          const filteredLinks = linkClicks.filter(
            (link) =>
              link.createdAt >= monthStart && link.createdAt <= monthEnd,
          );

          const activeSubLinks = filteredLinks.filter(
            (link) => !link.isDisabled,
          ).length;

          analyticsData.push({
            period: `${months[currentMonth]} ${currentYear}`,
            activeSubLinks,
          });
        }
      }

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User analytics retrieved successfully.',
        data: analyticsData,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async getUserLinkInfo(username: string) {
    try {
      const user = await this.userModel
        .findOne({ username }, 'displayName socialLinks image')
        .lean()
        .exec();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const userLinks = await this.LinkModel.find(
        { userId: user._id },
        '-__v -createdAt -updatedAt',
      )
        .lean()
        .exec();

      const categorizeLinks = userLinks.reduce((acc, link) => {
        const category = link.category || 'Uncategorized';

        if (!acc[category]) {
          acc[category] = [];
        }

        acc[category].push(link);
        return acc;
      }, {});

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User link info retrieved successfully.',
        data: { ...user, affiliateLinks: userLinks, categorizeLinks },
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }
}
