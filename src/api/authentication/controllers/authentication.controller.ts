import {
  Body,
  Controller,
  Patch,
  Post,
  Req,
  UseGuards,
  Get,
  Res,
} from '@nestjs/common';
import { AuthService } from '../services/authentication.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  OnboardingDto,
  TokenData,
  UpdateUserDto,
  ValidateOtpDto,
} from '../dtos';
import { AccessTokenGuard } from '../auth';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

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

  @Patch('/update')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to update user info' })
  async updateUser(@Req() req: Request, @Body() body: UpdateUserDto) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.authService.updateUserInfo(user, body);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(@Req() req, @Res() res: Response) {
    const { user } = req;
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    const redirectUrl = new URL('/authentication/google/callback', frontendUrl);
    redirectUrl.searchParams.append('accessToken', user.accessToken);
    redirectUrl.searchParams.append('refreshToken', user.refreshToken);

    return res.redirect(redirectUrl.toString());
  }
}
