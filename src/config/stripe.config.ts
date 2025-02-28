import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  proMonthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
  proYearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
}));
