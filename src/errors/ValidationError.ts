import { StatusCodes } from 'http-status-codes';

import { BasicError } from '@Errors/BasicError';

export class ValidationError extends BasicError {
  errors: unknown[];

  constructor(errors: unknown[]) {
    super('Validation failed', StatusCodes.BAD_REQUEST);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}
