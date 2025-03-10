import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection, ClientSession, Types } from 'mongoose';
import { ENV, TEMPLATES } from '../../../constants';
import { OtpService } from './otp.service';
import {
  OnboardingDto,
  TokenData,
  UpdateUserDto,
  ValidateOtpDto,
  VerifyUsernameDto,
} from '../dtos';
import { EmailService } from '../../email/email.service';
import { errorHandler } from '../../../utils';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../schema/user.schema';
import EncryptService from '../../../helpers/encryption';
import { GoogleUser } from '../interface';
import { Merchant, MerchantDocument } from '../schema/merchants.schema';
import { UpdateMerchantDto } from '../dtos/merchant.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Merchant.name)
    private readonly merchantModel: Model<MerchantDocument>,
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

  async waitingList(payload: OnboardingDto) {
    try {
      const { email } = payload;
      console.log('Here');

      await this.emailService.sendEmail({
        receiver: payload.email,
        subject: 'Welcome to raflink',
        body: `Hello user, You've joined the waitlist successfully`,
        templateKey: TEMPLATES.WAITLIST,
        data: {
          name: 'User',
          companyEmail: this.configService.get(ENV.EMAIL_FROM),
        },
      });

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'User added to waitlist successfully',
        data: email,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async onboarding(payload: OnboardingDto) {
    try {
      const { email } = payload;
      console.log('Here');
      const otp = await this.otpService.create(email);

      console.log('Here 2');

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

      console.log('Here 3');
      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'OTP sent successfully. Please check your email to verify.',
        data: email,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async verifyOtpAndSaveUser(payload: ValidateOtpDto) {
    try {
      const { email, otp } = payload;

      try {
        await this.otpService.validate({ otp, email });
      } catch (error) {
        throw new BadRequestException({
          status: 'error',
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message || 'Invalid OTP',
          data: null,
          error: null,
        });
      }

      let user = await this.userModel.findOne({ email }).exec();

      if (!user) {
        user = await this.userModel.create({
          email,
        });

        await this.emailService.sendEmail({
          receiver: payload.email,
          subject: 'Welcome to raflink',
          body: `Hello user, Welcome to Raflink`,
          templateKey: TEMPLATES.WELCOME,
          data: {
            name: 'User',
            companyEmail: this.configService.get(ENV.EMAIL_FROM),
          },
        });
      }

      if (!user) {
        throw new InternalServerErrorException({
          status: 'error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'User could not be created. Please try again later.',
          data: null,
          error: null,
        });
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
      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error('Error during OTP verification and user creation:', error);
      throw new InternalServerErrorException({
        status: 'error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong while verifying OTP and saving user.',
        data: null,
        error: error.message || 'Internal server error',
      });
    }
  }

  async verifyOtpAndSaveMerchant(payload: ValidateOtpDto) {
    try {
      const { email, otp } = payload;

      try {
        await this.otpService.validate({ otp, email });
      } catch (error) {
        throw new BadRequestException({
          status: 'error',
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message || 'Invalid OTP',
          data: null,
          error: null,
        });
      }

      let merchant = await this.merchantModel.findOne({ email }).exec();

      if (!merchant) {
        merchant = await this.merchantModel.create({
          email,
        });

        await this.emailService.sendEmail({
          receiver: payload.email,
          subject: 'Welcome to raflink',
          body: `Hello user, Welcome to Raflink`,
          templateKey: TEMPLATES.WELCOME,
          data: {
            name: 'User',
            companyEmail: this.configService.get(ENV.EMAIL_FROM),
          },
        });
      }

      if (!merchant) {
        throw new InternalServerErrorException({
          status: 'error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'User could not be created. Please try again later.',
          data: null,
          error: null,
        });
      }

      const tokenData: TokenData = {
        user: merchant._id,
        verified: merchant.verified,
        email,
        // username: user.username,
      };

      const { accessToken, refreshToken } = await this.getAndUpdateToken(
        tokenData,
        undefined,
        merchant,
      );

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Account successfully created and verified.',
        data: {
          merchant,
          accessToken,
          refreshToken,
        },
        error: null,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error('Error during OTP verification and user creation:', error);
      throw new InternalServerErrorException({
        status: 'error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong while verifying OTP and saving user.',
        data: null,
        error: error.message || 'Internal server error',
      });
    }
  }

  async getAndUpdateToken(
    tokenData: TokenData,
    user?: UserDocument,
    merchant?: MerchantDocument,
    session?: ClientSession,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { accessToken, refreshToken } = await this.getTokens(tokenData);

    const encryptRefreshToken =
      await this.encryptionService.encrypt(refreshToken);

    if (user) {
      await this.userModel
        .findOneAndUpdate(
          { _id: user._id },
          { refreshToken: encryptRefreshToken },
        )
        .session(session as any)
        .lean()
        .exec();
    }

    if (merchant) {
      await this.merchantModel
        .findOneAndUpdate(
          { _id: merchant._id },
          { refreshToken: encryptRefreshToken },
        )
        .session(session as any)
        .lean()
        .exec();
    }

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

  async getUserInfo(userId: Types.ObjectId) {
    try {
      const user = await this.userModel
        .findById(userId, '-__v -refreshToken -createdAt -updatedAt')
        .exec();

      if (!user) {
        return {
          status: 'error',
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found.',
          data: {},
          error: null,
        };
      }

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'User information retrieved successfully',
        data: user,
        error: null,
      };
    } catch (error) {
      console.error('Error during updating user info:', error);
      errorHandler(error);
    }
  }

  async updateUserInfo(userId: Types.ObjectId, payload: UpdateUserDto) {
    const { username, displayName } = payload;

    try {
      const user = await this.userModel.findById(userId).exec();

      if (!user) {
        return {
          status: 'error',
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found.',
          data: {},
          error: null,
        };
      }

      if (username || displayName) {
        const query = {};
        if (username) query['username'] = username?.toLowerCase();
        if (displayName) query['displayName'] = displayName?.toLowerCase();

        const existingUser = await this.userModel.findOne(query);

        if (existingUser) {
          if (existingUser.username === username?.toLowerCase()) {
            throw new BadRequestException('Username already exists');
          }

          if (existingUser.displayName === displayName?.toLowerCase()) {
            throw new BadRequestException('Display name already exists');
          }
        }
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        payload,
        { new: true },
      );

      if (!updatedUser) {
        return {
          status: 'error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error in updating user info. Please try again later',
          data: {},
          error: null,
        };
      }

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'User information successfully updated.',
        data: updatedUser,
        error: null,
      };
    } catch (error) {
      console.error('Error during updating user info:', error);
      errorHandler(error);
    }
  }

  async updateMerchantInfo(userId: Types.ObjectId, payload: UpdateMerchantDto) {
    // const { username, displayName } = payload;

    try {
      const merchant = await this.merchantModel.findById(userId).exec();

      if (!merchant) {
        return {
          status: 'error',
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found.',
          data: {},
          error: null,
        };
      }

      // if (username || displayName) {
      //   const query = {};
      //   if (username) query['username'] = username?.toLowerCase();
      //   if (displayName) query['displayName'] = displayName?.toLowerCase();

      //   const existingUser = await this.userModel.findOne(query);

      //   if (existingUser) {
      //     if (existingUser.username === username?.toLowerCase()) {
      //       throw new BadRequestException('Username already exists');
      //     }

      //     if (existingUser.displayName === displayName?.toLowerCase()) {
      //       throw new BadRequestException('Display name already exists');
      //     }
      //   }
      // }

      const updatedMerchant = await this.merchantModel.findByIdAndUpdate(
        userId,
        payload,
        { new: true },
      );

      if (!updatedMerchant) {
        return {
          status: 'error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error in updating user info. Please try again later',
          data: {},
          error: null,
        };
      }

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'User information successfully updated.',
        data: updatedMerchant,
        error: null,
      };
    } catch (error) {
      console.error('Error during updating user info:', error);
      errorHandler(error);
    }
  }

  async validateOAuthLogin(googleUser: GoogleUser): Promise<any> {
    try {
      let user = await this.userModel
        .findOne({ email: googleUser.email })
        .exec();

      if (!user) {
        user = await this.userModel.create({
          email: googleUser.email,
          displayName: `${googleUser.firstName} ${googleUser.lastName}`,
          image: googleUser.picture,
          verified: true,
        });
      }

      const tokenData: TokenData = {
        user: user._id,
        verified: user.verified,
        email: user.email,
        username: user.username,
      };

      const { accessToken, refreshToken } = await this.getAndUpdateToken(
        tokenData,
        user,
      );

      await this.userModel.updateOne(
        { _id: user._id },
        { refreshToken: refreshToken },
      );

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Google authentication successful',
        data: {
          user,
          accessToken,
          refreshToken,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error during OAuth authentication:', error);
      throw new InternalServerErrorException(
        'Failed to authenticate with Google',
      );
    }
  }

  generateUsernameSuggestions(username: string) {
    const suggestions: string[] = [];
    for (let i = 1; i <= 5; i++) {
      suggestions.push(`${username}${i}`);
    }
    return suggestions;
  }

  async isUsernameTaken(username: string) {
    const user = await this.userModel.findOne({ username }).lean().exec();
    return !!user;
  }

  async verifyUsername(payload: VerifyUsernameDto) {
    try {
      const { username } = payload;

      const user = await this.userModel.findOne({ username }).lean().exec();

      if (user) {
        const initialSuggestions = this.generateUsernameSuggestions(username);

        const availableSuggestions: string[] = [];
        for (const suggestion of initialSuggestions) {
          const isTaken = await this.isUsernameTaken(suggestion);
          if (!isTaken) {
            availableSuggestions.push(suggestion);
          }

          if (availableSuggestions.length >= 3) {
            break;
          }
        }

        return {
          status: 'fail',
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Username taken, see suggestions',
          data:
            availableSuggestions.length > 0
              ? availableSuggestions
              : initialSuggestions,
          error: null,
        };
      }

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Useranme verified successfully',
        data: username,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async refreshTokens(payload: TokenData & { refreshToken: string }) {
    try {
      const { refreshToken: token, user: userId } = payload;
      const user = await this.userModel.findById(userId);

      if (!user || !user.refreshToken)
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Access Denied',
        });

      const decryptToken = await await this.encryptionService.decrypt(
        user.refreshToken,
      );

      if (decryptToken !== token)
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Access Denied',
        });

      const { _id, email, verified, username } = user;

      const tokenData: TokenData = {
        user: _id,
        email,
        username,
        verified,
      };

      const { accessToken, refreshToken } = await this.getAndUpdateToken(
        tokenData,
        user,
      );

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Token successfully generated',
        data: { accessToken, refreshToken },
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }
}
