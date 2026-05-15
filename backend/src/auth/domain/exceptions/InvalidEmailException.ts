export class InvalidEmailException extends Error {
  constructor(value: string) {
    super(`"${value}" is not a valid email address`);
    this.name = 'InvalidEmailException';
  }
}
