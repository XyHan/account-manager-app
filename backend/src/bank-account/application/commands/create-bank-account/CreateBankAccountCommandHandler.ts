import { Inject, Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import type { CommandHandlerInterface } from '../../../../_shared/infrastructure/message-bus/command/command-handler.interface';
import { EventBus } from '../../../../_shared/infrastructure/message-bus/bridge/bus/event.bus';
import type { IBankAccountRepository } from '../../../domain/repositories/IBankAccountRepository';
import { BANK_ACCOUNT_REPOSITORY } from '../../../domain/repositories/IBankAccountRepository';
import { BankAccount } from '../../../domain/entities/BankAccount';
import { BankAccountId } from '../../../domain/value-objects/BankAccountId';
import { BankName } from '../../../domain/value-objects/BankName';
import { AccountType } from '../../../domain/value-objects/AccountType';
import type { CreateBankAccountCommand } from './CreateBankAccountCommand';

@Injectable()
export class CreateBankAccountCommandHandler implements CommandHandlerInterface {
  constructor(
    @Inject(BANK_ACCOUNT_REPOSITORY)
    private readonly bankAccountRepository: IBankAccountRepository,
    private readonly eventBus: EventBus,
  ) {}

  async handle(command: CreateBankAccountCommand): Promise<void> {
    const account = BankAccount.create(
      BankAccountId.from(command.bankAccountId),
      command.userId,
      BankName.from(command.accountName),
      BankName.from(command.bank),
      AccountType.from(command.type),
    );

    await this.bankAccountRepository.save(account);

    for (const event of account.pullDomainEvents()) {
      await lastValueFrom(this.eventBus.execute(event));
    }
  }
}
