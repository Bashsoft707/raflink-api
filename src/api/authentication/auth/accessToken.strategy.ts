import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ENV } from '../../../constants';
import { TokenData } from '../dtos';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        configService.get<string>(ENV.JWT_ACCESS_TOKEN_SECRET) ||
        'defaultSecret',
    });
  }

  validate(payload: TokenData) {
    return payload;
  }
}
