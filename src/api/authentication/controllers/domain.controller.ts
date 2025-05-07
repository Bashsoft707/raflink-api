import { Body, Controller, Post, Param, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserDetailsDto } from '../dtos';
import { ConfigService } from '@nestjs/config';
import { DomainService } from '../services/domain.service';

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
  // @UseGuards(AuthGuard)
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
    @Param() param: { domainName: string },
    @Body() purchaseData: UserDetailsDto,
  ) {
    return this.domainService.createDomainPurchaseSession(
      param.domainName,
      1,
      purchaseData,
    );
  }

  @Post('/:domainName/purchase')
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
    @Param() param: { domainName: string },
    @Body() body: UserDetailsDto,
  ) {
    return await this.domainService.purchaseDomain(param.domainName, body);
  }
}
