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
import { ConfigService } from '@nestjs/config';
import { AccessTokenGuard } from '../../authentication/auth';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TokenData } from 'src/api/authentication/dtos';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/customer')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to create stripe customer account' })
  async createCustomer(@Req() req: Request) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.subscriptionService.createCustomer(user);
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

  @ApiExcludeEndpoint()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'] as string | string[];
    const endpointSecret =
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';

    try {
      const event = this.subscriptionService[
        'stripeService'
      ].stripeInstance.webhooks.constructEvent(
        req.rawBody as string | Buffer,
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
