import { Module } from '@nestjs/common';
import { AuthService } from './services/authentication.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './controllers/authentication.controller';
import { OtpService } from './services/otp.service';
import { EmailService } from '../email/email.service';
import { EmailTemplateLoader } from '../email/email-template-loader';
import { JwtModule } from '@nestjs/jwt';
import { CachesModule } from '../cache/cache.module';
import { User, UserSchema } from './schema/user.schema';
import EncryptService from '../../helpers/encryption';
import { AccessTokenStrategy } from './auth/accessToken.strategy';
import { RefreshTokenStrategy } from './auth/refreshToken.strategy';
import { Otp, OtpSchema } from './schema/otp.schema';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './auth/google.strategy';
import {
  ProfileView,
  ProfileViewSchema,
} from './schema/profileViewTime.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'google' }),
    JwtModule.register({}),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Otp.name,
        schema: OtpSchema,
      },
      {
        name: ProfileView.name,
        schema: ProfileViewSchema,
      },
    ]),
    CachesModule,
  ],
  providers: [
    AuthService,
    OtpService,
    EncryptService,
    EmailService,
    EmailTemplateLoader,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    GoogleStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
