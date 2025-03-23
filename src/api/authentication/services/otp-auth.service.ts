import { Injectable } from '@nestjs/common';
import * as OTPAuth from 'otpauth';
import * as qrcode from 'qrcode';
import * as crypto from 'crypto';
import { Types } from 'mongoose';

@Injectable()
export class OtpAuthService {
  private readonly appName: string = 'YourAppName';
  private readonly algorithm: string = 'SHA1';
  private readonly digits: number = 6;
  private readonly period: number = 30;

  generateOtpSecret(): string {
    const secret = new OTPAuth.Secret({ size: 20 });
    return secret.base32;
  }

  async generateQRCode(
    secret: string,
    entityEmail: string,
    entityType: string = 'user',
  ): Promise<string> {
    const totp = new OTPAuth.TOTP({
      issuer: this.appName,
      label: `${entityEmail} (${entityType})`,
      algorithm: this.algorithm,
      digits: this.digits,
      period: this.period,
      secret: OTPAuth.Secret.fromHex(secret),
    });

    const otpauthUrl = totp.toString();

    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);
    return qrCodeUrl;
  }

  validateOtp(secret: string, token: string): boolean {
    try {
      const totp = new OTPAuth.TOTP({
        issuer: this.appName,
        algorithm: this.algorithm,
        digits: this.digits,
        period: this.period,
        secret,
      });

      const delta = totp.validate({ token, window: 1 });

      return delta !== null;
    } catch (error) {
      console.error('OTP validation error:', error);
      return false;
    }
  }

  async enable2FA<T>(
    entity: T,
    entityId: Types.ObjectId,
    entityEmail: string,
    entityType: string,
    updateFn: (id: Types.ObjectId, data: any) => Promise<void>,
  ): Promise<{ secret: string; qrCode: string }> {
    if (!entity) {
      throw new Error(`${entityType} not found`);
    }

    const secret = this.generateOtpSecret();

    const qrCode = await this.generateQRCode(secret, entityEmail, entityType);

    await updateFn(entityId, {
      twoFactorSecret: secret,
      twoFactorVerified: false,
    });

    return { secret, qrCode };
  }

  async verify2FA<T>(
    entity: T,
    entityId: Types.ObjectId,
    entityType: string,
    token: string,
    getSecretFn: (entity: T) => string | null,
    updateFn: (id: Types.ObjectId, data: any) => Promise<void>,
  ): Promise<boolean> {
    const secret = getSecretFn(entity);

    if (!entity || !secret) {
      throw new Error(`${entityType} not found or 2FA not initialized`);
    }

    const isValid = this.validateOtp(secret, token);

    if (isValid) {
      await updateFn(entityId, {
        twoFactorEnabled: true,
        twoFactorVerified: true,
      });
      return true;
    }

    return false;
  }

  async validate2FALogin<T>(
    entityType: string,
    token: string,
    secret: string,
    isEnabled: boolean,
  ): Promise<boolean> {
    if (!isEnabled || !secret) {
      throw new Error(`${entityType} not found or 2FA not enabled`);
    }

    return this.validateOtp(secret, token);
  }

  async disable2FA<T>(
    entity: T,
    entityId: Types.ObjectId,
    entityType: string,
    token: string,
    getSecretFn: (entity: T) => string | null,
    isEnabledFn: (entity: T) => boolean,
    updateFn: (id: Types.ObjectId, data: any) => Promise<void>,
  ): Promise<boolean> {
    const secret = getSecretFn(entity);
    const isEnabled = isEnabledFn(entity);

    if (!entity || !isEnabled || !secret) {
      throw new Error(`${entityType} not found or 2FA not enabled`);
    }

    const isValid = this.validateOtp(secret, token);

    if (isValid) {
      await updateFn(entityId, {
        twoFactorEnabled: false,
        twoFactorVerified: false,
        twoFactorSecret: null,
      });
      return true;
    }

    return false;
  }
}
