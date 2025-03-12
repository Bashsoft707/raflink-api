import {
  Body,
  Controller,
  Patch,
  Post,
  Req,
  UseGuards,
  Get,
  Res,
  Param,
} from '@nestjs/common';
import { AuthService } from '../services/authentication.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  OnboardingDto,
  TokenData,
  UpdateUserDto,
  UpdateViewTimeDto,
  ValidateOtpDto,
  VerifyUsernameDto,
} from '../dtos';
import { AccessTokenGuard, RefreshTokenGuard } from '../auth';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UpdateMerchantDto } from '../dtos/merchant.dto';
import { UpdateStaffDto } from '../dtos/raflnk.dto';

@ApiTags('auth')
@Controller('authentication')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('waiting-list')
  @ApiOperation({ summary: 'Endpoint to join raflink waiting list' })
  async waitinglist(@Body() body: OnboardingDto) {
    return await this.authService.waitingList(body);
  }

  @Post('onboarding')
  @ApiOperation({ summary: 'Endpoint to onboard a user' })
  async onboarding(@Body() body: OnboardingDto) {
    return await this.authService.onboarding(body);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Endpoint to verify otp and save user' })
  async validateOtp(@Body() body: ValidateOtpDto) {
    return await this.authService.verifyOtpAndSaveUser(body);
  }

  @Post('verify-merchant-otp')
  @ApiOperation({ summary: 'Endpoint to verify otp and save merchant' })
  async validateMerchantOtp(@Body() body: ValidateOtpDto) {
    return await this.authService.verifyOtpAndSaveMerchant(body);
  }

  @Post('verify-raflink-otp')
  @ApiOperation({ summary: 'Endpoint to verify otp and save raflink staff' })
  async validateRaflinkOtp(@Body() body: ValidateOtpDto) {
    return await this.authService.verifyOtpAndSaveRaflinkStaff(body);
  }

  @Get('/user')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get user info' })
  async getUser(@Req() req: Request) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.authService.getUserInfo(user);
  }

  @Get('/merchant')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get merchant info' })
  async getMerchant(@Req() req: Request) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.authService.getMerchantInfo(user);
  }

  @Get('/staff')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get staff info' })
  async getStaff(@Req() req: Request) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.authService.getStaffInfo(user);
  }

  @Patch('/update')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to update user info' })
  async updateUser(@Req() req: Request, @Body() body: UpdateUserDto) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.authService.updateUserInfo(user, body);
  }

  @Patch('/update-merchant')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to update merchant info' })
  async updateMerchant(@Req() req: Request, @Body() body: UpdateMerchantDto) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.authService.updateMerchantInfo(user, body);
  }

  @Patch('/update-staff')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to update merchant info' })
  async updateStaff(@Req() req: Request, @Body() body: UpdateStaffDto) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.authService.updateStaffInfo(user, body);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(@Req() req, @Res() res: Response) {
    const { user } = req;
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    const redirectUrl = new URL('https://raflinks.io/admin/google/success');
    redirectUrl.searchParams.append('accessToken', user.accessToken);
    redirectUrl.searchParams.append('refreshToken', user.refreshToken);

    return res.redirect(redirectUrl.toString());
  }

  @Post('verify-username')
  @ApiOperation({ summary: 'Endpoint to username' })
  async verifyUsername(@Body() body: VerifyUsernameDto) {
    return await this.authService.verifyUsername(body);
  }

  @Post('verify-staff-username')
  @ApiOperation({ summary: 'Endpoint to verify staff username' })
  async verifyStaffUsername(@Body() body: VerifyUsernameDto) {
    return await this.authService.verifyStaffUsername(body);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Endpoint to generate access token using a refresh token',
  })
  async refreshToken(@Req() req: Request) {
    const payload = req.user as TokenData & { refreshToken: string };
    return await this.authService.refreshTokens(payload);
  }

  @Patch('/user/:username/view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to update links views' })
  @ApiParam({
    name: 'username',
    description: 'The username of the user profile to update',
    required: true,
    type: String,
  })
  async updateLinkViews(
    @Param() param: { username: string },
    @Body() body: UpdateViewTimeDto,
  ) {
    return await this.authService.updateViewTime(param.username, body);
  }
}
