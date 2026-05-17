import { Inject, Injectable } from '@nestjs/common';
import type { QueryHandlerInterface } from '../../../../_shared/infrastructure/message-bus/query/query-handler.interface';
import type { IBankAccountFinder } from '../../../domain/finders/IBankAccountFinder';
import { BANK_ACCOUNT_FINDER } from '../../../domain/finders/IBankAccountFinder';
import type { BankAccountCollection } from '../../../domain/collection/BankAccountCollection';
import { Criteria } from '../../../../_shared/domain/criteria/Criteria';
import { WithUserId } from '../../../domain/criteria/WithUserId';
import type { ListBankAccountsQuery } from './ListBankAccountsQuery';

@Injectable()
export class ListBankAccountsQueryHandler implements QueryHandlerInterface {
  constructor(
    @Inject(BANK_ACCOUNT_FINDER)
    private readonly bankAccountFinder: IBankAccountFinder,
  ) {}

  async handle(query: ListBankAccountsQuery): Promise<BankAccountCollection> {
    return this.bankAccountFinder.findAll(Criteria.fromArray([WithUserId.from(query.userId)]));
  }
}
