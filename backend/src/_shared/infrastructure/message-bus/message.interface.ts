import type { Name } from './value-object/name.value-object';
import type { Version } from './value-object/version.value-object';
import type { Identifier } from './identifier/identifier';

export interface MessageInterface {
  readonly id: Identifier;
  readonly name: Name;
  readonly version: Version;
}
