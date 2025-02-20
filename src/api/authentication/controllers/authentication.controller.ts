import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/authentication.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  OnboardingDto,
  TokenData,
  UpdateUserDto,
  ValidateOtpDto,
} from '../dtos';
import { AccessTokenGuard } from '../auth';
import { Request } from 'express';

@ApiTags('auth')
@Controller('authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('onboarding')
  @ApiOperation({ summary: 'Endpoint to join raflink onboarding list' })
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
    return await this.authService.updateUserInfo(user as any, body);
  }
}
