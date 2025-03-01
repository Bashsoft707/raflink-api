import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ENV } from '../../../constants';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(ENV.STRIPE_PUBLIC_KEY, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  // Add a getter to access the stripe instance
  get stripeInstance(): Stripe {
    return this.stripe;
  }

  async getProducts(): Promise<Stripe.Product[]> {
    const products = await this.stripe.products.list();
    return products.data;
  }

  async createCustomer(
    email: string,
    name: string,
    userId: string,
  ): Promise<Stripe.Customer> {
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });
    return customer;
  }

  async getCustomers(): Promise<Stripe.Customer[]> {
    const customers = await this.stripe.customers.list();
    return customers.data;
  }

  async attachPaymentMethod(paymentMethodId: string, customerId: string) {
    return this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
    return this.stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  }

  async createSubscription(subscriptionData: Stripe.SubscriptionCreateParams) {
    return this.stripe.subscriptions.create(subscriptionData);
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelParams: Stripe.SubscriptionCancelParams,
  ) {
    return this.stripe.subscriptions.cancel(subscriptionId, cancelParams);
  }

  async updateSubscription(subscriptionId: string, newPlanId: string) {
    const subscription =
      await this.stripe.subscriptions.retrieve(subscriptionId);
    return this.stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPlanId,
        },
      ],
      proration_behavior: 'create_prorations',
    });
  }
}
