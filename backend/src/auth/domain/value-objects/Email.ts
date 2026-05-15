import { InvalidEmailException } from '../exceptions/InvalidEmailException';

export class Email {
  private constructor(private readonly value: string) {}

  static from(value: string): Email {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      throw new InvalidEmailException(value);
    }
    return new Email(value.toLowerCase());
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
