import { CommandHandler } from '../../../../_shared/infrastructure/message-bus/decorator/command-handler.decorator';
import { CommandIdentifier } from '../../../../_shared/infrastructure/message-bus/identifier/command.identifier';
import { Name } from '../../../../_shared/infrastructure/message-bus/value-object/name.value-object';
import { Version } from '../../../../_shared/infrastructure/message-bus/value-object/version.value-object';
import type { CommandInterface } from '../../../../_shared/infrastructure/message-bus/command/command.interface';
import { RegisterUserCommandHandler } from './RegisterUserCommandHandler';

@CommandHandler(RegisterUserCommandHandler)
export class RegisterUserCommand implements CommandInterface {
  readonly id: CommandIdentifier = CommandIdentifier.generate();
  readonly name: Name = Name.fromString(this.constructor.name);
  readonly version: Version = Version.fromNumber(1);

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly password: string,
  ) {}
}
