import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../../authentication/auth';
import { GraphFilterDto } from '../../links/dtos';
import { Types } from 'mongoose';

@ApiTags('auth')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/dashboard')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get user info' })
  async getUser(@Req() req: Request) {
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
}
