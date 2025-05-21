import {
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../authentication/schema';
import { Connection, Model, Types } from 'mongoose';
import {
  Merchant,
  MerchantDocument,
} from '../../authentication/schema/merchants.schema';
import { Offer, OfferDocument } from '../../offer/schema';
import { errorHandler, formatTime } from '../../../utils';

@Injectable()
export class MerchantService {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Merchant.name)
    private readonly merchantModel: Model<MerchantDocument>,
    @InjectModel(Offer.name)
    private readonly OfferModel: Model<OfferDocument>
  ) {}

  async getDashboardAnalytics(merchantId: Types.ObjectId) {
    try {
      // Get today's date
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [clickCounts, totalOfferCount] = await Promise.all([
        this.OfferModel.find({ merchantId }, 'clickCount'),
        this.OfferModel.countDocuments({ merchantId }),
      ]);

      const totalClickCount =
        clickCounts.reduce((acc, clicks) => acc + clicks.clickCount, 0) || 0;

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Merchant dashboard overview returned successfully',
        data: { totalClickCount: totalClickCount, totalOfferCount },
        error: null,
      };
    } catch (error) {
      return errorHandler(error);
    }
  }

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
  //     const year = start.getFullYear();

  //     // Determine MongoDB group format
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

  //     if (isMonthly) {
  //       // Monthly: Iterate from January to December
  //       for (let month = 0; month < 12; month++) {
  //         const dateKey = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
  //         const dbKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  //         finalData.push({
  //           date: dateKey,
  //           count: signUpMap.get(dbKey) || 0,
  //         });
  //       }
  //     } else {
  //       // Weekly: Iterate over each day in the range
  //       let current = new Date(start);
  //       while (current <= end) {
  //         const dateKey = current.toISOString().split('T')[0]; // Format YYYY-MM-DD
  //         finalData.push({
  //           date: dateKey,
  //           count: signUpMap.get(dateKey) || 0,
  //         });
  //         current.setDate(current.getDate() + 1);
  //       }
  //     }

  //     return { filterType, data: finalData };
  //   } catch (error) {
  //     return errorHandler(error);
  //   }
  // }

  // async getViewTime(dto: GraphFilterDto) {
  //   try {
  //     const { startDate, endDate } = dto;

  //     const start = new Date(startDate);
  //     const end = new Date(endDate);
  //     end.setHours(23, 59, 59, 999);

  //     const timeDiff = Number(end) - Number(start);
  //     const dayCount = timeDiff / (1000 * 60 * 60 * 24);
  //     let filterType;

  //     if (dayCount <= 7) {
  //       filterType = 'daily';
  //     } else if (dayCount > 7 && dayCount < 30) {
  //       filterType = 'weekly';
  //     } else {
  //       filterType = 'monthly';
  //     }

  //     const profileViews: any = await this.profileViewModel.find({
  //       createdAt: { $gte: start, $lte: end },
  //     });

  //     const analyticsData: any = [];

  //     if (filterType === 'daily') {
  //       const days = Math.ceil(dayCount) + 1;

  //       for (let i = 0; i < days; i++) {
  //         const periodStart = new Date(start);
  //         periodStart.setDate(start.getDate() + i);
  //         periodStart.setHours(0, 0, 0, 0);

  //         const periodEnd = new Date(periodStart);
  //         periodEnd.setHours(23, 59, 59, 999);

  //         const filteredViews = profileViews.filter(
  //           (view) =>
  //             view.createdAt >= periodStart && view.createdAt <= periodEnd,
  //         );

  //         const viewCount = filteredViews.reduce(
  //           (acc, view) => acc + view.viewTime,
  //           0,
  //         );

  //         analyticsData.push({
  //           period: periodStart.toDateString(),
  //           viewTime: formatTime(viewCount),
  //         });
  //       }
  //     } else if (filterType === 'weekly') {
  //       const startCopy = new Date(start);
  //       const dayOfWeek = startCopy.getDay();

  //       const firstSunday = new Date(startCopy);
  //       firstSunday.setDate(startCopy.getDate() - dayOfWeek);

  //       const weekCount = Math.ceil((dayCount + dayOfWeek) / 7);

  //       for (let i = 0; i < weekCount; i++) {
  //         const weekStart = new Date(firstSunday);
  //         weekStart.setDate(firstSunday.getDate() + i * 7);
  //         weekStart.setHours(0, 0, 0, 0);

  //         const weekEnd = new Date(weekStart);
  //         weekEnd.setDate(weekStart.getDate() + 6);
  //         weekEnd.setHours(23, 59, 59, 999);

  //         const filteredViews = profileViews.filter(
  //           (view) => view.createdAt >= weekStart && view.createdAt <= weekEnd,
  //         );

  //         const viewCount = filteredViews.reduce(
  //           (acc, view) => acc + view.viewTime,
  //           0,
  //         );

  //         const weekEndFormatted = weekEnd
  //           .toDateString()
  //           .split(' ')
  //           .slice(1)
  //           .join(' ');
  //         const weekStartFormatted = weekStart
  //           .toDateString()
  //           .split(' ')
  //           .slice(1)
  //           .join(' ');

  //         analyticsData.push({
  //           period: `Week ${i + 1} - ${weekStartFormatted} - ${weekEndFormatted}`,
  //           viewTime: formatTime(viewCount),
  //         });
  //       }
  //     } else {
  //       const startMonth = start.getMonth();
  //       const startYear = start.getFullYear();
  //       const endMonth = end.getMonth();
  //       const endYear = end.getFullYear();

  //       const monthCount =
  //         (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

  //       const months = [
  //         'Jan',
  //         'Feb',
  //         'Mar',
  //         'Apr',
  //         'May',
  //         'Jun',
  //         'Jul',
  //         'Aug',
  //         'Sep',
  //         'Oct',
  //         'Nov',
  //         'Dec',
  //       ];

  //       for (let i = 0; i < monthCount; i++) {
  //         const currentMonth = (startMonth + i) % 12;
  //         const currentYear = startYear + Math.floor((startMonth + i) / 12);

  //         const monthStart = new Date(currentYear, currentMonth, 1);
  //         const monthEnd = new Date(
  //           currentYear,
  //           currentMonth + 1,
  //           0,
  //           23,
  //           59,
  //           59,
  //           999,
  //         );

  //         const filteredViews = profileViews.filter(
  //           (view) =>
  //             view.createdAt >= monthStart && view.createdAt <= monthEnd,
  //         );

  //         const viewCount = filteredViews.reduce(
  //           (acc, view) => acc + view.viewTime,
  //           0,
  //         );

  //         analyticsData.push({
  //           period: `${months[currentMonth]} ${currentYear}`,
  //           viewTime: formatTime(viewCount),
  //         });
  //       }
  //     }

  //     return {
  //       status: 'success',
  //       statusCode: HttpStatus.OK,
  //       message: 'User profile views retrieved successfully.',
  //       data: analyticsData,
  //     };
  //   } catch (error) {
  //     errorHandler(error);
  //   }
  // }

  // async getStaffs() {
  //   try {
  //     const staffs = await this.raflinkModel.find({ role: 'staff' });

  //     return {
  //       status: 'success',
  //       statusCode: HttpStatus.OK,
  //       message: 'Staffs retrieved successfully.',
  //       data: staffs,
  //     };
  //   } catch (error) {
  //     return errorHandler(error);
  //   }
  // }

  // async deleteStaff(id: Types.ObjectId) {
  //   try {
  //     const deletedStaff = await this.raflinkModel.findByIdAndDelete(id);
  //     return {
  //       status: 'success',
  //       statusCode: HttpStatus.OK,
  //       message: 'User deleted successfully.',
  //       data: null,
  //     };
  //   } catch (error) {
  //     errorHandler(error);
  //   }
  // }

  // async createUser(dto: CreateUserDto) {
  //   try {
  //     const { email } = dto;

  //     const user = await this.userModel.findOne({ email }).lean().exec();

  //     if (user) {
  //       throw new BadRequestException(
  //         `There's an existing user with this email: ${email}`,
  //       );
  //     }

  //     const newUser = await this.userModel.create(dto);

  //     if (!newUser) {
  //       throw new InternalServerErrorException('Error in creating user');
  //     }

  //     const subscriptionPlan = await this.subscriptionPlanModel
  //       .findOne({
  //         duration: 'year',
  //       })
  //       .lean()
  //       .exec();

  //     if (!subscriptionPlan) {
  //       throw new BadRequestException('Yearly subscription plan not found');
  //     }

  //     const stripeCustomerId =
  //       await this.subscriptionService.getOrCreateCustomer(newUser._id);

  //     const yearlyAmount = subscriptionPlan.price;

  //     await this.stripeService.updateCustomer(stripeCustomerId, -yearlyAmount);

  //     const subscriptionData: Stripe.SubscriptionCreateParams = {
  //       customer: stripeCustomerId,
  //       items: [{ price: subscriptionPlan.priceId }],
  //       expand: ['latest_invoice.payment_intent'],
  //     };

  //     const subscription =
  //       await this.stripeService.createSubscription(subscriptionData);

  //     if (!subscription) {
  //       throw new InternalServerErrorException(
  //         'Error in creating subscription',
  //       );
  //     }

  //     const invoice = subscription.latest_invoice as Stripe.Invoice;

  //     const invoiceUrl = invoice.hosted_invoice_url;
  //     const receiptPdf = invoice.invoice_pdf;

  //     const newSubscription = await this.subscriptionModel.create({
  //       userId: newUser._id,
  //       stripeCustomerId,
  //       stripeSubscriptionId: subscription.id,
  //       plan: subscriptionPlan._id,
  //       paymentMethodId: 'free',
  //       status: subscription.status,
  //       currentPeriodStart: new Date(subscription.current_period_start * 1000),
  //       currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  //       cancelAtPeriodEnd: subscription.cancel_at_period_end,
  //       canceledAt: subscription.canceled_at
  //         ? new Date(subscription.canceled_at * 1000)
  //         : null,
  //       trialStart: subscription.trial_start
  //         ? new Date(subscription.trial_start * 1000)
  //         : null,
  //       trialEnd: subscription.trial_end
  //         ? new Date(subscription.trial_end * 1000)
  //         : null,
  //       metadata: {
  //         priceId: subscriptionPlan.priceId,
  //       },
  //       amountPaid: 0,
  //       invoiceUrl,
  //       receiptPdf,
  //     });

  //     if (!newSubscription) {
  //       throw new InternalServerErrorException(
  //         'Error in creating subscription',
  //       );
  //     }

  //     const transactionPayload = {
  //       userId: newUser._id,
  //       amount: 0,
  //       description: 'Payment for user susbcription',
  //       transactionType: 'subscription',
  //       currency: subscriptionPlan.currency,
  //       transactionRef: randomUUID(),
  //       transactionDate: new Date(),
  //       status: TransactionStatus.SUCCESS,
  //       invoiceUrl,
  //       receiptPdf,
  //     };

  //     await this.transactionService.createTransaction(transactionPayload);

  //     return {
  //       status: 'success',
  //       statusCode: HttpStatus.CREATED,
  //       message: 'User created and subscription activated successfully.',
  //       data: { user: newUser, subscription: newSubscription },
  //       error: null,
  //     };
  //   } catch (error) {
  //     return errorHandler(error);
  //   }
  // }

  // async getSubscribers() {
  //   try {
  //     const subscribers = await this.subscriptionModel
  //       .find({
  //         status: SubscriptionStatus.ACTIVE,
  //       })
  //       .populate('userId', 'displayName username')
  //       .lean()
  //       .exec();

  //     return {
  //       status: 'success',
  //       statusCode: HttpStatus.OK,
  //       message: 'Subscribers retrieved successfully.',
  //       data: subscribers,
  //     };
  //   } catch (error) {
  //     return errorHandler(error);
  //   }
  // }

  // async getSubscriptionAnalytics() {
  //   try {
  //     const [plans, paidSub, freeSub] = await Promise.all([
  //       this.subscriptionPlanModel.countDocuments({}),
  //       this.subscriptionModel.countDocuments({
  //         status: SubscriptionStatus.ACTIVE,
  //         amountPaid: { $gt: 0 },
  //       }),
  //       this.subscriptionModel.countDocuments({
  //         status: SubscriptionStatus.ACTIVE,
  //         paymentMethodId: 'free',
  //       }),
  //     ]);

  //     return {
  //       status: 'success',
  //       statusCode: HttpStatus.OK,
  //       message: 'Subscription analytics retrieved successfully.',
  //       data: { plans, paidSub, freeSub },
  //     };
  //   } catch (error) {
  //     return errorHandler(error);
  //   }
  // }

  // private getModel(type: string): Model<any> {
  //   if (type === 'user') return this.userModel;
  //   if (type === 'merchant') return this.merchantModel;
  //   throw new BadRequestException('Invalid type provided');
  // }

  // async getEntities(type: 'user' | 'merchant', query: UserFilterDto) {
  //   try {
  //     const { name, page = 1, limit = 10 } = query;
  //     const skip = (page - 1) * limit;

  //     const filter: Record<string, any> = {};
  //     if (name) {
  //       filter.displayName = new RegExp(name, 'i');
  //     }

  //     const Model = this.getModel(type);

  //     const [totalCount, entities] = await Promise.all([
  //       Model.countDocuments(filter),
  //       Model.find(filter, '-__v -refreshToken').skip(skip).limit(limit).lean(),
  //     ]);

  //     let enrichedEntities = entities;

  //     if (type === 'user') {
  //       const userIds = entities.map((entity) => entity._id);

  //       const linkCounts = await this.linkModel.aggregate([
  //         { $match: { userId: { $in: userIds } } },
  //         { $group: { _id: '$userId', count: { $sum: 1 } } },
  //       ]);

  //       const linkCountMap = new Map<string, number>();
  //       linkCounts.forEach(({ _id, count }) => {
  //         linkCountMap.set(_id.toString(), count);
  //       });

  //       const subscriptions = await this.subscriptionModel
  //         .find({ userId: { $in: userIds } }, 'userId status plan')
  //         .populate('plan', 'name')
  //         .lean()
  //         .exec();

  //       const subscriptionMap = new Map<string, any>();
  //       subscriptions.forEach((sub) => {
  //         subscriptionMap.set(sub.userId.toString(), sub);
  //       });

  //       enrichedEntities = entities.map((entity: any) => ({
  //         ...entity,
  //         linkCount: linkCountMap.get(entity._id.toString()) || 0,
  //         subscription: subscriptionMap.get(entity._id.toString()) || null,
  //       }));
  //     }

  //     return {
  //       status: 'success',
  //       statusCode: HttpStatus.OK,
  //       message: `${type.charAt(0).toUpperCase() + type.slice(1)}s retrieved successfully.`,
  //       data: {
  //         data: enrichedEntities,
  //         total: totalCount,
  //         page,
  //         limit,
  //       },
  //     };
  //   } catch (error) {
  //     return errorHandler(error);
  //   }
  // }

  // async getEntityAnalytics(type: 'user' | 'merchant') {
  //   try {
  //     const model = this.getModel(type);
  //     const total = await model.countDocuments();

  //     const users = await model.find({}, '_id').lean();
  //     const userIds = users.map((u) => u._id);

  //     const userQuery =
  //       type === 'user'
  //         ? { userId: { $in: userIds } }
  //         : { merchantId: { $in: userIds } };

  //     const [offers, closedDeals, earnings] = await Promise.all([
  //       this.OfferModel.countDocuments(userQuery),
  //       this.linkModel.countDocuments({
  //         userId: { $in: userIds },
  //       }),
  //       this.linkModel.aggregate([
  //         { $match: { userId: { $in: userIds } } },
  //         { $group: { _id: null, total: { $sum: '$earning' } } },
  //       ]),
  //     ]);

  //     return {
  //       status: 'success',
  //       statusCode: HttpStatus.OK,
  //       message: `${type} analytics fetched successfully.`,
  //       data: {
  //         [`${type}s`]: total,
  //         offers,
  //         closedDeals,
  //         earnings: earnings[0]?.total || 0,
  //       },
  //     };
  //   } catch (error) {
  //     return errorHandler(error);
  //   }
  // }

  // async getEntityDetails(id: string) {
  //   try {
  //     const user =
  //       (await this.userModel.findById(id, '-__v -refreshToken').lean()) ||
  //       (await this.merchantModel.findById(id, '-__v -refreshToken').lean());

  //     if (!user) throw new NotFoundException('User not found');

  //     const links = await this.linkModel.find({ userId: id }, '-userId').lean();
  //     const subscription = await this.subscriptionModel
  //       .findOne({ userId: id }, 'status plan')
  //       .populate('plan', 'name')
  //       .lean()
  //       .exec();

  //     return {
  //       status: 'success',
  //       statusCode: HttpStatus.OK,
  //       message: 'User retrieved successfully.',
  //       data: { user, links, subscription },
  //     };
  //   } catch (error) {
  //     return errorHandler(error);
  //   }
  // }

  // async toggleEntityStatus(id: string, isActive: boolean) {
  //   try {
  //     const updatedUser =
  //       (await this.userModel.findByIdAndUpdate(
  //         id,
  //         { isActive },
  //         { new: true },
  //       )) ||
  //       (await this.merchantModel.findByIdAndUpdate(
  //         id,
  //         { isActive },
  //         { new: true },
  //       ));

  //     if (!updatedUser) {
  //       throw new InternalServerErrorException(
  //         'Error in activating or deactivating user',
  //       );
  //     }

  //     return {
  //       status: 'success',
  //       statusCode: HttpStatus.OK,
  //       message: `User ${isActive ? 'activated' : 'deactivated'} successfully.`,
  //       data: updatedUser,
  //     };
  //   } catch (error) {
  //     return errorHandler(error);
  //   }
  // }
}
