import type { EventIdentifier } from '../identifier/event.identifier';
import type { Name } from '../value-object/name.value-object';
import type { Version } from '../value-object/version.value-object';
import type { MessageInterface } from '../message.interface';

export interface EventInterface extends MessageInterface {
  readonly id: EventIdentifier;
  readonly name: Name;
  readonly version: Version;
}
