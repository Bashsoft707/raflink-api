import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: User.name, schema: UserSchema },
      { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, StripeService, TransactionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
