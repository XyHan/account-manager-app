import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageBusModule } from '../_shared/infrastructure/message-bus/bridge/message-bus.module';
import { CommandLogMiddleware } from '../_shared/infrastructure/cqrs/middleware/CommandLogMiddleware';
import { EventLogMiddleware } from '../_shared/infrastructure/cqrs/middleware/EventLogMiddleware';
import { CommandLogOrmEntity } from '../_shared/infrastructure/cqrs/orm-entities/CommandLog.orm-entity';
import { EventLogOrmEntity } from '../_shared/infrastructure/cqrs/orm-entities/EventLog.orm-entity';
import { BankAccountOrmEntity } from './infrastructure/persistence/orm-entities/BankAccountOrmEntity';
import { BankAccountRepository } from './infrastructure/persistence/repositories/BankAccountRepository';
import { CreateBankAccountCommandHandler } from './application/commands/create-bank-account/CreateBankAccountCommandHandler';
import { BankAccountController } from './presentation/controllers/BankAccountController';
import { BANK_ACCOUNT_REPOSITORY } from './domain/repositories/IBankAccountRepository';

@Module({
  imports: [
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
    { provide: BANK_ACCOUNT_REPOSITORY, useClass: BankAccountRepository },
  ],
})
export class BankAccountModule {}
