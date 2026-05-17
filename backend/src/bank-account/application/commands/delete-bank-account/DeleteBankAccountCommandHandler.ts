import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import type { CommandHandlerInterface } from '../../../../_shared/infrastructure/message-bus/command/command-handler.interface';
import { EventBus } from '../../../../_shared/infrastructure/message-bus/bridge/bus/event.bus';
import type { IBankAccountRepository } from '../../../domain/repositories/IBankAccountRepository';
import { BANK_ACCOUNT_REPOSITORY } from '../../../domain/repositories/IBankAccountRepository';
import { BankAccountId } from '../../../domain/value-objects/BankAccountId';
import type { DeleteBankAccountCommand } from './DeleteBankAccountCommand';

@Injectable()
export class DeleteBankAccountCommandHandler implements CommandHandlerInterface {
  constructor(
    @Inject(BANK_ACCOUNT_REPOSITORY)
    private readonly bankAccountRepository: IBankAccountRepository,
    private readonly eventBus: EventBus,
  ) {}

  async handle(command: DeleteBankAccountCommand): Promise<void> {
    const account = await this.bankAccountRepository.findById(BankAccountId.from(command.bankAccountId));

    if (!account) {
      throw new NotFoundException(`Bank account not found: ${command.bankAccountId}`);
    }

    if (account.userId !== command.userId) {
      throw new ForbiddenException('Access denied to this bank account');
    }

    account.delete();

    await this.bankAccountRepository.delete(BankAccountId.from(command.bankAccountId));

    for (const event of account.pullDomainEvents()) {
      await lastValueFrom(this.eventBus.execute(event));
    }
  }
}
