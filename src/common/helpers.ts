import { BadRequestException } from '@nestjs/common';

export const throwReadableMessages = (error) => {
  if (error.includes('type')) {
    throw new BadRequestException('only accepts images');
  }

  if (error.includes('size')) {
    throw new BadRequestException('file too large max size is 1MB');
  }
};

