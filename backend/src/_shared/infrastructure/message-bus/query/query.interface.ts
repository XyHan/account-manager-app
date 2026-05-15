import type { QueryIdentifier } from '../identifier/query.identifier';
import type { Name } from '../value-object/name.value-object';
import type { Version } from '../value-object/version.value-object';
import type { MessageInterface } from '../message.interface';

export interface QueryInterface extends MessageInterface {
  readonly id: QueryIdentifier;
  readonly name: Name;
  readonly version: Version;
}
