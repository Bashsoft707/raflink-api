import { HttpStatus } from '@nestjs/common';

export interface GenericMatch {
  [key: string]: GenericType;
}

export type GenericType<T = void> = string | number | Date | unknown | T;

export interface IResponse<T = void> {
  status: 'success' | 'fail';
  statusCode: HttpStatus;
  message?: string;
  data: T | null;
}

export interface IPagination<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
