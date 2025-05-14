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
import { AdminService } from '../services/admin.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../../authentication/auth';
import { GraphFilterDto } from '../../links/dtos';
import { Types } from 'mongoose';
import { CreateUserDto, UserFilterDto } from '../dto';
import { Roles } from '../../authentication/decorators/role.decorator';
import { RolesGuard } from '../../authentication/auth/role.guard';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/dashboard')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get user info' })
  async getAdmin(@Req() req: Request) {
    // const { user: tokenData } = req;
    // const { user } = tokenData as unknown as TokenData;
    return await this.adminService.getDashboardAnalytics();
  }

  @Get('/dashboard/graph')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get user info' })
  async getDashbordGraph(@Req() req: Request, @Query() query: GraphFilterDto) {
    // const { user: tokenData } = req;
    // const { user } = tokenData as unknown as TokenData;
    return await this.adminService.getDashboardAnalyticsGraph(query);
  }

  @Get('/user/view-time')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get user info' })
  async getProfileViewTime(
    @Req() req: Request,
    @Query() query: GraphFilterDto,
  ) {
    return await this.adminService.getViewTime(query);
  }

  @Get('/staffs')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get user info' })
  async getAllStaff(@Req() req: Request) {
    // const { user: tokenData } = req;
    // const { user } = tokenData as unknown as TokenData;
    return await this.adminService.getStaffs();
  }

  @Get('/delete-staff')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get user info' })
  async deleteStaff(@Req() req: Request, @Param('id') id: Types.ObjectId) {
    // const { user: tokenData } = req;
    // const { user } = tokenData as unknown as TokenData;
    return await this.adminService.deleteStaff(id);
  }

  @Post('/create-user')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to create user account' })
  async createUser(@Body() body: CreateUserDto) {
    return await this.adminService.createUser(body);
  }

  @Get('/subscribers')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get user with active subscriptions' })
  async subscribers() {
    return await this.adminService.getSubscribers();
  }

  @Get('/subscription-analytics')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get subscription analytics' })
  async getSubAnalytics() {
    return await this.adminService.getSubscriptionAnalytics();
  }

  @Get('/:type')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get list of influnecers or merchants' })
  @ApiParam({
    name: 'type',
    description: 'The type of user (user or merchants)',
    required: true,
    type: String,
  })
  async getUsers(
    @Param() param: { type: 'user' | 'merchant' },
    @Query() query: UserFilterDto,
  ) {
    return await this.adminService.getEntities(param.type, query);
  }

  @Get('/:type/analytics')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Endpoint to get analytics of influnecers or merchants',
  })
  @ApiParam({
    name: 'type',
    description: 'The type of user (user or merchants)',
    required: true,
    type: String,
  })
  async getUserAnalytics(@Param() param: { type: 'user' | 'merchant' }) {
    return await this.adminService.getEntityAnalytics(param.type);
  }

  @Get('/details/:id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get influencer or merchant' })
  @ApiParam({
    name: 'id',
    description: 'The id of user (user or merchants)',
    required: true,
    type: String,
  })
  async getUser(@Param() param: { id: string }) {
    return await this.adminService.getEntityDetails(param.id);
  }
}
