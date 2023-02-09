import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Express } from 'express';
import { FileService } from './file.service';
import { throwReadableMessages } from 'src/common/helpers';

@Controller('file')
@ApiTags('fileupload')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1_000_000 })
        .addFileTypeValidator({
          fileType:
            /(^image)(\/)[jpeg,jpg,png,x\-png,bmp,gif,avif,webp,svg+xml]*/i,
        })
        .build({
          exceptionFactory: throwReadableMessages,
        }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.fileService.uploadImage(file);

    console.log(result);
  }

  @Post('chatfiles')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'video', maxCount: 1 },
      { name: 'document', maxCount: 1 },
    ]),
  )
  async uploadChatFiles(
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      video?: Express.Multer.File[];
      document?: Express.Multer.File[];
    },
  ) {
    console.log(files);
  }
}
