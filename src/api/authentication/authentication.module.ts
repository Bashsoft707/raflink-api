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
import EncryptService from 'src/helpers/encryption';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
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
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
