import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import type { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';
import type { Transaction } from '../../../domain/entities/Transaction';
import { TransactionOrmEntity } from '../orm-entities/TransactionOrmEntity';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(
    @InjectRepository(TransactionOrmEntity)
    private readonly repository: Repository<TransactionOrmEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async saveBatch(transactions: Transaction[]): Promise<void> {
    if (transactions.length === 0) return;

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      for (const t of transactions) {
        await qr.manager.insert(TransactionOrmEntity, {
          id: t.id.toString(),
          userId: t.userId,
          bankAccountId: t.bankAccountId,
          date: t.date.toISOString().slice(0, 10),
          amount: t.amount.toFixed(2),
          labelEncrypted: t.labelEncrypted,
          labelIv: t.labelIv,
          hash: t.hash.toString(),
          importLogId: t.importLogId,
        });
      }
      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async existsByHash(hash: string, bankAccountId: string): Promise<boolean> {
    const count = await this.repository.count({ where: { hash, bankAccountId } });
    return count > 0;
  }

  async sumByBankAccount(bankAccountId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.bankAccountId = :bankAccountId', { bankAccountId })
      .getRawOne<{ total: string }>();
    return Number(result?.total ?? 0);
  }
}
