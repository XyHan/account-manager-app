import { EventHandler } from '../../../_shared/infrastructure/message-bus/decorator/event-handler.decorator';
import { EventIdentifier } from '../../../_shared/infrastructure/message-bus/identifier/event.identifier';
import { Name } from '../../../_shared/infrastructure/message-bus/value-object/name.value-object';
import { Version } from '../../../_shared/infrastructure/message-bus/value-object/version.value-object';
import type { EventInterface } from '../../../_shared/infrastructure/message-bus/event/event.interface';
import { OnImportCompleted } from '../../application/event-handlers/OnImportCompleted';

@EventHandler(OnImportCompleted)
export class ImportCompleted implements EventInterface {
  readonly id: EventIdentifier = EventIdentifier.generate();
  readonly name: Name = Name.fromString(this.constructor.name);
  readonly version: Version = Version.fromNumber(1);

  constructor(
    public readonly importLogId: string,
    public readonly bankAccountId: string,
    public readonly userId: string,
    public readonly addedCount: number,
    public readonly skippedCount: number,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
