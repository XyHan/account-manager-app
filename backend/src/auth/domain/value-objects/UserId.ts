import { uuidV7 } from '../../../_shared/domain/uuid/uuid-v7';

export class UserId {
  private constructor(private readonly value: string) {}

  static generate(): UserId {
    return new UserId(uuidV7());
  }

  static from(value: string): UserId {
    if (value.trim().length === 0) {
      throw new Error('UserId cannot be empty');
    }
    return new UserId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  serialize(): object {
    return { id: this.value };
  }
}
