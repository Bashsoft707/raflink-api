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
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { SubscriptionService } from '../services/subscription.service';
import {
  CreateSubscriptionDto,
  CreateSubscriptionPlanDto,
  UpdateSubscriptionDto,
  UpdateSubscriptionPlanDto,
} from '../dto';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AccessTokenGuard } from '../../authentication/auth';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { TokenData } from '../../authentication/dtos';
import { Pagination } from '../../../common/dto/pagination.dto';
import { RolesGuard } from '../../authentication/auth/role.guard';
import { Roles } from '../../authentication/decorators/role.decorator';
import { Response } from 'express';

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

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to create subscription plan' })
  @Post('plan')
  async createSubPlan(@Body() body: CreateSubscriptionPlanDto) {
    return this.subscriptionService.createSubscriptionPlan(body);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get subscription plans' })
  @Get('plan')
  async getSubPlans() {
    return this.subscriptionService.getSubscriptionPlans();
  }

  @Patch('plan/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to update subscription plan' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the subscription plan to update',
    required: true,
    type: String,
  })
  async updateSubPlan(
    @Param() param: { id: string },
    @Body() body: UpdateSubscriptionPlanDto,
  ) {
    return await this.subscriptionService.updateSubscriptionPlan(
      param.id,
      body,
    );
  }

  @Delete('plan/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to deactivate subscription plan' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the subscription plan to update',
    required: true,
    type: String,
  })
  async deletePlan(@Param() param: { id: string }) {
    return await this.subscriptionService.deleteSubscriptionPlan(param.id);
  }

  @UseGuards(AccessTokenGuard)
  @Get('coupon/:code')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to validate coupon code' })
  @ApiParam({
    name: 'code',
    description: 'The coupon code to validate',
    required: true,
    type: String,
  })
  async validateCoupon(@Param() param: { code: string }) {
    return await this.subscriptionService.validateCoupon(param.code);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin', 'staff')
  @Get('coupons')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get coupon codes' })
  async getCoupons() {
    return await this.subscriptionService.getCoupons();
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to create subscription' })
  @Post()
  async create(
    @Req() req,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;

    return this.subscriptionService.createSubscription(
      user,
      createSubscriptionDto,
    );
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get current user subscription' })
  @Get('me')
  async getCurrentUserSubscription(@Req() req) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return this.subscriptionService.getUserSubscription(user);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to cancel subscription' })
  @Patch('cancel')
  async cancelSubscription(@Req() req, @Body('immediate') immediate: boolean) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return this.subscriptionService.cancelSubscription(user, immediate);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to update subscription' })
  @Patch('update')
  async updateSubscription(
    @Req() req,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return this.subscriptionService.updateSubscription(
      user,
      updateSubscriptionDto,
    );
  }

  @ApiExcludeEndpoint()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    const signature = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !endpointSecret) {
      console.error('Missing signature or webhook secret');
      return res
        .status(401)
        .json({ error: 'Missing signature or webhook secret' });
    }

    try {
      const event = this.subscriptionService[
        'stripeService'
      ].stripeInstance.webhooks.constructEvent(
        req.rawBody as string | Buffer,
        signature,
        endpointSecret,
      );

      console.log('Event verified successfully:', event.type);
      await this.subscriptionService.handleWebhookEvent(event);
      return res.status(200).json({ received: true });
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }
  }

  // @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get all subscriptions' })
  @Get('all')
  async findAll(@Query() query: Pagination) {
    return this.subscriptionService.listAllSubscriptions(query);
  }
}
