import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection, ClientSession } from 'mongoose';
import { ENV, TEMPLATES } from 'src/constants';
import { OtpService } from './otp.service';
import { OnboardingDto, TokenData, ValidateOtpDto } from '../dtos';
import { EmailService } from '../../email/email.service';
import { errorHandler } from 'src/utils';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../schema/user.schema';
import EncryptService from 'src/helpers/encryption';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @Inject(OtpService)
    private readonly otpService: OtpService,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(EmailService)
    private readonly emailService: EmailService,
    @Inject(EncryptService)
    private readonly encryptionService: EncryptService,
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {}

  async onboarding(payload: OnboardingDto) {
    const session = await this.connection.startSession();

    try {
      const { email } = payload;
      const otp = await this.otpService.create(email);

      await this.emailService.sendEmail({
        receiver: payload.email,
        subject: 'Welcome to raflink || OTP Verification',
        body: `Hello user, Your OTP for email verification is: ${otp} Please enter this OTP to confirm your email address.`,
        templateKey: TEMPLATES.ONBOARDING,
        data: {
          name: 'User',
          otp,
          companyEmail: this.configService.get(ENV.EMAIL_FROM),
        },
      });

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'OTP sent successfully. Please check your email to verify.',
        data: email,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    } finally {
      await session.endSession();
    }
  }

  async verifyOtpAndSaveUser(payload: ValidateOtpDto) {
    const session = await this.connection.startSession();

    try {
      const { email, otp } = payload;

      await this.otpService.validate({ otp, email });

      let user: any = await this.userModel.findOne({ email }).exec();

      console.log("email", email)

      if (!user) {
        user = await this.userModel.create([
          {
            email,
          },
          { session },
        ]);
      }

      if (!user) {
        return {
          status: 'error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'User could not be created. Please try again later.',
          data: {},
          error: null,
        };
      }

      const tokenData: TokenData = {
        user: user._id,
        verified: user.verified,
        email,
        username: user.username,
      };

      const { accessToken, refreshToken } = await this.getAndUpdateToken(
        tokenData,
        user,
        session,
      );

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Account successfully created and verified.',
        data: {
          user,
          accessToken,
          refreshToken,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error during OTP verification and user creation:', error);

      return {
        status: 'error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong while verifying OTP and saving user.',
        data: {},
        error: error.message || 'Internal server error',
      };
    } finally {
      await session.endSession();
    }
  }

  async getAndUpdateToken(
    tokenData: TokenData,
    user: UserDocument,
    session?: ClientSession,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { accessToken, refreshToken } = await this.getTokens(tokenData);

    const encryptRefreshToken =
      await this.encryptionService.encrypt(refreshToken);

    await this.userModel
      .findOneAndUpdate(
        { _id: user._id },
        { refreshToken: encryptRefreshToken },
      )
      .session(session as any)
      .lean()
      .exec();
    return { accessToken, refreshToken };
  }

  async getTokens(
    payload: TokenData,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(ENV.JWT_ACCESS_TOKEN_SECRET),
        expiresIn: this.configService.get<string>(
          ENV.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
        ),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(ENV.JWT_REFRESH_TOKEN_SECRET),
        expiresIn: this.configService.get<string>(
          ENV.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
        ),
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
