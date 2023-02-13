import { BadRequestException } from '@nestjs/common';

export const throwReadableMessages = (error) => {
  if (error.includes('type')) {
    if (error.includes('image')) throw new BadRequestException('only accepts images');

    if (error.includes('video')) throw new BadRequestException('only accepts videos');

    if (error.includes('application')) throw new BadRequestException('only accepts documents');
  }

 if (error.includes('size')) {
      throw new BadRequestException('file too large max size is 1MB');
    }
  
};
