import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageBusModule } from '../_shared/infrastructure/message-bus/bridge/message-bus.module';
import { AuthModule } from '../auth/auth.module';
import { CommandLogMiddleware } from '../_shared/infrastructure/cqrs/middleware/CommandLogMiddleware';
import { EventLogMiddleware } from '../_shared/infrastructure/cqrs/middleware/EventLogMiddleware';
import { CommandLogOrmEntity } from '../_shared/infrastructure/cqrs/orm-entities/CommandLog.orm-entity';
import { EventLogOrmEntity } from '../_shared/infrastructure/cqrs/orm-entities/EventLog.orm-entity';
import { BankAccountOrmEntity } from './infrastructure/persistence/orm-entities/BankAccountOrmEntity';
import { BankAccountRepository } from './infrastructure/persistence/repositories/BankAccountRepository';
import { BankAccountFinder } from './infrastructure/persistence/finders/BankAccountFinder';
import { CreateBankAccountCommandHandler } from './application/commands/create-bank-account/CreateBankAccountCommandHandler';
import { UpdateBankAccountCommandHandler } from './application/commands/update-bank-account/UpdateBankAccountCommandHandler';
import { DeleteBankAccountCommandHandler } from './application/commands/delete-bank-account/DeleteBankAccountCommandHandler';
import { ListBankAccountsQueryHandler } from './application/queries/list-bank-accounts/ListBankAccountsQueryHandler';
import { GetConsolidatedBalanceQueryHandler } from './application/queries/get-consolidated-balance/GetConsolidatedBalanceQueryHandler';
import { BankAccountController } from './presentation/controllers/BankAccountController';
import { BANK_ACCOUNT_REPOSITORY } from './domain/repositories/IBankAccountRepository';
import { BANK_ACCOUNT_FINDER } from './domain/finders/IBankAccountFinder';

@Module({
  imports: [
    AuthModule,
    MessageBusModule.registerMiddlewares({
      commandBus: [CommandLogMiddleware],
      eventBus: [EventLogMiddleware],
      imports: [TypeOrmModule.forFeature([CommandLogOrmEntity, EventLogOrmEntity])],
    }),
    TypeOrmModule.forFeature([BankAccountOrmEntity]),
  ],
  controllers: [BankAccountController],
  providers: [
    CreateBankAccountCommandHandler,
    UpdateBankAccountCommandHandler,
    DeleteBankAccountCommandHandler,
    ListBankAccountsQueryHandler,
    GetConsolidatedBalanceQueryHandler,
    { provide: BANK_ACCOUNT_REPOSITORY, useClass: BankAccountRepository },
    { provide: BANK_ACCOUNT_FINDER, useClass: BankAccountFinder },
  ],
  exports: [
    BANK_ACCOUNT_REPOSITORY,
    BANK_ACCOUNT_FINDER,
  ],
})
export class BankAccountModule {}
