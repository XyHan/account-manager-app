import { NoHandler } from '../../../_shared/infrastructure/message-bus/decorator/no-handler.decorator';
import { EventIdentifier } from '../../../_shared/infrastructure/message-bus/identifier/event.identifier';
import { Name } from '../../../_shared/infrastructure/message-bus/value-object/name.value-object';
import { Version } from '../../../_shared/infrastructure/message-bus/value-object/version.value-object';
import type { EventInterface } from '../../../_shared/infrastructure/message-bus/event/event.interface';

@NoHandler()
export class PasswordChanged implements EventInterface {
  readonly id: EventIdentifier = EventIdentifier.generate();
  readonly name: Name = Name.fromString(this.constructor.name);
  readonly version: Version = Version.fromNumber(1);

  constructor(
    public readonly userId: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
