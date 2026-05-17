import { Inject, Injectable } from '@nestjs/common';
import type { EventHandlerInterface } from '../../../_shared/infrastructure/message-bus/event/event-handler.interface';
import type { EventInterface } from '../../../_shared/infrastructure/message-bus/event/event.interface';
import type { ITransactionRepository } from '../../../transaction/domain/repositories/ITransactionRepository';
import { TRANSACTION_REPOSITORY } from '../../../transaction/domain/repositories/ITransactionRepository';
import type { IBankAccountRepository } from '../../../bank-account/domain/repositories/IBankAccountRepository';
import { BANK_ACCOUNT_REPOSITORY } from '../../../bank-account/domain/repositories/IBankAccountRepository';
import { BankAccountId } from '../../../bank-account/domain/value-objects/BankAccountId';
import { Balance } from '../../../bank-account/domain/value-objects/Balance';
import type { ImportCompleted } from '../events/ImportCompleted';

@Injectable()
export class OnImportCompleted implements EventHandlerInterface {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
    @Inject(BANK_ACCOUNT_REPOSITORY)
    private readonly bankAccountRepository: IBankAccountRepository,
  ) {}

  async handle(event: EventInterface): Promise<void> {
    const e = event as ImportCompleted;

    const newBalance = await this.transactionRepository.sumByBankAccount(e.bankAccountId);
    const account = await this.bankAccountRepository.findById(BankAccountId.from(e.bankAccountId));

    if (!account) return;

    account.recalculateBalance(Balance.from(newBalance));
    await this.bankAccountRepository.save(account);
  }
}
