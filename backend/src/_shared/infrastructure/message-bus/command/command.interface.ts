import type { CommandIdentifier } from '../identifier/command.identifier';
import type { Name } from '../value-object/name.value-object';
import type { Version } from '../value-object/version.value-object';
import type { MessageInterface } from '../message.interface';

export interface CommandInterface extends MessageInterface {
  readonly id: CommandIdentifier;
  readonly name: Name;
  readonly version: Version;
}
