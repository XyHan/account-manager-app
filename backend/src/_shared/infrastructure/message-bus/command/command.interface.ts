import type { CommandIdentifier } from '../identifier/command.identifier';
import type { Name } from '../value-object/name.value-object';
import type { Version } from '../value-object/version.value-object';
import type { MessageInterface } from '../message.interface';
import type { ICommand } from '../../../domain/bus/ICommand';

export interface CommandInterface extends MessageInterface, ICommand {
  readonly id: CommandIdentifier;
  readonly name: Name;
  readonly version: Version;
}
