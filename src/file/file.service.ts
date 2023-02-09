import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cloudinary from 'cloudinary';
import path from 'path';
import { Express } from 'express';
import DatauriParser from 'datauri/parser';
const parser = new DatauriParser();

@Injectable()
export class FileService {
  private readonly cloudName = this.config.get<string>('CLOUD_NAME');
  private readonly apiKEY = this.config.get<string>('API_KEY');
  private readonly apiSecret = this.config.get<string>('API_SECRET');
  constructor(private readonly config: ConfigService) {}
  async uploadImage(file: Express.Multer.File): Promise<{}> {
    cloudinary.v2.config({
      cloud_name: this.cloudName,
      api_key: this.apiKEY,
      api_secret: this.apiSecret,
    });

    const result = await cloudinary.v2.uploader.upload(
      this.extractContent(file),
      { folder: 'chichat/images' },
    );
    return { imageURL: result.secure_url };
  }

  async uploadDocument(file: Express.Multer.File): Promise<{}> {
    const result = await cloudinary.v2.uploader.upload(
      this.extractContent(file),
      { folder: 'chichat/documents' },
    );
    return { documentURL: result.secure_url };
  }

  async uploadVideo(file: Express.Multer.File): Promise<{}> {
    const result = await cloudinary.v2.uploader.upload(
      this.extractContent(file),
      { folder: 'chichat/video' },
    );
    return { documentURL: result.secure_url };
  }

  private extractContent(file: Express.Multer.File): string {
    const extName = path.extname(file.originalname).toString();
    const file64 = parser.format(extName, file.buffer);

    return file64.content;
  }
}
