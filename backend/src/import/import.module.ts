import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageBusModule } from '../_shared/infrastructure/message-bus/bridge/message-bus.module';
import { AuthModule } from '../auth/auth.module';
import { BankAccountModule } from '../bank-account/bank-account.module';
import { TransactionModule } from '../transaction/transaction.module';
import { CommandLogMiddleware } from '../_shared/infrastructure/cqrs/middleware/CommandLogMiddleware';
import { EventLogMiddleware } from '../_shared/infrastructure/cqrs/middleware/EventLogMiddleware';
import { CommandLogOrmEntity } from '../_shared/infrastructure/cqrs/orm-entities/CommandLog.orm-entity';
import { EventLogOrmEntity } from '../_shared/infrastructure/cqrs/orm-entities/EventLog.orm-entity';
import { ImportLogOrmEntity } from './infrastructure/persistence/orm-entities/ImportLogOrmEntity';
import { ImportLogRepository } from './infrastructure/persistence/repositories/ImportLogRepository';
import { PapaparseCSVParser } from './infrastructure/parsers/PapaparseCSVParser';
import { ImportTransactionsCommandHandler } from './application/commands/import-transactions/ImportTransactionsCommandHandler';
import { OnImportCompleted } from './application/event-handlers/OnImportCompleted';
import { ImportController } from './presentation/controllers/ImportController';
import { IMPORT_LOG_REPOSITORY } from './domain/repositories/IImportLogRepository';
import { CSV_PARSER_SERVICE } from './domain/services/ICsvParserService';

@Module({
  imports: [
    AuthModule,
    BankAccountModule,
    TransactionModule,
    MessageBusModule.registerMiddlewares({
      commandBus: [CommandLogMiddleware],
      eventBus: [EventLogMiddleware],
      imports: [TypeOrmModule.forFeature([CommandLogOrmEntity, EventLogOrmEntity])],
    }),
    TypeOrmModule.forFeature([ImportLogOrmEntity]),
  ],
  controllers: [ImportController],
  providers: [
    ImportTransactionsCommandHandler,
    OnImportCompleted,
    { provide: IMPORT_LOG_REPOSITORY, useClass: ImportLogRepository },
    { provide: CSV_PARSER_SERVICE, useClass: PapaparseCSVParser },
  ],
})
export class ImportModule {}
