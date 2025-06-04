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
  CreateCategoryDto,
  CreateUserLinkDto,
  GraphFilterDto,
  UpdateClickCountDto,
  UpdateLinkViewTimeDto,
  UpdateUserLinkDto,
} from '../dtos';
import { errorHandler, formatTime } from '../../../utils';
import { Link, LinkClickDocument, LinkClick, LinkDocument } from '../schema';
import { User, UserDocument } from '../../authentication/schema';
import {
  ProfileView,
  ProfileViewDocument,
} from '../../authentication/schema/profileViewTime.schema';
import { UpdateShareCountDto } from '../../authentication/dtos';
import {
  ShareCount,
  ShareCountDocument,
} from '../../authentication/schema/shareCount.schema';
import { Category, CategoryDocument } from '../schema/category.schema';
import { Tracker, TrackerDocument } from '../schema/tracker.schema';
import { UserTemplate } from 'src/api/tp/schema';
import { Offer, OfferDocument } from 'src/api/offer/schema';

@Injectable()
export class LinkService {
  constructor(
    @InjectModel(Link.name)
    private readonly LinkModel: Model<LinkDocument>,
    @InjectModel(LinkClick.name)
    private readonly LinkClickModel: Model<LinkClickDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(ProfileView.name)
    private readonly profileViewModel: Model<ProfileViewDocument>,
    @InjectModel(ShareCount.name)
    private readonly shareCountModel: Model<ShareCountDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Tracker.name)
    private readonly trackerModel: Model<TrackerDocument>,
    @InjectModel(UserTemplate.name)
    private readonly userTemplateModel: Model<UserTemplate>,
    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,
  ) {}

  async createUserLink(
    userId: Types.ObjectId,
    createLinkDto: CreateUserLinkDto,
  ) {
    try {
      if (createLinkDto.offerId) {
        const linkedOffer = await this.LinkModel.findOne({
          userId,
          offerId: createLinkDto.offerId,
        }).exec();

        if (linkedOffer) {
          throw new BadRequestException('Offer already exists for this user');
        }
      }
      
      const lastLink = await this.LinkModel.findOne({ userId })
        .sort({ linkIndex: -1 })
        .select('linkIndex')
        .exec();

      if (createLinkDto.category) {
        const category = await this.categoryModel
          .findOne({ userId, _id: createLinkDto.category })
          .exec();

        if (!category) {
          throw new BadRequestException('Category not found');
        }
      }

      const newLinkIndex = lastLink ? lastLink.linkIndex + 1 : 0;

      const newLink = await this.LinkModel.create({
        ...createLinkDto,
        userId,
        linkIndex: newLinkIndex,
      });

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
      const userLinks = await this.LinkModel.find({ userId }, '-userId')
        .populate('category', 'categoryName')
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

      if (updateLinkDto.category) {
        const category = await this.categoryModel
          .findOne({ userId: user, _id: updateLinkDto.category })
          .exec();

        if (!category) {
          throw new BadRequestException('Category not found');
        }
      }

      const updatedUserLink = await this.LinkModel.findByIdAndUpdate(
        id,
        updateLinkDto,
        {
          new: true,
        },
      );

      if (!updatedUserLink) {
        throw new InternalServerErrorException('Failed to update Link');
      }

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

  async updateClickCount(id: string, clickData: UpdateClickCountDto) {
    try {
      const userLink = await this.LinkModel.findById(id);

      if (!userLink) {
        throw new NotFoundException('User Link not found');
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
        userId: userLink.userId,
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

  async updateViewTime(id: string, dto: UpdateLinkViewTimeDto) {
    try {
      const userLink = await this.LinkModel.findById(id);

      if (!userLink) {
        throw new NotFoundException('User Link not found');
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
      const [userLinks, profileView] = await Promise.all([
        this.LinkModel.find({ userId }),
        this.userModel.findOne({
          _id: userId,
        }),
      ]);

      const totalClicks = userLinks.reduce(
        (sum, link) => sum + link.clickCount,
        0,
      );

      const activeSubLinks = userLinks.filter(
        (link) => !link.isDisabled,
      ).length;

      const totalViewTime = profileView?.profileViewTime || 0;

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
          averageViewTime: formatTime(totalViewTime),
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

      const [linkClicks, profileViews]: any = await Promise.all([
        this.LinkClickModel.find({
          userId,
          createdAt: { $gte: start, $lte: end },
        }),
        this.profileViewModel.find({
          userId,
          createdAt: { $gte: start, $lte: end },
        }),
      ]);

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

          const filteredViews = profileViews.filter(
            (view) =>
              view.createdAt >= periodStart && view.createdAt <= periodEnd,
          );

          const viewCount = filteredViews.reduce(
            (acc, view) => acc + view.viewTime,
            0,
          );

          const activeSubLinks = filteredLinks.filter(
            (link) => !link.isDisabled,
          ).length;

          analyticsData.push({
            period: periodStart.toDateString(),
            totalClicks: filteredLinks?.length || 0,
            activeSubLinks,
            viewTime: formatTime(viewCount),
          });
        }
      } else if (filterType === 'weekly') {
        const startCopy = new Date(start);
        const dayOfWeek = startCopy.getDay();

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

          const filteredViews = profileViews.filter(
            (view) => view.createdAt >= weekStart && view.createdAt <= weekEnd,
          );

          const viewCount = filteredViews.reduce(
            (acc, view) => acc + view.viewTime,
            0,
          );

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
            totalClicks: filteredLinks?.length || 0,
            activeSubLinks,
            viewTime: formatTime(viewCount),
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

          const filteredViews = profileViews.filter(
            (view) =>
              view.createdAt >= monthStart && view.createdAt <= monthEnd,
          );

          const viewCount = filteredViews.reduce(
            (acc, view) => acc + view.viewTime,
            0,
          );

          analyticsData.push({
            period: `${months[currentMonth]} ${currentYear}`,
            totalClicks: filteredLinks?.length || 0,
            activeSubLinks,
            viewTime: formatTime(viewCount),
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
        .findOne(
          { username },
          'displayName bio socialLinks image hideLogo backgroundImage backgroundColor textColor subtitleColor containerColor',
        )
        .lean()
        .exec();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const userTemplate: any = await this.userTemplateModel
        .findOne({ userId: user._id }, '-__v -userId -createdAt -updatedAt')
        .lean()
        .exec();

      const userLinks: any = await this.LinkModel.find(
        { userId: user._id },
        '-__v -createdAt -updatedAt',
      )
        .populate('category', 'categoryName')
        .lean()
        .exec();

      const categorizeLinks = userLinks.reduce((acc, link) => {
        const category = link.category?.categoryName || 'Uncategorized';

        if (!acc[category]) {
          acc[category] = [];
        }

        acc[category].push(link);
        return acc;
      }, {});

      const formattedCategorizedLinks = Object.entries(categorizeLinks).map(
        ([categoryName, links]) => ({
          categoryName,
          links,
        }),
      );

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User link info retrieved successfully.',
        data: {
          ...user,
          userTemplate,
          affiliateLinks: userLinks,
          categorizeLinks: formattedCategorizedLinks,
        },
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async updateShareCount(id: string, dto: UpdateShareCountDto) {
    try {
      const userLink = await this.LinkModel.findById(id);

      if (!userLink) {
        throw new NotFoundException('User Link not found');
      }

      if (userLink.isDisabled) {
        throw new BadRequestException('Link is disabled');
      }

      const updatedLink = await this.LinkModel.findByIdAndUpdate(
        id,
        { shareCount: userLink.shareCount + 1 },
        { new: true },
      );

      if (!updatedLink) {
        throw new InternalServerErrorException(
          'Error in updating link share count',
        );
      }

      const countRecord = await this.shareCountModel.create({
        userId: userLink.userId,
        linkId: userLink._id,
        sharedData: 'link',
        sharedTo: dto.sharedTo,
        shareCount: dto.shareCount,
        shareDate: new Date(),
      });

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User link share count updated successfully.',
        data: { totalShares: updatedLink.shareCount, countRecord },
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async createCategory(userId: Types.ObjectId, dto: CreateCategoryDto) {
    try {
      const { categoryName } = dto;

      const exisitingCategory = await this.categoryModel
        .findOne({ userId, categoryName: categoryName.toLowerCase() })
        .exec();

      if (exisitingCategory) {
        throw new BadRequestException(
          `Category ${categoryName} already exists`,
        );
      }

      const newCategory = await this.categoryModel.create({
        userId,
        categoryName,
        type: 'link',
      });

      if (!newCategory) {
        throw new InternalServerErrorException('Failed to create category');
      }

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Category created successfully.',
        data: newCategory,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async getCategory(userId: Types.ObjectId) {
    try {
      const category = await this.categoryModel
        .find({ userId }, '-userId')
        .exec();

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Categories retrieved successfully.',
        data: category,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async updateCategory(
    id: string,
    user: Types.ObjectId,
    dto: CreateCategoryDto,
  ) {
    try {
      const category = await this.categoryModel.findById(id);

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      if (category.userId?.toString() !== user.toString()) {
        throw new BadRequestException("Link doesn't belong to user");
      }

      const exisitingCategory = await this.categoryModel
        .findOne({ userId: user, categoryName: dto.categoryName.toLowerCase() })
        .exec();

      if (exisitingCategory) {
        throw new BadRequestException(
          `Category ${dto.categoryName} already exists`,
        );
      }

      const updatedCategory = await this.categoryModel.findByIdAndUpdate(
        id,
        dto,
        {
          new: true,
        },
      );

      if (!updatedCategory) {
        throw new InternalServerErrorException('Failed to update category');
      }

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Category updated successfully.',
        data: updatedCategory,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async deleteCategory(id: string, user: Types.ObjectId) {
    try {
      const category = await this.categoryModel.findById(id).exec();

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      if (category.userId?.toString() !== user.toString()) {
        throw new BadRequestException("Link doesn't belong to user");
      }

      await category.deleteOne();

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Category deleted successfully.',
        data: null,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async trackSales(res, query) {
    try {
      const { affiliate_id, amount, order_id, vendor_id, offer_id } = query;

      if (!affiliate_id) {
        throw new BadRequestException('Affiliate id required');
      }

      if (affiliate_id && amount) {
        const affiliateLink = await this.userModel
          .findOne({ _id: affiliate_id })
          .lean()
          .exec();

        if (!affiliateLink) {
          throw new NotFoundException('Affiliate link not found');
        }

        const tracker = await this.trackerModel.create({
          affiliateId: affiliate_id,
          // userId: affiliateLink.userId,
          vendorId: vendor_id,
          amount,
          orderId: order_id,
        });

        if (!tracker) {
          throw new InternalServerErrorException('Failed to track sale');
        }

        await this.offerModel.findByIdAndUpdate(
          offer_id,
          {
            $inc: { clickCount: 1 },
          },
          { new: true },
        );

        await this.LinkModel.findOneAndUpdate(
          { userId: affiliate_id, offerId: offer_id },
          { $inc: { affiliateEarnings: amount } },
          { new: true },
        );
      }

      // 1x1 transparent pixel
      const pixel = Buffer.from(
        '47494638396101000100800000ffffff00000021f90401000001002c00000000010001000002024401003b',
        'hex',
      );

      res.setHeader('Content-Type', 'image/gif');
      res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate',
      );
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Content-Length', pixel.length);
      res.end(pixel);
    } catch (error) {
      errorHandler(error);
    }
  }
}
