import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/authentication.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OnboardingDto, ValidateOtpDto } from '../dtos';

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
}
