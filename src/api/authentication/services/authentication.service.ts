import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection, ClientSession, Types } from 'mongoose';
import { ENV, TEMPLATES } from '../../../constants';
import { OtpService } from './otp.service';
import * as bcrypt from 'bcryptjs';
import {
  OnboardingDto,
  TokenData,
  UpdateShareCountDto,
  UpdateUserDto,
  UpdateViewTimeDto,
  ValidateOtpDto,
  VerifyUsernameDto,
} from '../dtos';
import { EmailService } from '../../email/email.service';
import { errorHandler } from '../../../utils';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../schema/user.schema';
import EncryptService from '../../../helpers/encryption';
import { GoogleUser } from '../interface';
import {
  ProfileView,
  ProfileViewDocument,
} from '../schema/profileViewTime.schema';
import { Merchant, MerchantDocument } from '../schema/merchants.schema';
import { UpdateMerchantDto } from '../dtos/merchant.dto';
import { Raflink, RaflinkDocument } from '../schema/raflink.schema';
import {
  CreateStaffDto,
  SetupStaffDto,
  StaffLoginDto,
} from '../dtos/raflnk.dto';
import { ShareCount, ShareCountDocument } from '../schema/shareCount.schema';
import { OtpAuthService } from './otp-auth.service';
// import { UpdateStaffDto } from '../dtos/raflnk.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Merchant.name)
    private readonly merchantModel: Model<MerchantDocument>,
    @InjectModel(Raflink.name)
    private readonly raflinkModel: Model<RaflinkDocument>,
    @InjectModel(ProfileView.name)
    private profileViewModel: Model<ProfileViewDocument>,
    @InjectModel(ShareCount.name)
    private readonly shareCountModel: Model<ShareCountDocument>,
    @Inject(OtpService)
    private readonly otpService: OtpService,
    @Inject(OtpAuthService)
    private readonly otpAuthService: OtpAuthService,
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

  // async verifyOtpAndSaveRaflinkStaff(payload: ValidateOtpDto) {
  //   try {
  //     const { email, otp } = payload;

  //     try {
  //       await this.otpService.validate({ otp, email });
  //     } catch (error) {
  //       throw new BadRequestException({
  //         status: 'error',
  //         statusCode: HttpStatus.BAD_REQUEST,
  //         message: error.message || 'Invalid OTP',
  //         data: null,
  //         error: null,
  //       });
  //     }

  //     let staff = await this.raflinkModel.findOne({ email }).exec();

  //     if (!staff) {
  //       staff = await this.raflinkModel.create({
  //         email,
  //       });

  //       await this.emailService.sendEmail({
  //         receiver: payload.email,
  //         subject: 'Welcome to raflink',
  //         body: `Hello user, Welcome to Raflink`,
  //         templateKey: TEMPLATES.WELCOME,
  //         data: {
  //           name: 'User',
  //           companyEmail: this.configService.get(ENV.EMAIL_FROM),
  //         },
  //       });
  //     }

  //     if (!staff) {
  //       throw new InternalServerErrorException({
  //         status: 'error',
  //         statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  //         message: 'User could not be created. Please try again later.',
  //         data: null,
  //         error: null,
  //       });
  //     }

  //     const tokenData: TokenData = {
  //       user: staff._id,
  //       verified: staff.verified,
  //       email,
  //       username: staff.username,
  //     };

  //     const { accessToken, refreshToken } = await this.getAndUpdateToken(
  //       tokenData,
  //       undefined,
  //       undefined,
  //       staff,
  //     );

  //     return {
  //       status: 'success',
  //       statusCode: HttpStatus.CREATED,
  //       message: 'Account successfully created and verified.',
  //       data: {
  //         staff,
  //         accessToken,
  //         refreshToken,
  //       },
  //       error: null,
  //     };
  //   } catch (error) {
  //     if (error instanceof BadRequestException) {
  //       throw error;
  //     }

  //     console.error('Error during OTP verification and user creation:', error);
  //     throw new InternalServerErrorException({
  //       status: 'error',
  //       statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: 'Something went wrong while verifying OTP and saving user.',
  //       data: null,
  //       error: error.message || 'Internal server error',
  //     });
  //   }
  // }

  async getAndUpdateToken(
    tokenData: TokenData,
    user?: UserDocument,
    merchant?: MerchantDocument,
    staff?: RaflinkDocument,
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

    if (staff) {
      await this.raflinkModel
        .findOneAndUpdate(
          { _id: staff._id },
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

  async getUserType(userId, type) {
    let user;

    if (type === 'user') {
      user = await this.userModel.findById(userId);
    } else if (user === 'merchant') {
      user = await this.merchantModel.findById(userId);
    }

    if (!user) {
      throw new NotFoundException(`${type} not found`);
    }

    return user;
  }

  async updateUserType(id, type, data) {
    console.log('id', id, data, type);
    type === 'user'
      ? await this.userModel.updateOne({ _id: id }, data, { new: true })
      : await this.merchantModel.updateOne({ _id: id }, data, { new: true });
  }

  async enable2FA(userId: Types.ObjectId, userType: string) {
    try {
      const user = await this.getUserType(userId, userType);

      const { secret, qrCode } = await this.otpAuthService.enable2FA(
        user,
        userId,
        user.email,
        userType,
        async (id, data) => {
          await this.updateUserType(id, userType, data);
        },
      );

      return {
        status: 'sucess',
        statusCode: HttpStatus.OK,
        message: `Two factor enabled for ${userType} successfully`,
        data: { secret, qrCode },
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async verify2FA(userId: Types.ObjectId, userType: string, token: string) {
    try {
      const user = await this.getUserType(userId, userType);

      const verified = await this.otpAuthService.verify2FA(
        user,
        userId,
        userType,
        token,
        (user) => user.twoFactorSecret,
        async (id, data) => {
          await this.updateUserType(id, userType, data);
        },
      );

      if (!verified) {
        return {
          status: 'fail',
          statusCode: HttpStatus.FAILED_DEPENDENCY,
          message: `Token verification failed`,
          data: null,
          error: null,
        };
      }

      return {
        status: 'sucess',
        statusCode: HttpStatus.OK,
        message: `Two factor verified for ${userType} successfully`,
        data: verified,
        error: null,
      };
    } catch (error) {
      console.log('Error', error);
      errorHandler(error);
    }
  }

  async validate2FALogin(
    userId: Types.ObjectId,
    userType: string,
    token: string,
  ) {
    try {
      const user = await this.getUserType(userId, userType);

      const { twoFactorSecret, twoFactorEnabled } = user;

      const result = await this.otpAuthService.validate2FALogin(
        userType,
        token,
        twoFactorSecret,
        twoFactorEnabled,
      );

      if (!result) {
        throw new InternalServerErrorException(
          `Error in validating ${userType} two factor authentication`,
        );
      }

      const tokenData: TokenData = {
        user: user._id,
        verified: user.verified,
        email: user.email,
      };

      const { accessToken, refreshToken } = await this.getAndUpdateToken(
        tokenData,
        user,
      );

      return {
        status: 'sucess',
        statusCode: HttpStatus.OK,
        message: `Two factor authentication validated for ${userType} successfully`,
        data: { accessToken, refreshToken },
        error: null,
      };
    } catch (error) {
      console.log('Error', error);
      errorHandler(error);
    }
  }

  async disable2FA(userId: Types.ObjectId, userType: string, token: string) {
    try {
      const user = await this.getUserType(userId, userType);

      const result = await this.otpAuthService.disable2FA(
        user,
        userId,
        userType,
        token,
        (user) => user.twoFactorSecret,
        (user) => user.twoFactorEnabled,
        async (id, data) => {
          await this.updateUserType(id, userType, data);
        },
      );

      if (!result) {
        return {
          status: 'fail',
          statusCode: HttpStatus.FAILED_DEPENDENCY,
          message: `Token verification failed`,
          data: null,
          error: null,
        };
      }

      return {
        status: 'sucess',
        statusCode: HttpStatus.OK,
        message: `Two factor disabled for ${userType} successfully`,
        data: result,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
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

  async getMerchantInfo(userId: Types.ObjectId) {
    try {
      const merchant = await this.merchantModel
        .findById(userId, '-__v -refreshToken -createdAt -updatedAt')
        .exec();

      if (!merchant) {
        return {
          status: 'error',
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Merchant not found.',
          data: {},
          error: null,
        };
      }

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Merchant information retrieved successfully',
        data: merchant,
        error: null,
      };
    } catch (error) {
      console.error('Error during updating user info:', error);
      errorHandler(error);
    }
  }

  async getStaffInfo(userId: Types.ObjectId) {
    try {
      const staff = await this.raflinkModel
        .findById(userId, '-__v -refreshToken -createdAt -updatedAt')
        .exec();

      if (!staff) {
        return {
          status: 'error',
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Merchant not found.',
          data: {},
          error: null,
        };
      }

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Merchant information retrieved successfully',
        data: staff,
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

  async createStaff(payload: CreateStaffDto) {
    const { email } = payload;
    try {
      const checkStaff = await this.raflinkModel.findOne({ email }).exec();

      if (checkStaff) {
        return {
          status: 'error',
          statusCode: HttpStatus.CONFLICT,
          message: 'Email exists.',
          data: {},
          error: null,
        };
      }

      const createdStaff = await this.raflinkModel.create({
        email: payload.email,
        role: payload.role,
        fullName: payload.fullName,
      });

      if (!createdStaff) {
        throw new InternalServerErrorException({
          status: 'error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'User could not be created. Please try again later.',
          data: null,
          error: null,
        });
      }

      await this.emailService.sendEmail({
        receiver: payload.email,
        subject: 'Welcome to raflink || OTP Verification',
        body: `Hello user, please click on the button below to setup your raflink staff account.`,
        templateKey: TEMPLATES.ACCOUNTSETUP,
        data: {
          name: 'User',
          link: `${this.configService.get(ENV.ACCOUNT_SETUP_URL)}?email=${payload.email}`,
          role: createdStaff.role,
          companyEmail: this.configService.get(ENV.EMAIL_FROM),
        },
      });

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Staff created successfully',
        data: createdStaff,
        error: null,
      };
    } catch (error) {
      console.error('Error during creating user:', error);
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

  async validateMerchantOAuthLogin(googleUser: GoogleUser): Promise<any> {
    try {
      let merchant = await this.merchantModel
        .findOne({ email: googleUser.email })
        .exec();

      if (!merchant) {
        merchant = await this.merchantModel.create({
          email: googleUser.email,
          // displayName: `${googleUser.firstName} ${googleUser.lastName}`,
          // image: googleUser.picture,
          verified: true,
        });
      }

      const tokenData: TokenData = {
        user: merchant._id,
        verified: merchant.verified,
        email: merchant.email,
        // username: user.username,
      };

      const { accessToken, refreshToken } = await this.getAndUpdateToken(
        tokenData,
        undefined,
        merchant,
      );

      await this.merchantModel.updateOne(
        { _id: merchant._id },
        { refreshToken: refreshToken },
      );

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Google authentication successful',
        data: {
          merchant,
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

  async isStaffUsernameTaken(username: string) {
    const user = await this.raflinkModel.findOne({ username }).lean().exec();
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

  async setupStaffAccount(payload: SetupStaffDto) {
    try {
      const { email } = payload;

      const staff = await this.raflinkModel.findOne({ email }).exec();

      if (!staff) {
        return {
          status: 'fail',
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Email does not exist',
          data: null,
          error: null,
        };
      }

      if (payload.password !== payload.confirmPassword) {
        return {
          status: 'fail',
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Passwords do not match',
          data: null,
          error: null,
        };
      }

      const hash = await bcrypt.hash(
        payload.password,
        Number(this.configService.get(ENV.PASSWORD_ROUNDS)),
      );

      const updatedStaff = await this.raflinkModel.findOneAndUpdate(
        { email: payload.email },
        { $set: { password: hash, verified: true } },
        { new: true },
      );

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Account setup successfully',
        data: null,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async loginStaffAccount(payload: StaffLoginDto) {
    try {
      const { email } = payload;

      const staff = await this.raflinkModel.findOne({ email }).exec();

      if (!staff) {
        return {
          status: 'fail',
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Email does not exist',
          data: null,
          error: null,
        };
      }

      if (!(await bcrypt.compare(payload.password, staff.password))) {
        return {
          status: 'fail',
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid password',
          data: null,
          error: null,
        };
      }

      const tokenData: TokenData = {
        user: staff._id,
        verified: staff.verified,
        email,
      };

      const { accessToken, refreshToken } = await this.getAndUpdateToken(
        tokenData,
        undefined,
        undefined,
        staff,
      );

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Account setup successfully',
        data: {
          staff,
          accessToken,
          refreshToken,
        },
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

      const decryptToken = await this.encryptionService.decrypt(
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

  async refreshMerchantTokens(payload: TokenData & { refreshToken: string }) {
    try {
      const { refreshToken: token, user: userId } = payload;
      const merchant = await this.merchantModel.findById(userId);

      if (!merchant || !merchant.refreshToken)
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Access Denied',
        });

      const decryptToken = await this.encryptionService.decrypt(
        merchant.refreshToken,
      );

      if (decryptToken !== token)
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Access Denied',
        });

      const { _id, email, verified } = merchant;

      const tokenData: TokenData = {
        user: _id,
        email,
        // username,
        verified,
      };

      const { accessToken, refreshToken } = await this.getAndUpdateToken(
        tokenData,
        undefined,
        merchant,
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

  async refreshStaffTokens(payload: TokenData & { refreshToken: string }) {
    try {
      const { refreshToken: token, user: userId } = payload;
      const staff = await this.raflinkModel.findById(userId);

      if (!staff || !staff.refreshToken)
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Access Denied',
        });

      const decryptToken = await this.encryptionService.decrypt(
        staff.refreshToken,
      );

      if (decryptToken !== token)
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Access Denied',
        });

      const { _id, email, verified } = staff;

      const tokenData: TokenData = {
        user: _id,
        email,
        // username,
        verified,
      };

      const { accessToken, refreshToken } = await this.getAndUpdateToken(
        tokenData,
        undefined,
        undefined,
        staff,
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

  async updateViewTime(username: string, dto: UpdateViewTimeDto) {
    try {
      const user = await this.userModel.findOne({ username });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const updatedViewTime = await this.userModel.findByIdAndUpdate(
        user._id,
        { $inc: { profileViewTime: dto.viewTime } },
        { new: true },
      );

      if (!updatedViewTime) {
        throw new InternalServerErrorException(
          500,
          'error in updating user profile view time',
        );
      }

      const viewTimeRecord = await this.profileViewModel.create({
        userId: user._id,
        ipAddress: dto.ipAddress,
        referrer: dto.referrer,
        geoLocation: dto.geoLocation,
        deviceType: dto.deviceType,
        viewDate: new Date(),
        viewTime: dto.viewTime,
      });

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User view time updated successfully.',
        data: { totalViews: updatedViewTime.profileViewTime, viewTimeRecord },
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async updateShareCount(username: string, dto: UpdateShareCountDto) {
    try {
      const user = await this.userModel.findOne({ username }).exec();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const updatedCount = await this.userModel.findByIdAndUpdate(
        user._id,
        { shareCount: user.shareCount + 1 },
        { new: true },
      );

      if (!updatedCount) {
        throw new InternalServerErrorException(
          'Error in updating profile share count',
        );
      }

      const countRecord = await this.shareCountModel.create({
        userId: user._id,
        sharedData: 'profile',
        sharedTo: dto.sharedTo,
        shareCount: dto.shareCount,
        shareDate: new Date(),
      });

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User profile share count updated successfully.',
        data: { totalShares: updatedCount?.shareCount, countRecord },
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }
}
