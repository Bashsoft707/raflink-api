import { Controller, Get } from '@nestjs/common';
import { StripeService } from '../service/stripe.service';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Get('products')
  async getProducts() {
    return await this.stripeService.getProducts();
  }

  @Get('customers')
  async getCustomers() {
    return await this.stripeService.getCustomers();
  }
}
