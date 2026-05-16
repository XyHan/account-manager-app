import { CommandHandler } from '../../../../_shared/infrastructure/message-bus/decorator/command-handler.decorator';
import { CommandIdentifier } from '../../../../_shared/infrastructure/message-bus/identifier/command.identifier';
import { Name } from '../../../../_shared/infrastructure/message-bus/value-object/name.value-object';
import { Version } from '../../../../_shared/infrastructure/message-bus/value-object/version.value-object';
import type { CommandInterface } from '../../../../_shared/infrastructure/message-bus/command/command.interface';
import { CreateBankAccountCommandHandler } from './CreateBankAccountCommandHandler';

@CommandHandler(CreateBankAccountCommandHandler)
export class CreateBankAccountCommand implements CommandInterface {
  readonly id: CommandIdentifier = CommandIdentifier.generate();
  readonly name: Name = Name.fromString(this.constructor.name);
  readonly version: Version = Version.fromNumber(1);

  constructor(
    public readonly userId: string,
    public readonly bankAccountId: string,
    public readonly accountName: string,
    public readonly bank: string,
    public readonly type: string,
  ) {}
}
