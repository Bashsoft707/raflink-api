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
import { Merchant, MerchantSchema } from './schema/merchants.schema';
import { Raflink, RaflinkSchema } from './schema/raflink.schema';
import { ShareCount, ShareCountSchema } from './schema/shareCount.schema';
import { MerchantGoogleStrategy } from './auth/google.merchant.strategy';
import { OtpAuthService } from './services/otp-auth.service';

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
      {
        name: Merchant.name,
        schema: MerchantSchema,
      },

      {
        name: Raflink.name,
        schema: RaflinkSchema,
      },
      {
        name: ShareCount.name,
        schema: ShareCountSchema,
      },
    ]),
    CachesModule,
  ],
  providers: [
    AuthService,
    OtpService,
    OtpAuthService,
    EncryptService,
    EmailService,
    EmailTemplateLoader,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    GoogleStrategy,
    MerchantGoogleStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
