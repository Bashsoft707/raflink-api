import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../services/cloudinary.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadImageDto } from '../dto/cloudinary.dto';

@ApiTags('image-upload')
@Controller('upload')
export class CloudinaryController {
  constructor(private cloudinaryService: CloudinaryService) {}

  @Post('image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload image',
    type: UploadImageDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const cloudinaryResult = await this.cloudinaryService.uploadFile(file);
    return {
      message: 'Image uploaded successfully!',
      data: cloudinaryResult,
    };
  }
}
