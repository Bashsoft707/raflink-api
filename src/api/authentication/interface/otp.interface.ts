import { ValidateOtpDto } from '../dtos';

export interface IOtp {
  validate(payload: ValidateOtpDto): Promise<void>;
  create(phoneNumber: string): Promise<string>;
}
