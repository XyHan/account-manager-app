import { uuidV7 } from '../../../domain/uuid/uuid-v7';
import type { Identifier } from './identifier';

export class QueryIdentifier implements Identifier {
  private constructor(public readonly value: string) {}

  static fromString(value: string): QueryIdentifier {
    return new QueryIdentifier(value);
  }

  static generate(): QueryIdentifier {
    return new QueryIdentifier(uuidV7());
  }

  toString(): string {
    return this.value;
  }
}
