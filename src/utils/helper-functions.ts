import { HttpException, HttpStatus } from '@nestjs/common';

export function randomNumberGen(length: number): string {
  let text = '';
  const possible = '0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export const errorHandler = (error: Error) => {
  if (error instanceof HttpException) {
    throw new HttpException(error.getResponse(), error.getStatus());
  } else {
    throw new HttpException({ ...error }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
};

export function capitalize(string: string): string {
  return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
}
