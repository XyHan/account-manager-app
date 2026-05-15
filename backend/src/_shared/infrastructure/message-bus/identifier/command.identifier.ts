import { uuidV7 } from '../../../domain/uuid/uuid-v7';
import type { Identifier } from './identifier';

export class CommandIdentifier implements Identifier {
  private constructor(public readonly value: string) {}

  static fromString(value: string): CommandIdentifier {
    return new CommandIdentifier(value);
  }

  static generate(): CommandIdentifier {
    return new CommandIdentifier(uuidV7());
  }

  toString(): string {
    return this.value;
  }
}
