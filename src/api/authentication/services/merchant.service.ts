import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../authentication/schema';
import { Connection, Model, Types } from 'mongoose';
import {
  Merchant,
  MerchantDocument,
} from '../../authentication/schema/merchants.schema';
import { Offer, OfferDocument } from '../../offer/schema';
import { errorHandler, formatTime } from '../../../utils';
import {
  Link,
  LinkDocument,
  Tracker,
  TrackerDocument,
} from '../../links/schema';
import { GraphFilterDto } from 'src/api/links/dtos';

@Injectable()
export class MerchantService {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Merchant.name)
    private readonly merchantModel: Model<MerchantDocument>,
    @InjectModel(Offer.name)
    private readonly OfferModel: Model<OfferDocument>,
    @InjectModel(Link.name) private readonly linkModel: Model<LinkDocument>,
    @InjectModel(Tracker.name)
    private readonly trackerModel: Model<TrackerDocument>,
  ) {}

  async getDashboardAnalytics(merchantId: Types.ObjectId) {
    try {
      // Get today's date
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [clickCounts, totalOfferCount, trackers] = await Promise.all([
        this.OfferModel.find({ merchantId }, 'clickCount'),
        this.OfferModel.countDocuments({ merchantId }),
        this.trackerModel.aggregate([
          { $match: { vendorId: new Types.ObjectId(merchantId) } },
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              totalEarnings: { $sum: '$amount' },
              totalAffiliates: {
                $addToSet: '$affiliateId',
              },
            },
          },
        ]),
      ]);

      const totalAffiliates =
        trackers.length > 0 ? trackers[0].totalAffiliates.length : 0;
      const totalProducts = trackers.length > 0 ? trackers[0].totalProducts : 0;
      const totalEarnings = trackers.length > 0 ? trackers[0].totalEarnings : 0;

      const totalClickCount =
        clickCounts.reduce((acc, clicks) => acc + clicks.clickCount, 0) || 0;

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Merchant dashboard overview returned successfully',
        data: {
          totalClickCount: totalClickCount,
          totalOfferCount,
          totalEarnings,
          totalProducts,
          totalAffiliates,
        },
        error: null,
      };
    } catch (error) {
      return errorHandler(error);
    }
  }

  // async getDashboardAnalyticsGraph(
  //   merchantId: Types.ObjectId,
  //   query: GraphFilterDto,
  // ) {
  //   try {
  //     const { startDate, endDate } = query;
  //     const start = new Date(startDate);
  //     const end = new Date(endDate);
  //     end.setHours(23, 59, 59, 999);

  //     const dayCount =
  //       (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  //     const isMonthly = dayCount >= 30;
  //     const filterType = isMonthly ? 'monthly' : 'weekly';
  //     const year = start.getFullYear();

  //     // Determine MongoDB group format
  //     const groupByFormat = isMonthly ? '%Y-%m' : '%Y-%m-%d';

  //     const trackers = await this.trackerModel.aggregate([
  //       {
  //         $match: {
  //           vendorId: new Types.ObjectId(merchantId),
  //           createdAt: { $gte: start, $lte: end },
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: {
  //             $dateToString: { format: groupByFormat, date: '$createdAt' },
  //           },
  //           totalEarnings: { $sum: '$amount' },
  //         },
  //       },
  //       { $sort: { _id: 1 } },
  //     ]);

  //     console.log('trackers', trackers);

  //     // Merge trackers counts
  //     const trackersMap = new Map<string, number>();
  //     for (const { _id, count } of trackers) {
  //       trackersMap.set(_id, (trackersMap.get(_id) || 0) + count);
  //     }

  //     // Generate final data points
  //     let finalData: { date: string; earnings: number }[] = [];

  //     if (isMonthly) {
  //       // Monthly: Iterate from January to December
  //       for (let month = 0; month < 12; month++) {
  //         const dateKey = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
  //         const dbKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  //         finalData.push({
  //           date: dateKey,
  //           earnings: trackersMap.get(dbKey) || 0,
  //         });
  //       }
  //     } else {
  //       // Weekly: Iterate over each day in the range
  //       let current = new Date(start);
  //       while (current <= end) {
  //         const dateKey = current.toISOString().split('T')[0]; // Format YYYY-MM-DD
  //         finalData.push({
  //           date: dateKey,
  //           earnings: trackersMap.get(dateKey) || 0,
  //         });
  //         current.setDate(current.getDate() + 1);
  //       }
  //     }

  //     return {
  //       status: 'success',
  //       statusCode: HttpStatus.OK,
  //       data: { filterType, data: finalData },
  //       error: null,
  //     };
  //   } catch (error) {
  //     return errorHandler(error);
  //   }
  // }

  async getDashboardAnalyticsGraph(
    merchantId: Types.ObjectId,
    query: GraphFilterDto,
  ) {
    try {
      const { startDate, endDate } = query;

      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const dayCount =
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      const isMonthly = dayCount >= 30;
      const filterType = isMonthly ? 'monthly' : 'weekly';
      const year = start.getFullYear();

      // MongoDB date format for grouping
      const groupByFormat = isMonthly ? '%Y-%m' : '%Y-%m-%d';

      // Aggregation query
      const trackers = await this.trackerModel.aggregate([
        {
          $match: {
            vendorId: new Types.ObjectId(merchantId),
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: groupByFormat, date: '$createdAt' },
            },
            totalEarnings: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Map results by date string
      const trackersMap = new Map<string, number>();
      for (const { _id, totalEarnings } of trackers) {
        trackersMap.set(_id, (trackersMap.get(_id) || 0) + totalEarnings);
      }

      const finalData: { date: string; earnings: number }[] = [];

      if (isMonthly) {
        // Generate all months for the year starting from startDate's year
        for (let month = 0; month < 12; month++) {
          const dateKey = `${new Date(year, month).toLocaleString('default', {
            month: 'long',
          })} ${year}`;
          const dbKey = `${year}-${String(month + 1).padStart(2, '0')}`;

          finalData.push({
            date: dateKey,
            earnings: trackersMap.get(dbKey) || 0,
          });
        }
      } else {
        // Daily iteration from start to end date
        let current = new Date(start);
        while (current <= end) {
          const dateKey = current.toISOString().split('T')[0];
          finalData.push({
            date: dateKey,
            earnings: trackersMap.get(dateKey) || 0,
          });
          current.setDate(current.getDate() + 1);
        }
      }

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        data: { filterType, data: finalData },
        error: null,
      };
    } catch (error) {
      return errorHandler(error);
    }
  }

  async getEarningsGraph(merchantId: Types.ObjectId, dto: GraphFilterDto) {
    try {
      const { startDate, endDate } = dto;

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const dayCount =
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      let filterType: 'daily' | 'weekly' | 'monthly';

      if (dayCount <= 7) {
        filterType = 'daily';
      } else if (dayCount < 30) {
        filterType = 'weekly';
      } else {
        filterType = 'monthly';
      }

      const trackers: any = await this.trackerModel
        .find(
          {
            vendorId: merchantId,
            createdAt: { $gte: start, $lte: end },
          },
          'createdAt amount vendorId',
        )
        .lean();

      const performers = await this.trackerModel
        .find({ vendorId: merchantId }, 'vendorId amount')
        .lean();

      const topPerformersMap: Record<string, any> = {};

      for (const performer of performers) {
        const vendorId = performer.vendorId?.toString();
        const amount = performer.amount;

        if (!topPerformersMap[vendorId]) {
          topPerformersMap[vendorId] = {
            vendorId,
            totalEarnings: 0,
            offers: {},
          };
        }

        topPerformersMap[vendorId].totalEarnings += amount;

        const offer = await this.OfferModel.findOne(
          { merchantId: vendorId },
          'name clickCount _id',
        ).lean();

        if (offer) {
          const offerId = offer._id.toString();

          if (!topPerformersMap[vendorId].offers[offerId]) {
            topPerformersMap[vendorId].offers[offerId] = {
              offerId,
              name: offer.name,
              clickCount: offer.clickCount,
              earnings: 0,
            };
          }

          topPerformersMap[vendorId].offers[offerId].earnings += amount;
        }
      }

      const analyticsData: { period: string; earnings: number }[] = [];

      if (filterType === 'daily') {
        const current = new Date(start);

        while (current <= end) {
          const next = new Date(current);
          next.setHours(23, 59, 59, 999);

          const earnings = trackers
            .filter((t) => t.createdAt >= current && t.createdAt <= next)
            .reduce((sum, t) => sum + t.amount, 0);

          analyticsData.push({
            period: current.toISOString().split('T')[0],
            earnings,
          });

          current.setDate(current.getDate() + 1);
          current.setHours(0, 0, 0, 0);
        }
      } else if (filterType === 'weekly') {
        let current = new Date(start);

        while (current <= end) {
          const weekStart = new Date(current);
          const weekEnd = new Date(current);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);

          const earnings = trackers
            .filter((t) => t.createdAt >= weekStart && t.createdAt <= weekEnd)
            .reduce((sum, t) => sum + t.amount, 0);

          analyticsData.push({
            period: `Week of ${weekStart.toDateString()} - ${weekEnd.toDateString()}`,
            earnings,
          });

          current.setDate(current.getDate() + 7);
        }
      } else {
        // Monthly
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

        const startMonth = start.getMonth();
        const startYear = start.getFullYear();
        const endMonth = end.getMonth();
        const endYear = end.getFullYear();

        const totalMonths =
          (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

        for (let i = 0; i < totalMonths; i++) {
          const month = (startMonth + i) % 12;
          const year = startYear + Math.floor((startMonth + i) / 12);

          const monthStart = new Date(year, month, 1, 0, 0, 0, 0);
          const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

          const earnings = trackers
            .filter((t) => t.createdAt >= monthStart && t.createdAt <= monthEnd)
            .reduce((sum, t) => sum + t.amount, 0);

          analyticsData.push({
            period: `${months[month]} ${year}`,
            earnings,
          });
        }
      }

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Earnings graph data retrieved successfully.',
        data: {
          filterType,
          data: analyticsData,
          topPerformers: Object.values(topPerformersMap),
        },
      };
    } catch (error) {
      console.error('Error in getEarningsGraph:', error);
      errorHandler(error);
    }
  }
}
