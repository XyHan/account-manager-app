import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TransactionOrmEntity } from './infrastructure/persistence/orm-entities/TransactionOrmEntity';
import { TransactionRepository } from './infrastructure/persistence/repositories/TransactionRepository';
import { TransactionCryptoService } from './infrastructure/crypto/TransactionCryptoService';
import { TRANSACTION_REPOSITORY } from './domain/repositories/ITransactionRepository';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([TransactionOrmEntity])],
  providers: [
    TransactionCryptoService,
    { provide: TRANSACTION_REPOSITORY, useClass: TransactionRepository },
  ],
  exports: [
    TransactionCryptoService,
    TRANSACTION_REPOSITORY,
  ],
})
export class TransactionModule {}
