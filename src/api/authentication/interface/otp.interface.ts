import { ValidateOtpDto } from '../dtos';

export interface IOtp {
  validate(payload: ValidateOtpDto): Promise<boolean>;
  create(phoneNumber: string): Promise<string>;
}
