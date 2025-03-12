// import { Controller, Get, Req, UseGuards } from '@nestjs/common';
// import { AdminService } from '../services/admin.service';
// import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { AccessTokenGuard } from '../../authentication/auth';

// @ApiTags('auth')
// @Controller('admin')
// export class AdminController {
//   constructor(private readonly adminService: AdminService) {}

//   @Get('/dashboard')
//   @UseGuards(AccessTokenGuard)
//   @ApiBearerAuth()
//   @ApiOperation({ summary: 'Endpoint to get user info' })
//   async getUser(@Req() req: Request) {
//     // const { user: tokenData } = req;
//     // const { user } = tokenData as unknown as TokenData;
//     return await this.adminService.getDashboardAnalytics();
//   }
// }
