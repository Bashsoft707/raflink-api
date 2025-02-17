import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/authentication.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthResponse, BadRequestResponse, RegisterDto } from '../dtos';

@ApiTags('auth')
@Controller('authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Endpoint to join raflink onboarding list' })
  @ApiCreatedResponse({ type: AuthResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  async register(@Body() body: RegisterDto) {
    return await this.authService.register(body);
  }
}
