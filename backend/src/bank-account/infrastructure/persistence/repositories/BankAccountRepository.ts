import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IBankAccountRepository } from '../../../domain/repositories/IBankAccountRepository';
import { BankAccount } from '../../../domain/entities/BankAccount';
import { BankAccountId } from '../../../domain/value-objects/BankAccountId';
import { BankName } from '../../../domain/value-objects/BankName';
import { AccountType } from '../../../domain/value-objects/AccountType';
import { Balance } from '../../../domain/value-objects/Balance';
import { BankAccountOrmEntity } from '../orm-entities/BankAccountOrmEntity';

@Injectable()
export class BankAccountRepository implements IBankAccountRepository {
  constructor(
    @InjectRepository(BankAccountOrmEntity)
    private readonly repository: Repository<BankAccountOrmEntity>,
  ) {}

  async save(account: BankAccount): Promise<void> {
    await this.repository.save({
      id: account.id.toString(),
      userId: account.userId,
      name: account.name.toString(),
      bank: account.bank.toString(),
      type: account.type.toString() as BankAccountOrmEntity['type'],
      balance: account.balance.toString(),
    });
  }

  async findById(id: BankAccountId): Promise<BankAccount | null> {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async delete(id: BankAccountId): Promise<void> {
    await this.repository.delete({ id: id.toString() });
  }

  private toDomain(entity: BankAccountOrmEntity): BankAccount {
    return BankAccount.reconstitute(
      BankAccountId.from(entity.id),
      entity.userId,
      BankName.from(entity.name),
      BankName.from(entity.bank),
      AccountType.from(entity.type),
      Balance.from(Number(entity.balance)),
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
