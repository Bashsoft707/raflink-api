import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  Patch,
  // Delete,
  // Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';

import { AccessTokenGuard } from '../../authentication/auth';
import { Request } from 'express';
import { TokenData } from '../../authentication/dtos';
import { CreateOfferDto, UpdateOfferDto } from '../dto';
import { OfferService } from '../services/offer.service';
import { CreateCategoryDto } from 'src/api/links/dtos';
import { RolesGuard } from '../../authentication/auth/role.guard';
import { Roles } from '../../authentication/decorators/role.decorator';

@ApiTags('offers')
@Controller('offers')
export class OfferController {
  constructor(private readonly OfferService: OfferService) {}

  @Post('/new')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to create offer' })
  async createOffer(@Req() req: Request, @Body() body: CreateOfferDto) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.OfferService.createOffer(user as any, body);
  }

  @Get('/user')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get all user offers' })
  async getUserOffers(@Req() req: Request) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.OfferService.getUserOffers(user);
  }

  @Get('/user/:id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get single user offer detail' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the offer to be fetched',
    required: true,
    type: String,
  })
  async getOffer(@Param() param: { id: string }, @Req() req: Request) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;

    return await this.OfferService.getOfferById(user, param.id);
  }

  @Get('/')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get all offers' })
  async getOffers() {
    return await this.OfferService.getOffers();
  }

  @Get('/:id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get single offer detail' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the offer to be fetched',
    required: true,
    type: String,
  })
  async getSingleOffer(@Param() param: { id: string }) {
    return await this.OfferService.getSingleOffer(param.id);
  }

  @Patch('/:id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to update offer' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the offer to be fetched',
    required: true,
    type: String,
  })
  async updateOffer(
    @Req() req: Request,
    @Param() param: { id: string },
    @Body() body: UpdateOfferDto,
  ) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.OfferService.updateOffer(user, param.id, body);
  }

  @Get('/analytics')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get single offer detail' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the offer to be fetched',
    required: true,
    type: String,
  })
  async getOffersAnalytics(@Req() req: Request) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.OfferService.getOffersAnalytics(user);
  }

  @Get('/toggle-status/:id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to activate or deactivate offer' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the offer to be deactivated',
    required: true,
    type: String,
  })
  async toggleOffer(@Req() req: Request, @Param() param: { id: string }) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.OfferService.toggleOfferStatus(user, param.id);
  }

  @Post('/category')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to create offers category' })
  async createCategory(@Req() req: Request, @Body() body: CreateCategoryDto) {
    return await this.OfferService.createCategory(body);
  }

  @Get('/category/all')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get offer categories' })
  async getCategories(@Req() req: Request) {
    return await this.OfferService.getCategory();
  }
}
