import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import * as google from 'googleapis';
import { User, UserDocument } from '../../authentication/schema';
import { Model } from 'mongoose';
import {
  Merchant,
  MerchantDocument,
} from '../../authentication/schema/merchants.schema';
import { Offer, OfferDocument } from '../../offer/schema';
import { GraphFilterDto } from '../../links/dtos';
import { errorHandler } from '../../../utils';

// const credentials = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));

// const auth = new google.auth.GoogleAuth({
//   credentials,
//   scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
// });

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Merchant.name)
    private readonly merchantModel: Model<MerchantDocument>,
    @InjectModel(Offer.name)
    private readonly OfferModel: Model<OfferDocument>,
  ) {}
  // async getDashboardAnalytics() {
  //   // const analytics = google.analyticsreporting_v4({
  //   //   version: 'v4',
  //   //   auth,
  //   // });

  //   // const response = await analytics.reports.batchGet({
  //   //   requestBody: {
  //   //     reportRequests: [
  //   //       {
  //   //         viewId: 'YOUR_VIEW_ID', // Replace with your GA4 View ID
  //   //         dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
  //   //         metrics: [{ expression: 'ga:activeUsers' }],
  //   //       },
  //   //     ],
  //   //   },
  //   // });

  //   try {
  //     const [userCount, merchantCount, offerCount] = await Promise.all([
  //       this.userModel.countDocuments(),
  //       this.merchantModel.countDocuments(),
  //       this.OfferModel.countDocuments(),
  //     ]);

  //     const responseData = { userCount, merchantCount, offerCount };

  //     return responseData;
  //   } catch (error) {
  //     errorHandler(error);
  //   }
  // }

  // async getDashboardAnalyticsGraph(query: GraphFilterDto) {
  //   try {
  //     const { startDate, endDate } = query;

  //     const start = new Date(startDate);
  //     const end = new Date(endDate);
  //     end.setHours(23, 59, 59, 999); // Last millisecond of the day

  //     const timeDiff = Number(end) - Number(start);
  //     const dayCount = timeDiff / (1000 * 60 * 60 * 24);

  //     let filterType: 'weekly' | 'monthly';
  //     let groupByFormat: string;

  //     if (dayCount >= 30) {
  //       filterType = 'monthly';
  //       groupByFormat = '%Y-%m'; // Group by month
  //     } else {
  //       filterType = 'weekly';
  //       groupByFormat = '%Y-%m-%d'; // Group by day
  //     }

  //     // Function to fetch signups
  //     const getSignUps = async (model: any) => {
  //       return await model.aggregate([
  //         {
  //           $match: {
  //             createdAt: { $gte: start, $lte: end },
  //           },
  //         },
  //         {
  //           $group: {
  //             _id: {
  //               $dateToString: { format: groupByFormat, date: '$createdAt' },
  //             },
  //             count: { $sum: 1 },
  //           },
  //         },
  //         { $sort: { _id: 1 } },
  //       ]);
  //     };

  //     // Fetch signups
  //     const userSignUps = await getSignUps(this.userModel);
  //     const merchantSignUps = await getSignUps(this.merchantModel);

  //     // Combine results into a map
  //     const signUpMap = new Map();
  //     [...userSignUps, ...merchantSignUps].forEach(({ _id, count }) => {
  //       signUpMap.set(_id, (signUpMap.get(_id) || 0) + count);
  //     });

  //     let finalData: { date: string; count: number }[] = [];

  //     if (filterType === 'weekly') {
  //       let allDates: string[] = [];
  //       let current = new Date(start);

  //       while (current <= end) {
  //         allDates.push(current.toISOString().split('T')[0]); // YYYY-MM-DD format
  //         current.setDate(current.getDate() + 1);
  //       }

  //       finalData = allDates.map((date) => ({
  //         date,
  //         count: signUpMap.get(date) || 0, // Default to 0 if no data
  //       }));
  //     } else {
  //       let allMonths: string[] = [];
  //       let current = new Date(start);
  //       current.setDate(1); // Start at the first of the month

  //       while (current <= end) {
  //         allMonths.push(
  //           `${current.toLocaleString('default', { month: 'long' })} ${current.getFullYear()}`,
  //         );
  //         current.setMonth(current.getMonth() + 1);
  //       }

  //       finalData = allMonths.map((month, index) => {
  //         const [monthName, year] = month.split(' ');
  //         const monthIndex =
  //           new Date(Date.parse(`${monthName} 1, 2000`)).getMonth() + 1;

  //         return {
  //           date: month,
  //           count:
  //             signUpMap.get(`${year}-${String(monthIndex).padStart(2, '0')}`) ||
  //             0,
  //         };
  //       });
  //     }

  //     return { filterType, data: finalData };
  //   } catch (error) {
  //     errorHandler(error);
  //   }
  // }

  // async getDashboardAnalyticsGraph(query: GraphFilterDto) {
  //   try {
  //     const { startDate, endDate } = query;
  //     const start = new Date(startDate);
  //     const end = new Date(endDate);
  //     end.setHours(23, 59, 59, 999);

  //     const dayCount =
  //       (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

  //     const isMonthly = dayCount >= 30;
  //     const filterType = isMonthly ? 'monthly' : 'weekly';
  //     const groupByFormat = isMonthly ? '%Y-%m' : '%Y-%m-%d';

  //     // Function to fetch signups
  //     const getSignUps = async (model: any) => {
  //       return model.aggregate([
  //         { $match: { createdAt: { $gte: start, $lte: end } } },
  //         {
  //           $group: {
  //             _id: {
  //               $dateToString: { format: groupByFormat, date: '$createdAt' },
  //             },
  //             count: { $sum: 1 },
  //           },
  //         },
  //         { $sort: { _id: 1 } },
  //       ]);
  //     };

  //     // Fetch signups
  //     const [userSignUps, merchantSignUps] = await Promise.all([
  //       getSignUps(this.userModel),
  //       getSignUps(this.merchantModel),
  //     ]);

  //     // Merge signup counts
  //     const signUpMap = new Map<string, number>();
  //     for (const { _id, count } of [...userSignUps, ...merchantSignUps]) {
  //       signUpMap.set(_id, (signUpMap.get(_id) || 0) + count);
  //     }

  //     // Generate final data points
  //     let finalData: { date: string; count: number }[] = [];
  //     let current = new Date(start);

  //     if (isMonthly) {
  //       current.setDate(1);
  //       while (current <= end) {
  //         const dateKey = `${current.toLocaleString('default', { month: 'long' })} ${current.getFullYear()}`;
  //         finalData.push({
  //           date: dateKey,
  //           count:
  //             signUpMap.get(
  //               `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
  //             ) || 0,
  //         });
  //         current.setMonth(current.getMonth() + 1);
  //       }
  //     } else {
  //       while (current <= end) {
  //         const dateKey = current.toISOString().split('T')[0];
  //         finalData.push({ date: dateKey, count: signUpMap.get(dateKey) || 0 });
  //         current.setDate(current.getDate() + 1);
  //       }
  //     }

  //     return { filterType, data: finalData };
  //   } catch (error) {
  //     return errorHandler(error);
  //   }
  // }

  // async getDashboardAnalyticsGraph(query: GraphFilterDto) {
  //   try {
  //     const { startDate, endDate } = query;
  //     const start = new Date(startDate);
  //     const end = new Date(endDate);
  //     end.setHours(23, 59, 59, 999);

  //     const year = start.getFullYear(); // Get the year from startDate
  //     const isMonthly = true; // Always returning monthly data
  //     const groupByFormat = '%Y-%m';

  //     // Function to fetch signups
  //     const getSignUps = async (model: any) => {
  //       return model.aggregate([
  //         {
  //           $match: {
  //             createdAt: {
  //               $gte: new Date(`${year}-01-01`),
  //               $lte: new Date(`${year}-12-31T23:59:59.999Z`),
  //             },
  //           },
  //         },
  //         {
  //           $group: {
  //             _id: {
  //               $dateToString: { format: groupByFormat, date: '$createdAt' },
  //             },
  //             count: { $sum: 1 },
  //           },
  //         },
  //         { $sort: { _id: 1 } },
  //       ]);
  //     };

  //     // Fetch signups
  //     const [userSignUps, merchantSignUps] = await Promise.all([
  //       getSignUps(this.userModel),
  //       getSignUps(this.merchantModel),
  //     ]);

  //     // Merge signup counts
  //     const signUpMap = new Map<string, number>();
  //     for (const { _id, count } of [...userSignUps, ...merchantSignUps]) {
  //       signUpMap.set(_id, (signUpMap.get(_id) || 0) + count);
  //     }

  //     // Generate final data points for all 12 months
  //     let finalData: { date: string; count: number }[] = [];
  //     for (let month = 0; month < 12; month++) {
  //       const dateKey = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
  //       const dbKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  //       finalData.push({
  //         date: dateKey,
  //         count: signUpMap.get(dbKey) || 0,
  //       });
  //     }

  //     return { filterType: 'monthly', data: finalData };
  //   } catch (error) {
  //     return errorHandler(error);
  //   }
  // }

  async getDashboardAnalytics() {
    try {
      // Get today's date
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [todayUserCount, todayMerchantCount, todayOfferCount] =
        await Promise.all([
          this.userModel.countDocuments({ createdAt: { $gte: todayStart } }),
          this.merchantModel.countDocuments({
            createdAt: { $gte: todayStart },
          }),
          this.OfferModel.countDocuments({ createdAt: { $gte: todayStart } }),
        ]);

      console.log(todayUserCount);
      console.log(todayMerchantCount);
      console.log(todayOfferCount);

      // Get yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      // Fetch yesterday's counts
      const [yesterdayUserCount, yesterdayMerchantCount, yesterdayOfferCount] =
        await Promise.all([
          this.userModel.countDocuments({
            createdAt: {
              $gte: new Date(yesterday.getTime() - 86400000),
              $lte: yesterday,
            },
          }),
          this.merchantModel.countDocuments({
            createdAt: {
              $gte: new Date(yesterday.getTime() - 86400000),
              $lte: yesterday,
            },
          }),
          this.OfferModel.countDocuments({
            createdAt: {
              $gte: new Date(yesterday.getTime() - 86400000),
              $lte: yesterday,
            },
          }),
        ]);

      console.log(yesterdayUserCount);
      console.log(yesterdayMerchantCount);
      console.log(yesterdayOfferCount);

      // Fetch total counts
      const [totalUserCount, totalMerchantCount, totalOfferCount] =
        await Promise.all([
          this.userModel.countDocuments(),
          this.merchantModel.countDocuments(),
          this.OfferModel.countDocuments(),
        ]);

      // Function to calculate percentage increase
      const calculatePercentageIncrease = (
        today: number,
        yesterday: number,
      ) => {
        if (yesterday === 0) return today > 0 ? 100 : 0; // Avoid division by zero
        return ((today - yesterday) / yesterday) * 100;
      };

      // Compute percentage increases
      const userGrowth = calculatePercentageIncrease(
        todayUserCount,
        yesterdayUserCount,
      );
      const merchantGrowth = calculatePercentageIncrease(
        todayMerchantCount,
        yesterdayMerchantCount,
      );
      const offerGrowth = calculatePercentageIncrease(
        todayOfferCount,
        yesterdayOfferCount,
      );

      return {
        totalUsers: totalUserCount,
        userGrowth: userGrowth.toFixed(2) + '%',

        totalMerchants: totalMerchantCount,
        merchantGrowth: merchantGrowth.toFixed(2) + '%',

        totalOffers: totalOfferCount,
        offerGrowth: offerGrowth.toFixed(2) + '%',
      };
    } catch (error) {
      return errorHandler(error);
    }
  }

  // async getDashboardAnalytics() {
  //   try {
  //     // Get today's start & end time
  //     const today = new Date();
  //     today.setHours(0, 0, 0, 0);

  //     const yesterday = new Date(today);
  //     yesterday.setDate(yesterday.getDate() - 1);

  //     // Fetch total counts
  //     const [totalUserCount, totalMerchantCount, totalOfferCount] =
  //       await Promise.all([
  //         this.userModel.countDocuments(),
  //         this.merchantModel.countDocuments(),
  //         this.OfferModel.countDocuments(),
  //       ]);

  //     // Fetch yesterday's counts correctly
  //     const [yesterdayUserCount, yesterdayMerchantCount, yesterdayOfferCount] =
  //       await Promise.all([
  //         this.userModel.countDocuments({
  //           createdAt: { $gte: yesterday, $lt: today },
  //         }),
  //         this.merchantModel.countDocuments({
  //           createdAt: { $gte: yesterday, $lt: today },
  //         }),
  //         this.OfferModel.countDocuments({
  //           createdAt: { $gte: yesterday, $lt: today },
  //         }),
  //       ]);

  //     // Function to calculate percentage increase
  //     // const calculatePercentageIncrease = (
  //     //   total: number,
  //     //   yesterday: number,
  //     // ) => {
  //     //   if (yesterday === 0) return total > 0 ? 100 : 0; // Avoid division by zero
  //     //   return ((total - yesterday) / yesterday) * 100;
  //     // };

  //     const calculatePercentageIncrease = (
  //       total: number,
  //       yesterday: number,
  //     ) => {
  //       if (yesterday === 0) return total > 0 ? 'N/A' : '0%'; // Avoid infinite growth
  //       return (((total - yesterday) / yesterday) * 100).toFixed(2) + '%';
  //     };

  //     // Compute percentage increases
  //     const userGrowth = calculatePercentageIncrease(
  //       totalUserCount,
  //       yesterdayUserCount,
  //     );
  //     const merchantGrowth = calculatePercentageIncrease(
  //       totalMerchantCount,
  //       yesterdayMerchantCount,
  //     );
  //     const offerGrowth = calculatePercentageIncrease(
  //       totalOfferCount,
  //       yesterdayOfferCount,
  //     );

  //     return {
  //       totalUsers: totalUserCount,
  //       userGrowth: userGrowth.toFixed(2) + '%',

  //       totalMerchants: totalMerchantCount,
  //       merchantGrowth: merchantGrowth.toFixed(2) + '%',

  //       totalOffers: totalOfferCount,
  //       offerGrowth: offerGrowth.toFixed(2) + '%',
  //     };
  //   } catch (error) {
  //     return errorHandler(error);
  //   }
  // }

  async getDashboardAnalyticsGraph(query: GraphFilterDto) {
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

      // Determine MongoDB group format
      const groupByFormat = isMonthly ? '%Y-%m' : '%Y-%m-%d';

      // Function to fetch signups
      const getSignUps = async (model: any) => {
        return model.aggregate([
          { $match: { createdAt: { $gte: start, $lte: end } } },
          {
            $group: {
              _id: {
                $dateToString: { format: groupByFormat, date: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);
      };

      // Fetch signups
      const [userSignUps, merchantSignUps] = await Promise.all([
        getSignUps(this.userModel),
        getSignUps(this.merchantModel),
      ]);

      // Merge signup counts
      const signUpMap = new Map<string, number>();
      for (const { _id, count } of [...userSignUps, ...merchantSignUps]) {
        signUpMap.set(_id, (signUpMap.get(_id) || 0) + count);
      }

      // Generate final data points
      let finalData: { date: string; count: number }[] = [];

      if (isMonthly) {
        // Monthly: Iterate from January to December
        for (let month = 0; month < 12; month++) {
          const dateKey = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
          const dbKey = `${year}-${String(month + 1).padStart(2, '0')}`;

          finalData.push({
            date: dateKey,
            count: signUpMap.get(dbKey) || 0,
          });
        }
      } else {
        // Weekly: Iterate over each day in the range
        let current = new Date(start);
        while (current <= end) {
          const dateKey = current.toISOString().split('T')[0]; // Format YYYY-MM-DD
          finalData.push({
            date: dateKey,
            count: signUpMap.get(dateKey) || 0,
          });
          current.setDate(current.getDate() + 1);
        }
      }

      return { filterType, data: finalData };
    } catch (error) {
      return errorHandler(error);
    }
  }
}
