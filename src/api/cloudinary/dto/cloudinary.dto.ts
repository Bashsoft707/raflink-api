import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UploadImageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The image file to upload',
  })
  @IsNotEmpty()
  file: Express.Multer.File;
}
