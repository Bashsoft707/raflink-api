import {
  Body,
  Controller,
  Post,
  Param,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  PurchaseDomainDto,
  TokenData,
  UserDetailsDto,
} from '../../authentication/dtos';
import { ConfigService } from '@nestjs/config';
import { DomainService } from '../services/domain.service';
import { AccessTokenGuard } from '../../authentication/auth';
import { Request } from 'express';
import { Types } from 'mongoose';

@ApiTags('domain')
@Controller('domain')
export class DomainController {
  constructor(
    private readonly domainService: DomainService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/verify/:domainName')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Endpoint to check if domain name is available or not',
  })
  @ApiParam({
    name: 'domainName',
    description: 'The domain name you want to check its availability',
    required: true,
    type: String,
  })
  async checkDomain(@Param() param: { domainName: string }) {
    return await this.domainService.domainAvailability(param.domainName);
  }

  @Post('/:domainName/purchase/create-session')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create domain purchase session with payment intent',
  })
  @ApiParam({
    name: 'domainName',
    description: 'The domain name you want to purchase',
    required: true,
    type: String,
  })
  async createPurchaseSession(
    @Req() req: Request,
    @Param() param: { domainName: string },
    @Body() purchaseData: UserDetailsDto,
  ) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return this.domainService.createDomainPurchaseSession(
      param.domainName,
      1,
      purchaseData,
      user,
    );
  }

  @Post('/:domainName/purchase')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Endpoint to purchase a domain name',
  })
  @ApiParam({
    name: 'domainName',
    description: 'The domain name you want to purchase',
    required: true,
    type: String,
  })
  async purchaseDomain(
    @Req() req: Request,
    @Param() param: { domainName: string },
    @Body() body: PurchaseDomainDto,
  ) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.domainService.purchaseDomain(
      param.domainName,
      user,
      body,
    );
  }
}
