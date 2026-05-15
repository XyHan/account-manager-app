import * as bcrypt from 'bcryptjs';
import { WeakPasswordException } from '../exceptions/WeakPasswordException';

export class HashedPassword {
  private static readonly MIN_LENGTH = 8;
  private static readonly SALT_ROUNDS = 12;

  private constructor(private readonly value: string) {}

  static async fromPlain(plainPassword: string): Promise<HashedPassword> {
    if (plainPassword.length < HashedPassword.MIN_LENGTH) {
      throw new WeakPasswordException();
    }
    const hash = await bcrypt.hash(plainPassword, HashedPassword.SALT_ROUNDS);
    return new HashedPassword(hash);
  }

  static fromHash(hash: string): HashedPassword {
    return new HashedPassword(hash);
  }

  async verify(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.value);
  }

  toString(): string {
    return this.value;
  }
}
