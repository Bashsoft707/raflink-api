import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { SubscriptionPlan, SubscriptionStatus } from '../../../constants';
import { User } from '../../authentication/schema';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from '../dto';
import { Subscription } from '../schema';

@Injectable()
export class SubscriptionService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2023-10-16',
      },
    );
  }

  async createCustomer(
    userId: string,
    email: string,
    name: string,
  ): Promise<string> {
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: { userId },
    });

    // Update user with stripe customer ID
    await this.userModel.findByIdAndUpdate(userId, {
      stripeCustomerId: customer.id,
    });

    return customer.id;
  }

  async getOrCreateCustomer(userId: string): Promise<string> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    return this.createCustomer(userId, user.email, user.name || user.email);
  }

  async createSubscription(
    userId: string,
    dto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    const { paymentMethodId, planId, coupon } = dto;

    // Get or create stripe customer
    const stripeCustomerId = await this.getOrCreateCustomer(userId);

    // Attach payment method to customer
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    // Set as default payment method
    await this.stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const subscriptionData: Stripe.SubscriptionCreateParams = {
      customer: stripeCustomerId,
      items: [{ price: planId }],
      expand: ['latest_invoice.payment_intent'],
    };

    if (coupon) {
      subscriptionData.coupon = coupon;
    }

    // Create subscription
    const subscription =
      await this.stripe.subscriptions.create(subscriptionData);

    // Store subscription in database
    const newSubscription = new this.subscriptionModel({
      userId,
      stripeCustomerId,
      stripeSubscriptionId: subscription.id,
      plan: SubscriptionPlan.PRO, // Based on price ID logic
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
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

    const cancelParams: Stripe.SubscriptionCancelParams = {};
    if (!cancelImmediately) {
      cancelParams.prorate = false;
    }

    const canceledSubscription = await this.stripe.subscriptions.cancel(
      subscription.stripeSubscriptionId,
      cancelParams,
    );

    subscription.status = canceledSubscription.status as SubscriptionStatus;
    subscription.cancelAtPeriodEnd = canceledSubscription.cancel_at_period_end;
    subscription.canceledAt = new Date(canceledSubscription.canceled_at * 1000);

    return subscription.save();
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

    const updatedSubscription = await this.stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        items: [
          {
            id: (
              await this.stripe.subscriptions.retrieve(
                subscription.stripeSubscriptionId,
              )
            ).items.data[0].id,
            price: newPlanId,
          },
        ],
        proration_behavior: 'create_prorations',
      },
    );

    subscription.plan = SubscriptionPlan.PRO; // Based on price ID logic
    subscription.currentPeriodEnd = new Date(
      updatedSubscription.current_period_end * 1000,
    );
    subscription.metadata = {
      ...subscription.metadata,
      priceId: newPlanId,
    };

    return subscription.save();
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
        canceledAt: new Date(stripeSubscription.canceled_at * 1000),
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

  async getUserSubscription(userId: string): Promise<Subscription> {
    return this.subscriptionModel.findOne({ userId }).exec();
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
