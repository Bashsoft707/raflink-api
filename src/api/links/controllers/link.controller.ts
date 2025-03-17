import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { LinkService } from '../services/link.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import {
  CreateUserLinkDto,
  GraphFilterDto,
  UpdateClickCountDto,
  UpdateLinkViewTimeDto,
  UpdateUserLinkDto,
} from '../dtos';
import { AccessTokenGuard } from '../../authentication/auth';
import { Request } from 'express';
import { TokenData, UpdateShareCountDto } from '../../authentication/dtos';

@ApiTags('links')
@Controller('links')
export class LinkController {
  constructor(private readonly LinkService: LinkService) {}

  @Post('/user')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to create user Link' })
  async createUserLink(@Req() req: Request, @Body() body: CreateUserLinkDto) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.LinkService.createUserLink(user as any, body);
  }

  @Get('/user')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get user Links' })
  async getUserLinks(@Req() req: Request) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.LinkService.getUserLinks(user);
  }

  @Patch('/user/:id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to update user Link' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user Link to update',
    required: true,
    type: String,
  })
  async updateUserLink(
    @Param() param: { id: string },
    @Req() req: Request,
    @Body() body: UpdateUserLinkDto,
  ) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.LinkService.updateUserLink(param.id, user, body);
  }

  @Patch('/user/:id/click')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to update link clicks' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user link to update',
    required: true,
    type: String,
  })
  async updateClickCount(
    @Param() param: { id: string },
    @Body() body: UpdateClickCountDto,
  ) {
    return await this.LinkService.updateClickCount(param.id, body);
  }

  // @Patch('/user/:id/view')
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Endpoint to update links views' })
  // @ApiParam({
  //   name: 'id',
  //   description: 'The ID of the user Link to update',
  //   required: true,
  //   type: String,
  // })
  // async updateLinkViews(
  //   @Param() param: { id: string },
  //   @Body() body: UpdateLinkViewTimeDto,
  // ) {
  //   return await this.LinkService.updateViewTime(param.id, body);
  // }

  @Delete('/user/:id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to delete user Link' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user Link to delete',
    required: true,
    type: String,
  })
  async deleteUserLink(@Param() param: { id: string }, @Req() req: Request) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.LinkService.deleteUserLink(param.id, user);
  }

  @Get('/analytics')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get links analytics' })
  async getLinksAnalytics(@Req() req: Request) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.LinkService.getAnalytics(user);
  }

  @Get('/analytics/graph')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get links graph analytics' })
  async getLinksAnalyticsGraph(
    @Req() req: Request,
    @Query() query: GraphFilterDto,
  ) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.LinkService.getFilteredAnalytics(user, query);
  }

  @Get('/user/:username')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to view user link information' })
  @ApiParam({
    name: 'username',
    description: 'The username of user who owns the link',
    required: true,
    type: String,
  })
  async userLinkInfo(@Param() param: { username: string }) {
    return await this.LinkService.getUserLinkInfo(param.username);
  }

  @Patch('/user/:id/share')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to update link share count' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user link to update',
    required: true,
    type: String,
  })
  async updateShareCount(
    @Param() param: { id: string },
    @Body() body: UpdateShareCountDto,
  ) {
    return await this.LinkService.updateShareCount(param.id, body);
  }
}
