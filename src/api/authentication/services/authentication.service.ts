import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Connection } from 'mongoose';
import { ENV, OTPRELAX, TEMPLATES } from 'src/constants';
import { Auth, AuthDocument } from '../schema';
import { OtpService } from './otp.service';
import { RegisterDto } from '../dtos';
import { EmailService } from '../../email/email.service';
import { capitalize, errorHandler } from 'src/utils';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private readonly authModel: Model<AuthDocument>,
    @Inject(OtpService)
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {}

  async register(payload: RegisterDto) {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(
        async (session) => {
          const { otp, email } = payload;
          const filterParams = JSON.parse(JSON.stringify({ email }));

          if (otp !== OTPRELAX.RAFLINK_RELAX_OTP) {
            await this.otpService.validate({ email, otp });
          }

          const isExistingUser = await this.authModel
            .findOne({ ...filterParams })
            .session(session)
            .exec();

          if (isExistingUser) {
            throw new BadRequestException({
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'Email or Phone number already exist',
            });
          }

          if (payload.password) {
            payload.password = await bcrypt.hash(
              payload.password,
              parseInt(process.env.SALT_ROUNDS || '', 10) || 10,
            );
          }

          const [user] = await this.authModel.create<Partial<Auth>>(
            [
              {
                ...payload,
                verified: true,
              },
            ],
            { session },
          );

          await session.commitTransaction();
        },
        {
          readConcern: 'majority',
          writeConcern: { w: 'majority', j: true },
          retryWrites: true,
        },
      );

      // await this.emailService.sendEmail({
      //   receiver: payload.email,
      //   subject: 'Welcome || Thanks for joining raflink',
      //   body: ` ${capitalize(payload.username)}, Hello ${
      //     payload.username
      //   } You have successfully confirmed you account, welcome`,
      //   templateKey: TEMPLATES.WELCOME,
      //   data: {
      //     name: payload.username,
      //     companyEmail: this.configService.get(ENV.COMPANY_EMAIL),
      //   },
      // });

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'User Registration Successful',
        data: {},
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    } finally {
      await session.endSession();
    }
  }
}
