import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cloudinary from 'cloudinary';
import path from 'path';
import { Express } from 'express';
import DatauriParser from 'datauri/parser';
const parser = new DatauriParser();

@Injectable()
export class FileService {
  constructor(private readonly config: ConfigService) {}
  async uploadImage(file: Express.Multer.File): Promise<{}> {
    const cloudName = this.config.get<string>('CLOUD_NAME');
    const apiKEY = this.config.get<string>('API_KEY');
    const apiSecret = this.config.get<string>('API_SECRET');
    cloudinary.v2.config({
      cloud_name: cloudName,
      api_key: apiKEY,
      api_secret: apiSecret,
    });

    const result = await cloudinary.v2.uploader.upload(this.extractContent(file));
    return { imageURL: result.secure_url };
  }

  private extractContent(file: Express.Multer.File): string {
    const extName = path.extname(file.originalname).toString();
    const file64 = parser.format(extName, file.buffer);

    return file64.content;
  }
}
