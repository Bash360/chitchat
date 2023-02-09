import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Express } from 'express';
import { FileService } from './file.service';

@Controller('file')
@ApiTags('fileupload')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000_000 }),
          new FileTypeValidator({
            fileType:
              /(^image)(\/)[jpeg,jpg,png,x\-png,bmp,gif,avif,webp,svg+xml]*/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.fileService.uploadImage(file);

    console.log(result);
  }
}
