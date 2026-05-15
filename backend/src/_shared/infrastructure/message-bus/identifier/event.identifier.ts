import { uuidV7 } from '../../../domain/uuid/uuid-v7';
import type { Identifier } from './identifier';

export class EventIdentifier implements Identifier {
  private constructor(public readonly value: string) {}

  static fromString(value: string): EventIdentifier {
    return new EventIdentifier(value);
  }

  static generate(): EventIdentifier {
    return new EventIdentifier(uuidV7());
  }

  toString(): string {
    return this.value;
  }
}
