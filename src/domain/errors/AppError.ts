export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BusinessError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

export class TechnicalError extends AppError {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
  }
}
