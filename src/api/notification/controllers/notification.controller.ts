import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
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
import { NotificationService } from '../services/notification.service';
import { NotificationFilterDTO, UpdateNotificationDto } from '../dto';

@ApiTags('Notification')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post(':type')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to verify two factor authentication' })
  @ApiParam({
    name: 'type',
    description:
      'The type of entity (user or merchant) whose notification settings is updated',
    required: true,
    type: String,
  })
  async verify(
    @Req() req: Request,
    @Param() param: { type: string },
    @Body() dto: UpdateNotificationDto,
  ) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.notificationService.updateUserNotification(
      user,
      param.type,
      dto,
    );
  }

  @Get('/:type')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get single user Notification detail' })
  @ApiParam({
    name: 'type',
    description:
      'The type of entity (user or merchant) whose notification is to be fetched',
    required: true,
    type: String,
  })
  async getNotification(@Param() param: { type: string }, @Req() req: Request) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;

    return await this.notificationService.getUserNotificationSettings(
      user,
      param.type,
    );
  }

  @Get('/')
  // @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get all Notifications' })
  async getNotifications(@Query() query: NotificationFilterDTO) {
    return await this.notificationService.getNotifications(query);
  }

  @Get('/:id')
  // @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get single Notification detail' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the Notification to be fetched',
    required: true,
    type: String,
  })
  async getSingleNotification(@Param() param: { id: string }) {
    return await this.notificationService.getSingleNotification(param.id);
  }
}
