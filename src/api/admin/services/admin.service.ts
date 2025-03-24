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
  async getDashboardAnalytics() {
    // const analytics = google.analyticsreporting_v4({
    //   version: 'v4',
    //   auth,
    // });

    // const response = await analytics.reports.batchGet({
    //   requestBody: {
    //     reportRequests: [
    //       {
    //         viewId: 'YOUR_VIEW_ID', // Replace with your GA4 View ID
    //         dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    //         metrics: [{ expression: 'ga:activeUsers' }],
    //       },
    //     ],
    //   },
    // });

    const [userCount, merchantCount, offerCount] = await Promise.all([
      this.userModel.countDocuments(),
      this.merchantModel.countDocuments(),
      this.OfferModel.countDocuments(),
    ]);

    const responseData = { userCount, merchantCount, offerCount };

    return responseData;
  }
}
