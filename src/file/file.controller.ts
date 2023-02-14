import {

  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { throwReadableMessages } from 'src/common/helpers';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) { }
  
  @UseInterceptors(FileInterceptor('image'))
  @Post('image')
  async uploadImage(
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
  ): Promise<{ imageURL }> {
    return this.fileService.uploadImage(file);
  }


  @UseInterceptors(FileInterceptor('video'))
  @Post('video')
  uploadVideo(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1_000_000 })
        .addFileTypeValidator({
          fileType: /(^video)(\/)[x\-flv,mp4,3gpp,webm,quicktime,mpeg]*/i,
        })
        .build({
          exceptionFactory: throwReadableMessages,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.fileService.uploadVideo(file);
  }


  @UseInterceptors(FileInterceptor('document'))
  @Post('document')
  uploadDocument(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1_000_000 })
        .addFileTypeValidator({
          fileType: /(^application)(\/)[rtf,pdf,epub\+zip]*/i,
        })
        .build({
          exceptionFactory: throwReadableMessages,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.fileService.uploadDocument(file);
  }
}
