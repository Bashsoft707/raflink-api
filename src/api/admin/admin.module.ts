import { Module } from '@nestjs/common';
import { AdminController } from './controller/admin.controller';
import { AdminService } from './services/admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../authentication/schema';
import { Otp, OtpSchema } from '../authentication/schema/otp.schema';
import {
  ProfileView,
  ProfileViewSchema,
} from '../authentication/schema/profileViewTime.schema';
import {
  Merchant,
  MerchantSchema,
} from '../authentication/schema/merchants.schema';
import { Offer, OfferSchema } from '../offer/schema';
import {
  Raflink,
  RaflinkSchema,
} from '../authentication/schema/raflink.schema';
import { AuthModule } from '../authentication/authentication.module';
import { StripeService } from '../stripe/service/stripe.service';
import { Subscription, SubscriptionSchema } from '../subscription/schema';
import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from '../subscription/schema/subscriptionPlan.schema';
import { SubscriptionService } from '../subscription/services/subscription.service';
import { TransactionService } from '../transaction/services/transaction.service';
import { EmailService } from '../email/email.service';
import { EmailTemplateLoader } from '../email/email-template-loader';
import { Transaction, TransactionSchema } from '../transaction/schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Otp.name,
        schema: OtpSchema,
      },
      {
        name: ProfileView.name,
        schema: ProfileViewSchema,
      },
      {
        name: Merchant.name,
        schema: MerchantSchema,
      },
      {
        name: Offer.name,
        schema: OfferSchema,
      },
      {
        name: Raflink.name,
        schema: RaflinkSchema,
      },
      {
        name: Subscription.name,
        schema: SubscriptionSchema,
      },
      {
        name: SubscriptionPlan.name,
        schema: SubscriptionPlanSchema,
      },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    StripeService,
    SubscriptionService,
    TransactionService,
    EmailService,
    EmailTemplateLoader,
  ],
})
export class AdminModule {}
