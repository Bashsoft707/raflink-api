import {
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Stripe from 'stripe';
import { SubscriptionStatus, TransactionStatus } from '../../../constants';
import { User } from '../../authentication/schema';
import {
  CreateSubscriptionDto,
  CreateSubscriptionPlanDto,
  UpdateSubscriptionDto,
  UpdateSubscriptionPlanDto,
} from '../dto';
import { Subscription } from '../schema';
import { StripeService } from '../../stripe/service/stripe.service';
import { SubscriptionPlan as SubscriptionPlanModel } from '../schema/subscriptionPlan.schema';
import { Pagination } from '../../../common/dto/pagination.dto';
import { errorHandler } from '../../../utils';
import { TransactionService } from '../../transaction/services/transaction.service';
import { randomUUID } from 'crypto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(StripeService) private readonly stripeService: StripeService,
    @Inject(TransactionService)
    private readonly transactionService: TransactionService,
    @InjectModel(SubscriptionPlanModel.name)
    private subscriptionPlanModel: Model<SubscriptionPlanModel>,
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
        String(user._id),
      );

      await this.userModel.findByIdAndUpdate(userId, {
        stripeCustomerId: customer.id,
      });

      return customer.id;
    } catch (error) {
      throw new Error(`Failed to create Stripe customer: ${error.message}`);
    }
  }

  async getOrCreateCustomer(userId: Types.ObjectId): Promise<string> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    return this.createCustomer(new Types.ObjectId(userId));
  }

  async createSubscriptionPlan(dto: CreateSubscriptionPlanDto) {
    try {
      const { name, price, duration, currency, benefits, oldPrice } = dto;

      const existingPlan = await this.subscriptionPlanModel
        .findOne({
          name,
        })
        .lean()
        .exec();

      if (existingPlan) {
        throw new NotFoundException(
          'Subscription plan with this name already exists',
        );
      }

      const plan = await this.stripeService.createSubPrice({
        name,
        currency,
        price,
        duration,
      });

      const newPlan = await this.subscriptionPlanModel.create({
        name,
        priceId: plan.id,
        price,
        oldPrice,
        duration,
        currency,
        benefits,
        active: true,
      });

      if (!newPlan) {
        throw new InternalServerErrorException(
          'Failed to create subscription plan',
        );
      }

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Subscription plan created successfully',
        data: newPlan,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async getSubscriptionPlans() {
    try {
      const plans = await this.subscriptionPlanModel.find().lean().exec();

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Subscription plans retrieved successfully',
        data: plans,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async updateSubscriptionPlan(id: string, dto: UpdateSubscriptionPlanDto) {
    try {
      const { name, benefits } = dto;

      const existingPlan = await this.subscriptionPlanModel
        .findOne({ _id: id })
        .lean()
        .exec();

      if (!existingPlan) {
        throw new NotFoundException('Subscription plan does not exist');
      }

      const plan = await this.stripeService.editSubPrice(existingPlan.priceId, {
        name: name || existingPlan.name,
      });

      const updatedPlan = await this.subscriptionPlanModel.findOneAndUpdate(
        { _id: id },
        {
          name: name || existingPlan.name,
          benefits,
        },
        { new: true },
      );

      if (!updatedPlan) {
        throw new InternalServerErrorException(
          'Failed to update subscription plan',
        );
      }

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Subscription plan updated successfully',
        data: updatedPlan,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async deleteSubscriptionPlan(id: string) {
    try {
      const existingPlan = await this.subscriptionPlanModel
        .findOne({ _id: id })
        .lean()
        .exec();

      if (!existingPlan) {
        throw new NotFoundException('Subscription plan does not exist');
      }

      await this.stripeService.deletePrice(existingPlan.priceId);

      await this.subscriptionPlanModel.findByIdAndUpdate(id, { active: false });

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Subscription plan has been deactivated successfully',
        data: null,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async getSubscriptionPlan(planId: string) {
    const plan = await this.subscriptionPlanModel
      .findById(planId)
      .lean()
      .exec();
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }
    return plan;
  }

  async createSubscription(userId: Types.ObjectId, dto: CreateSubscriptionDto) {
    const { paymentMethodId, planId, coupon } = dto;

    const plan = await this.getSubscriptionPlan(planId);
    const stripeCustomerId = await this.getOrCreateCustomer(userId);

    try {
      const existingSubscription = await this.subscriptionModel.findOne({
        userId,
        status: SubscriptionStatus.ACTIVE,
      });

      if (existingSubscription) {
        throw new Error('User already has an active subscription');
      }

      let validPaymentMethodId = paymentMethodId;

      if (process.env.NODE_ENV === 'development') {
        validPaymentMethodId =
          await this.stripeService.createTestPaymentMethod();
        console.log(`Test payment method created: ${validPaymentMethodId}`);
      }

      await this.stripeService.attachPaymentMethod(
        validPaymentMethodId,
        stripeCustomerId,
      );

      await this.stripeService.setDefaultPaymentMethod(
        stripeCustomerId,
        validPaymentMethodId,
      );

      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: stripeCustomerId,
        items: [{ price: plan.priceId }],
        default_payment_method: validPaymentMethodId,
        expand: ['latest_invoice.payment_intent'],
      };

      if (coupon) {
        subscriptionData.coupon = coupon;
      }

      const { cardType, last4 } =
        await this.stripeService.getPaymentMethodDetails(validPaymentMethodId);

      const subscription =
        await this.stripeService.createSubscription(subscriptionData);

      const newSubscription = await this.subscriptionModel.create({
        userId,
        stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        plan: plan._id,
        paymentMethodId: validPaymentMethodId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
        trialStart: subscription.trial_start
          ? new Date(subscription.trial_start * 1000)
          : null,
        trialEnd: subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : null,
        metadata: {
          priceId: plan.priceId,
        },
        coupon,
        cardLastFourDigit: last4,
        cardType,
      });

      if (!newSubscription) {
        throw new InternalServerErrorException(
          'Error in creating subscription',
        );
      }

      const transactionPayload = {
        userId,
        amount: plan.price,
        description: 'Payment for user susbcription',
        transactionType: 'subscription',
        currency: plan.currency,
        transactionRef: randomUUID(),
        cardType,
        cardLastFourDigit: last4,
        transactionDate: new Date(),
        status: TransactionStatus.SUCCESS,
      };

      await this.transactionService.createTransaction(transactionPayload);

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'User subscription created successfully',
        data: subscription,
        error: null,
      };
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  async cancelSubscription(
    userId: Types.ObjectId,
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
    userId: Types.ObjectId,
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
      const plan = await this.getSubscriptionPlan(newPlanId);

      const updatedSubscription = await this.stripeService.updateSubscription(
        subscription.stripeSubscriptionId,
        plan.priceId,
      );

      subscription.plan = plan;
      subscription.currentPeriodEnd = new Date(
        updatedSubscription.current_period_end * 1000,
      );
      subscription.metadata = { priceId: plan.priceId };

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

  async getUserSubscription(userId: Types.ObjectId) {
    try {
      const subscription = await this.subscriptionModel
        .findOne({ userId })
        .populate('plan', 'name price')
        .lean()
        .exec();

      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User subscription retrieved successfully',
        data: subscription,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async listAllSubscriptions(pagination: Pagination) {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;
      const [subscriptions, total] = await Promise.all([
        this.subscriptionModel
          .find()
          .populate('plan', 'name price')
          .skip(skip)
          .limit(limit)
          .exec(),
        this.subscriptionModel.countDocuments(),
      ]);

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Subscriptions retrieved successfully',
        data: {
          subscriptions,
          total,
          page,
          limit,
        },
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }
}
