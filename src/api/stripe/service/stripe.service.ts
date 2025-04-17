import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
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

  async getCoupons(): Promise<Stripe.Coupon[]> {
    const coupons = await this.stripe.coupons.list();
    return coupons.data;
  }

  async validateCouponCode(couponCode: string): Promise<Stripe.Coupon> {
    try {
      const coupon = await this.stripe.coupons.retrieve(couponCode);

      if (coupon.valid) {
        return coupon;
      } else {
        throw new BadRequestException('Invalid coupon code');
      }
    } catch (error) {
      if (error.type === 'StripeInvalidRequestError') {
        throw new NotFoundException('Coupon not found');
      }
      throw new InternalServerErrorException(
        `Error validating coupon code: ${error.message}`,
      );
    }
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

  async getPaymentMethodDetails(paymentMethodId: string) {
    try {
      const paymentMethod =
        await this.stripe.paymentMethods.retrieve(paymentMethodId);

      if (paymentMethod.card) {
        const { card } = paymentMethod;

        const cardType = card.brand;
        const last4 = card.last4;

        return {
          cardType,
          last4,
        };
      } else {
        throw new Error('The provided payment method is not a card');
      }
    } catch (error) {
      throw new Error(
        `Failed to retrieve payment method details: ${error.message}`,
      );
    }
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
    try {
      return await this.stripe.subscriptions.create(subscriptionData);
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        switch (error.type) {
          case 'StripeCardError':
            // Card declined, insufficient funds, expired card, etc.
            throw new BadRequestException(`Payment failed: ${error.message}`);

          case 'StripeInvalidRequestError':
            // Invalid parameters were supplied to Stripe's API
            throw new BadRequestException(
              `Invalid subscription request: ${error.message}`,
            );

          case 'StripeAPIError':
            // API errors from Stripe
            throw new ServiceUnavailableException(
              `Stripe service error: ${error.message}`,
            );

          case 'StripeConnectionError':
            // Network issues between your server and Stripe
            throw new ServiceUnavailableException(
              'Connection to payment service failed',
            );

          case 'StripeAuthenticationError':
            // Authentication with Stripe's API failed
            throw new InternalServerErrorException(
              'Payment service authentication failed',
            );

          case 'StripeRateLimitError':
            // Too many requests made to the API too quickly
            throw new BadRequestException(
              'Payment service rate limit exceeded',
            );

          default:
            // Handle other Stripe errors
            throw new InternalServerErrorException(
              `Payment processing error: ${error.message}`,
            );
        }
      }

      // Handle non-Stripe errors
      console.error('Subscription creation error:', error);
      throw new InternalServerErrorException('Failed to process subscription');
    }
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelParams: Stripe.SubscriptionCancelParams,
  ) {
    try {
      return this.stripe.subscriptions.cancel(subscriptionId, cancelParams);
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        switch (error.type) {
          case 'StripeInvalidRequestError':
            throw new BadRequestException(
              `Invalid subscription cancellation request: ${error.message}`,
            );
          case 'StripeAPIError':
            throw new ServiceUnavailableException(
              `Stripe service error: ${error.message}`,
            );
          default:
            throw new InternalServerErrorException(
              `Failed to cancel subscription: ${error.message}`,
            );
        }
      } else {
        throw new InternalServerErrorException(
          `Failed to cancel subscription: ${error.message}`,
        );
      }
    }
  }

  async updateSubscription(subscriptionId: string, newPlanId: string) {
    try {
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
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        switch (error.type) {
          case 'StripeInvalidRequestError':
            throw new BadRequestException(
              `Invalid subscription update request: ${error.message}`,
            );
          case 'StripeAPIError':
            throw new ServiceUnavailableException(
              `Stripe service error: ${error.message}`,
            );
          default:
            throw new InternalServerErrorException(
              `Failed to update subscription: ${error.message}`,
            );
        }
      } else {
        throw new InternalServerErrorException(
          `Failed to update subscription: ${error.message}`,
        );
      }
    }
  }
}
