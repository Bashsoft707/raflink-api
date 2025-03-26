import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../../authentication/auth';
import { GraphFilterDto } from '../../links/dtos';

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
}
