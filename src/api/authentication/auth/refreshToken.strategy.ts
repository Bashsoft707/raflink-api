import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ENV } from '../../../constants';
import { TokenData } from '../dtos';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>(ENV.JWT_REFRESH_TOKEN_SECRET),
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  validate(req: Request, payload: TokenData) {
    const authHeader = req.get('Authorization');
    const refreshToken = authHeader
      ? authHeader.replace('Bearer', '').trim()
      : null;
    return { ...payload, refreshToken };
  }
}
