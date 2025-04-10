import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SubscriptionService } from './services/subscription.service';
import { SubscriptionController } from './controllers/subscription.controller';
import { Subscription, SubscriptionSchema } from './schema';
import { User, UserSchema } from '../authentication/schema';
import { StripeService } from '../stripe/service/stripe.service';
import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from './schema/subscriptionPlan.schema';
import { TransactionService } from '../transaction/services/transaction.service';
import { Transaction, TransactionSchema } from '../transaction/schema';
import { AuthModule } from '../authentication/authentication.module';
import { EmailService } from '../email/email.service';
import { EmailTemplateLoader } from '../email/email-template-loader';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: User.name, schema: UserSchema },
      { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    AuthModule,
  ],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    StripeService,
    TransactionService,
    EmailService,
    EmailTemplateLoader,
    ConfigService,
  ],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
