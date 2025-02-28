import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  RawBodyRequest,
  Query,
} from '@nestjs/common';
import { SubscriptionService } from '../services/subscription.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from '../dto';
import { Request } from 'express';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { AccessTokenGuard } from '../../authentication/auth';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
  private stripe: Stripe;

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2023-10-16',
      },
    );
  }

  @UseGuards(AccessTokenGuard)
  @Post()
  async create(
    @Req() req,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    return this.subscriptionService.createSubscription(
      req.user.id,
      createSubscriptionDto,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getCurrentUserSubscription(@Req() req) {
    return this.subscriptionService.getUserSubscription(req.user.id);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('cancel')
  async cancelSubscription(@Req() req, @Body('immediate') immediate: boolean) {
    return this.subscriptionService.cancelSubscription(req.user.id, immediate);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('update')
  async updateSubscription(
    @Req() req,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.updateSubscription(
      req.user.id,
      updateSubscriptionDto,
    );
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'];
    const endpointSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    try {
      const event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        endpointSecret,
      );

      await this.subscriptionService.handleWebhookEvent(event);
      return { received: true };
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`);
    }
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  async findAll(@Query('limit') limit: number, @Query('page') page: number) {
    return this.subscriptionService.listAllSubscriptions(limit, page);
  }
}
