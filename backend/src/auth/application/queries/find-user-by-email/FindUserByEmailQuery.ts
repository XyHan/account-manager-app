import { QueryHandler } from '../../../../_shared/infrastructure/message-bus/decorator/query-handler.decorator';
import { QueryIdentifier } from '../../../../_shared/infrastructure/message-bus/identifier/query.identifier';
import { Name } from '../../../../_shared/infrastructure/message-bus/value-object/name.value-object';
import { Version } from '../../../../_shared/infrastructure/message-bus/value-object/version.value-object';
import type { QueryInterface } from '../../../../_shared/infrastructure/message-bus/query/query.interface';
import { FindUserByEmailQueryHandler } from './FindUserByEmailQueryHandler';

@QueryHandler(FindUserByEmailQueryHandler)
export class FindUserByEmailQuery implements QueryInterface {
  readonly id: QueryIdentifier = QueryIdentifier.generate();
  readonly name: Name = Name.fromString(this.constructor.name);
  readonly version: Version = Version.fromNumber(1);

  constructor(public readonly email: string) {}
}
