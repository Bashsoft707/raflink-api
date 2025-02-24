import { ValidateOtpDto } from '../dtos';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { randomNumberGen } from '../../../utils';
import { IOtp } from '../interface';
import { InjectModel } from '@nestjs/mongoose';
import { Otp, OtpDocument } from '../schema/otp.schema';
import { Model } from 'mongoose';

export class OtpService implements IOtp {
  constructor(
    @InjectModel(Otp.name) private readonly otpModel: Model<OtpDocument>,
  ) {}

  async validate(payload: ValidateOtpDto): Promise<boolean> {
    const { otp, email } = payload;
    const data = await this.otpModel.findOne({ email, otp }).exec();

    if (!data) {
      throw new BadRequestException({
        status: 'error',
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid OTP',
      });
    }

    if (data.otpExpiration && new Date() > data.otpExpiration) {
      await data.deleteOne();
      throw new BadRequestException({
        status: 'error',
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'OTP has expired',
      });
    }

    await data.deleteOne();
    return true;
  }

  async create(email: string): Promise<string> {
    await this.otpModel.deleteMany({ email });

    let otp = randomNumberGen(6);
    if (process.env.NODE_ENV !== 'production') {
      otp = '1235';
    }

    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);

    await this.otpModel.create({
      email,
      otp,
      otpExpiration,
    });

    return otp;
  }
}
