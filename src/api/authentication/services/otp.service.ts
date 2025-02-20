import { ValidateOtpDto } from '../dtos';
import { BadRequestException, HttpStatus, Inject } from '@nestjs/common';
import { randomNumberGen } from 'src/utils';
import { IOtp } from '../interface';
import { CacheService } from 'src/api/cache/cache.service';
import { CACHE_METADATA } from 'src/constants';

export class OtpService implements IOtp {
  constructor(
    @Inject(CacheService)
    private readonly cacheService: CacheService,
  ) {}
  async validate(payload: ValidateOtpDto): Promise<any> {
    const { otp, email } = payload;
    const data = await this.cacheService.get(
      `${CACHE_METADATA.OTP_SERVICE}_${email}`,
    );
    if (data?.otp !== otp) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid Otp',
      });
    }
    return data;
  }

  async create(email: string): Promise<string> {
    await this.cacheService.delete(`${CACHE_METADATA.OTP_SERVICE}_${email}`);
    let otp = randomNumberGen(4);
    if (process.env.NODE_ENV !== 'production') {
      otp = '1235';
    }
    const savedOtp = await this.cacheService.save({
      data: { otp },
      ttl: 60 * 60 * 10,
      key: `${CACHE_METADATA.OTP_SERVICE}_${email}`,
    });
    return otp;
  }
}
