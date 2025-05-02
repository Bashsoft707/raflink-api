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
  UpdateShareCountDto,
  UpdateUserDto,
  UpdateViewTimeDto,
  ValidateOtpDto,
  VerifyTwoFactorDto,
  VerifyUsernameDto,
} from '../dtos';
import { AccessTokenGuard, RefreshTokenGuard } from '../auth';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UpdateMerchantDto } from '../dtos/merchant.dto';
import {
  CreateStaffDto,
  SetupStaffDto,
  StaffLoginDto,
} from '../dtos/raflnk.dto';

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

  @Get('generate/:type')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to enable two factor authentication' })
  @ApiParam({
    name: 'type',
    description: 'The type of entity (user or merchant) trying to enable 2fa',
    required: true,
    type: String,
  })
  async generate(@Req() req: Request, @Param() param: { type: string }) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;

    return await this.authService.enable2FA(user, param.type);
  }

  @Post('verify/:type')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to verify two factor authentication' })
  @ApiParam({
    name: 'type',
    description: 'The type of entity (user or merchant) trying to enable 2fa',
    required: true,
    type: String,
  })
  async verify(
    @Req() req: Request,
    @Param() param: { type: string },
    @Body() verifyDto: VerifyTwoFactorDto,
  ) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.authService.verify2FA(user, param.type, verifyDto.token);
  }

  @Post('validate/:type')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to validate two factor authentication' })
  @ApiParam({
    name: 'type',
    description: 'The type of entity (user or merchant) trying to enable 2fa',
    required: true,
    type: String,
  })
  async validate2FA(
    @Req() req: Request,
    @Param() param: { type: string },
    @Body() body: VerifyTwoFactorDto,
  ) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return this.authService.validate2FALogin(user, param.type, body.token);
  }

  @Post('disable/:type')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to disable two factor authentication' })
  @ApiParam({
    name: 'type',
    description: 'The type of entity (user or merchant) trying to enable 2fa',
    required: true,
    type: String,
  })
  async disable(
    @Req() req: Request,
    @Param() param: { type: string },
    @Body() verifyDto: VerifyTwoFactorDto,
  ) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.authService.disable2FA(user, param.type, verifyDto.token);
  }

  // @Post('verify-raflink-otp')
  // @ApiOperation({ summary: 'Endpoint to verify otp and save raflink staff' })
  // async validateRaflinkOtp(@Body() body: ValidateOtpDto) {
  //   return await this.authService.verifyOtpAndSaveRaflinkStaff(body);
  // }

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

  // @Patch('/update-staff')
  // @UseGuards(AccessTokenGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Endpoint to update merchant info' })
  // async updateStaff(@Req() req: Request, @Body() body: UpdateStaffDto) {
  //   const { user: tokenData } = req;
  //   const { user } = tokenData as unknown as TokenData;
  //   return await this.authService.updateStaffInfo(user, body);
  // }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/merchant')
  @UseGuards(AuthGuard('google-merchant'))
  googleMerchntAuth() {}

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

  @Get('google/merchant/callback')
  @UseGuards(AuthGuard('google-merchant'))
  googleMerchantAuthCallback(@Req() req, @Res() res: Response) {
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

  @Post('create-staff')
  @ApiOperation({ summary: 'Endpoint to create staff account' })
  async createAccount(@Body() body: CreateStaffDto) {
    return await this.authService.createStaff(body);
  }

  @Post('setup-staff')
  @ApiOperation({ summary: 'Endpoint to setup staff account' })
  async setupAccount(@Body() body: SetupStaffDto) {
    return await this.authService.setupStaffAccount(body);
  }

  @Post('staff-login')
  @ApiOperation({ summary: 'Endpoint to login staff account' })
  async login(@Body() body: StaffLoginDto) {
    return await this.authService.loginStaffAccount(body);
  }

  // @Post('create-staff')
  // @ApiOperation({ summary: 'Endpoint to create raflink staff' })
  // async createStaff(@Body() body: CreateStaffDto) {
  //   return await this.authService.createStaffAccount(body);
  // }

  // @Post('verify-staff-username')
  // @ApiOperation({ summary: 'Endpoint to verify staff username' })
  // async verifyStaffUsername(@Body() body: VerifyUsernameDto) {
  //   return await this.authService.verifyStaffUsername(body);
  // }

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

  @UseGuards(RefreshTokenGuard)
  @Get('refresh-merchant')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Endpoint to generate access token using merchant refresh token',
  })
  async refreshMerchant(@Req() req: Request) {
    const payload = req.user as TokenData & { refreshToken: string };
    return await this.authService.refreshMerchantTokens(payload);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh-staff')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Endpoint to generate access token using staff refresh token',
  })
  async refreshStaff(@Req() req: Request) {
    const payload = req.user as TokenData & { refreshToken: string };
    return await this.authService.refreshStaffTokens(payload);
  }

  @Patch('/user/:username/view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to update user profile view time' })
  @ApiParam({
    name: 'username',
    description: 'The username of the user profile to update',
    required: true,
    type: String,
  })
  async updateProfileViews(
    @Param() param: { username: string },
    @Body() body: UpdateViewTimeDto,
  ) {
    return await this.authService.updateViewTime(param.username, body);
  }

  @Patch('/user/:username/share-count')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to update user profile share counts' })
  @ApiParam({
    name: 'username',
    description: 'The username of the user profile to update',
    required: true,
    type: String,
  })
  async updateProfileShareCount(
    @Param() param: { username: string },
    @Body() body: UpdateShareCountDto,
  ) {
    return await this.authService.updateShareCount(param.username, body);
  }

  @Post('domain/verify/:domainName')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Endpoint to check if domain name is available or not',
  })
  @ApiParam({
    name: 'domainName',
    description: 'The domain name you want to check its availability',
    required: true,
    type: String,
  })
  async checkDomain(@Param() param: { domainName: string }) {
    return await this.authService.domainAvailability(param.domainName);
  }
}
