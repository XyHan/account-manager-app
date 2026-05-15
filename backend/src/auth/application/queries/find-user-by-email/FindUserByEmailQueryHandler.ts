import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { QueryHandlerInterface } from '../../../../_shared/infrastructure/message-bus/query/query-handler.interface';
import type { IUserFinder } from '../../../domain/finders/IUserFinder';
import { USER_FINDER } from '../../../domain/finders/IUserFinder';
import type { UserReadModel } from '../../../domain/models/UserReadModel';
import { Criteria } from '../../../../_shared/domain/criteria/Criteria';
import { WithEmail } from '../../../domain/criteria/WithEmail';
import { Email } from '../../../domain/value-objects/Email';
import type { FindUserByEmailQuery } from './FindUserByEmailQuery';

@Injectable()
export class FindUserByEmailQueryHandler implements QueryHandlerInterface {
  constructor(
    @Inject(USER_FINDER)
    private readonly userFinder: IUserFinder,
  ) {}

  async handle(query: FindUserByEmailQuery): Promise<UserReadModel> {
    const readModel = await this.userFinder.findOne(
      Criteria.fromArray([WithEmail.from(Email.from(query.email))]),
    );
    if (!readModel) throw new NotFoundException(`User not found: ${query.email}`);
    return readModel;
  }
}
