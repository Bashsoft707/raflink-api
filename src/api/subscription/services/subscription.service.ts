import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Stripe from 'stripe';
import { SubscriptionPlan, SubscriptionStatus } from '../../../constants';
import { User } from '../../authentication/schema';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from '../dto';
import { Subscription } from '../schema';
import { StripeService } from 'src/api/stripe/service/stripe.service';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(StripeService) private readonly stripeService: StripeService,
  ) {}

  async createCustomer(userId: Types.ObjectId): Promise<string> {
    try {
      const user = await this.userModel.findById(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const customer = await this.stripeService.createCustomer(
        user.email,
        user.username || user.email,
        user.id,
      );

      await this.userModel.findByIdAndUpdate(userId, {
        stripeCustomerId: customer.id,
      });

      return customer.id;
    } catch (error) {
      throw new Error(`Failed to create Stripe customer: ${error.message}`);
    }
  }

  async getOrCreateCustomer(userId: string): Promise<string> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    return this.createCustomer(new Types.ObjectId(userId));
  }

  async createSubscription(
    userId: string,
    dto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    const { paymentMethodId, planId, coupon } = dto;

    const stripeCustomerId = await this.getOrCreateCustomer(userId);

    try {
      // Attach payment method to customer
      await this.stripeService.attachPaymentMethod(
        paymentMethodId,
        stripeCustomerId,
      );

      // Set as default payment method
      await this.stripeService.setDefaultPaymentMethod(
        stripeCustomerId,
        paymentMethodId,
      );

      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: stripeCustomerId,
        items: [{ price: planId }],
        expand: ['latest_invoice.payment_intent'],
      };

      if (coupon) {
        subscriptionData.coupon = coupon;
      }

      const subscription =
        await this.stripeService.createSubscription(subscriptionData);

      // Store subscription in database
      const newSubscription = new this.subscriptionModel({
        userId,
        stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        plan: SubscriptionPlan.PRO,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at,
        trialStart: subscription.trial_start
          ? new Date(subscription.trial_start * 1000)
          : null,
        trialEnd: subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : null,
        metadata: {
          priceId: planId,
        },
      });

      return newSubscription.save();
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  async cancelSubscription(
    userId: string,
    cancelImmediately = false,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionModel.findOne({
      userId,
      status: SubscriptionStatus.ACTIVE,
    });

    if (!subscription) {
      throw new NotFoundException('Active subscription not found');
    }

    try {
      const cancelParams: Stripe.SubscriptionCancelParams = {};
      if (!cancelImmediately) {
        cancelParams.prorate = false;
      }

      const canceledSubscription = await this.stripeService.cancelSubscription(
        subscription.stripeSubscriptionId,
        cancelParams,
      );

      subscription.status = canceledSubscription.status as SubscriptionStatus;
      subscription.cancelAtPeriodEnd =
        canceledSubscription.cancel_at_period_end;
      subscription.canceledAt = new Date(
        Number(canceledSubscription?.canceled_at) * 1000,
      );

      return subscription.save();
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  async updateSubscription(
    userId: string,
    dto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    const { newPlanId } = dto;
    const subscription = await this.subscriptionModel.findOne({
      userId,
      status: SubscriptionStatus.ACTIVE,
    });

    if (!subscription) {
      throw new NotFoundException('Active subscription not found');
    }

    try {
      const updatedSubscription = await this.stripeService.updateSubscription(
        subscription.stripeSubscriptionId,
        newPlanId,
      );

      subscription.plan = SubscriptionPlan.PRO;
      subscription.currentPeriodEnd = new Date(
        updatedSubscription.current_period_end * 1000,
      );
      subscription.metadata = {
        ...subscription.metadata,
        priceId: newPlanId,
      };

      return subscription.save();
    } catch (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.updateSubscriptionFromWebhook(
          event.data.object as Stripe.Subscription,
        );
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCanceled(
          event.data.object as Stripe.Subscription,
        );
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice,
        );
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(
          event.data.object as Stripe.Invoice,
        );
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async updateSubscriptionFromWebhook(
    stripeSubscription: Stripe.Subscription,
  ): Promise<void> {
    const subscription = await this.subscriptionModel.findOne({
      stripeSubscriptionId: stripeSubscription.id,
    });

    if (!subscription) {
      // Log that webhook was received for non-existent subscription
      console.log(
        `Webhook received for non-existent subscription: ${stripeSubscription.id}`,
      );
      return;
    }

    subscription.status = stripeSubscription.status as SubscriptionStatus;
    subscription.currentPeriodStart = new Date(
      stripeSubscription.current_period_start * 1000,
    );
    subscription.currentPeriodEnd = new Date(
      stripeSubscription.current_period_end * 1000,
    );
    subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;

    if (stripeSubscription.canceled_at) {
      subscription.canceledAt = new Date(stripeSubscription.canceled_at * 1000);
    }

    await subscription.save();
  }

  private async handleSubscriptionCanceled(
    stripeSubscription: Stripe.Subscription,
  ): Promise<void> {
    await this.subscriptionModel.findOneAndUpdate(
      { stripeSubscriptionId: stripeSubscription.id },
      {
        status: SubscriptionStatus.CANCELED,
        canceledAt: stripeSubscription.canceled_at
          ? new Date(stripeSubscription.canceled_at * 1000)
          : null,
      },
    );
  }

  private async handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    if (!invoice.subscription) return;

    await this.subscriptionModel.findOneAndUpdate(
      { stripeSubscriptionId: invoice.subscription as string },
      { status: SubscriptionStatus.ACTIVE },
    );
  }

  private async handleInvoicePaymentFailed(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    if (!invoice.subscription) return;

    await this.subscriptionModel.findOneAndUpdate(
      { stripeSubscriptionId: invoice.subscription as string },
      { status: SubscriptionStatus.PAST_DUE },
    );
  }

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    return this.subscriptionModel.findOne({ userId }).lean().exec();
  }

  async listAllSubscriptions(
    limit = 10,
    page = 1,
  ): Promise<{ subscriptions: Subscription[]; total: number }> {
    const skip = (page - 1) * limit;
    const [subscriptions, total] = await Promise.all([
      this.subscriptionModel.find().skip(skip).limit(limit).exec(),
      this.subscriptionModel.countDocuments(),
    ]);

    return { subscriptions, total };
  }
}
