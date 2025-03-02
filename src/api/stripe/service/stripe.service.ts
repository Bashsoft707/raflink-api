import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), {
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

  async getProductsWithPrice(): Promise<
    { product: Stripe.Product; prices: Stripe.Price[] }[]
  > {
    try {
      const products = await this.stripe.products.list();

      const productsWithPrices = await Promise.all(
        products.data.map(async (product) => {
          const prices = await this.stripe.prices.list({
            product: product.id,
          });

          return { product, prices: prices.data };
        }),
      );

      return productsWithPrices;
    } catch (error) {
      throw new Error(`Error fetching products with prices: ${error.message}`);
    }
  }

  async createSubPrice({
    name,
    currency,
    price,
    duration,
  }): Promise<Stripe.Price> {
    const products = await this.getProducts();
    let selectedProduct = products.find(
      (product) => product.name === 'Raflink Sub',
    );

    if (!selectedProduct) {
      selectedProduct = await this.stripe.products.create({
        name: 'Raflink Sub',
        description: 'Subscription for Raflink',
      });
    }

    const plan = await this.stripe.prices.create({
      product: selectedProduct.id,
      nickname: name,
      currency: currency || 'usd',
      recurring: { interval: duration },
      unit_amount: price * 100,
    });

    return plan;
  }

  async editSubPrice(
    id: string,
    { name }: { name: string },
  ): Promise<Stripe.Price> {
    const pricing = await this.stripe.prices.retrieve(id);
    if (!pricing) {
      throw new Error('Product pricing not found');
    }
    const updatedPlan = await this.stripe.prices.update(id, {
      nickname: name,
    });
    return updatedPlan;
  }

  async deletePrice(id: string): Promise<void> {
    await this.stripe.prices.update(id, { active: false });
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

  async createTestPaymentMethod(): Promise<string> {
    const paymentMethod = await this.stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: 'tok_visa',
      },
    });

    return paymentMethod.id;
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
