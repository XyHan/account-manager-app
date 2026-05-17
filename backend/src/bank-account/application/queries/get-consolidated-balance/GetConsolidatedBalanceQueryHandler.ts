import { Inject, Injectable } from '@nestjs/common';
import type { QueryHandlerInterface } from '../../../../_shared/infrastructure/message-bus/query/query-handler.interface';
import type { IBankAccountFinder } from '../../../domain/finders/IBankAccountFinder';
import { BANK_ACCOUNT_FINDER } from '../../../domain/finders/IBankAccountFinder';
import { Criteria } from '../../../../_shared/domain/criteria/Criteria';
import { WithUserId } from '../../../domain/criteria/WithUserId';
import type { GetConsolidatedBalanceQuery } from './GetConsolidatedBalanceQuery';

@Injectable()
export class GetConsolidatedBalanceQueryHandler implements QueryHandlerInterface {
  constructor(
    @Inject(BANK_ACCOUNT_FINDER)
    private readonly bankAccountFinder: IBankAccountFinder,
  ) {}

  async handle(query: GetConsolidatedBalanceQuery): Promise<number> {
    return this.bankAccountFinder.consolidatedBalance(Criteria.fromArray([WithUserId.from(query.userId)]));
  }
}
