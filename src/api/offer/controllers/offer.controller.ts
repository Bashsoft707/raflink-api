import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  // Patch,
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
import { CreateOfferDto } from '../dto';
import { OfferService } from '../services/offer.service';

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

  @Get('/')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get all user offers' })
  async getUserOffers(@Req() req: Request) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.OfferService.getUserOffers(user);
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
  async getOffer(@Param() param: { id: string }, @Req() req: Request) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;

    return await this.OfferService.getOfferById(user, param.id);
  }
}
