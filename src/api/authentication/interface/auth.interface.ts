import { IResponse } from 'src/interfaces';
import {
  ChangePasswordDTO,
  OtpDto,
  RegisterDto,
  ResetPasswordDTO,
  TokenData,
} from '../dtos';
import { Auth, AuthDocument } from '../schema';
import { ClientSession } from 'mongoose';

export interface IAuth {
  register(
    payload: RegisterDto,
  ): Promise<
    IResponse<{
      userId: Auth;
      accountNumber: string;
      accessToken: string;
      refreshToken: string;
    }>
  >;
  accountSetup(
    user: AuthDocument,
    session?: ClientSession,
  ): Promise<{
    userId: Auth;
    accountNumber: string;
    accessToken: string;
    refreshToken: string;
  }>;
  requestOtp(payload: OtpDto): Promise<IResponse>;
  resetPassword(payload: ResetPasswordDTO): Promise<IResponse>;
  changePassword(payload: ChangePasswordDTO & TokenData): Promise<IResponse>;
  getTokens(
    payload: TokenData,
  ): Promise<{ accessToken: string; refreshToken: string }>;
  refreshTokens(
    payload: TokenData & { refreshToken: string },
  ): Promise<IResponse<{ accessToken: string; refreshToken: string }>>;
  findUserByEmail(email: string): Promise<AuthDocument>;
}

export interface IUnset {
  $unset: string[];
}

export interface ISkip {
  $skip: number;
}

export interface ILimit {
  $limit: number;
}