import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import type { CommandHandlerInterface } from '../../../../_shared/infrastructure/message-bus/command/command-handler.interface';
import { EventBus } from '../../../../_shared/infrastructure/message-bus/bridge/bus/event.bus';
import type { IBankAccountRepository } from '../../../domain/repositories/IBankAccountRepository';
import { BANK_ACCOUNT_REPOSITORY } from '../../../domain/repositories/IBankAccountRepository';
import { BankAccountId } from '../../../domain/value-objects/BankAccountId';
import { BankName } from '../../../domain/value-objects/BankName';
import { AccountType } from '../../../domain/value-objects/AccountType';
import type { BankAccount } from '../../../domain/entities/BankAccount';
import type { UpdateBankAccountCommand } from './UpdateBankAccountCommand';

@Injectable()
export class UpdateBankAccountCommandHandler implements CommandHandlerInterface {
  constructor(
    @Inject(BANK_ACCOUNT_REPOSITORY)
    private readonly bankAccountRepository: IBankAccountRepository,
    private readonly eventBus: EventBus,
  ) {}

  async handle(command: UpdateBankAccountCommand): Promise<BankAccount> {
    const account = await this.bankAccountRepository.findById(BankAccountId.from(command.bankAccountId));

    if (!account) {
      throw new NotFoundException(`Bank account not found: ${command.bankAccountId}`);
    }

    if (account.userId !== command.userId) {
      throw new ForbiddenException('Access denied to this bank account');
    }

    account.update(
      command.accountName !== undefined ? BankName.from(command.accountName) : account.name,
      command.bank !== undefined ? BankName.from(command.bank) : account.bank,
      command.type !== undefined ? AccountType.from(command.type) : account.type,
    );

    await this.bankAccountRepository.save(account);

    for (const event of account.pullDomainEvents()) {
      await lastValueFrom(this.eventBus.execute(event));
    }

    return account;
  }
}
