import { BadRequestException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ValidationError } from 'class-validator';

export const throwReadableMessages = (error) => {
  if (error.includes('type')) {
    if (error.includes('image'))
      throw new BadRequestException('only accepts images');

    if (error.includes('video'))
      throw new BadRequestException('only accepts videos');

    if (error.includes('application'))
      throw new BadRequestException('only accepts documents');
  }

  if (error.includes('size')) {
    throw new BadRequestException('file too large max size is 1MB');
  }

  throw new BadRequestException(error);
};

export const validationError = (error: ValidationError[]) => {
  if (error) {
    const errors = error.map((error) => {
      return error.constraints[Object.keys(error.constraints)[0]];
    });
    return errors;
  }
};

export function getParam(sParam, url) {
  const firstSplit = url.split('?');
  const sURLVariables = firstSplit[1].split('&');
  for (let i = 0; i < sURLVariables.length; i++) {
    const sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam) {
      return sParameterName[1];
    }
  }
}
