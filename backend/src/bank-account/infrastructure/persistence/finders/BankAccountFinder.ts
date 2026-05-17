import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IBankAccountFinder } from '../../../domain/finders/IBankAccountFinder';
import { BankAccountCollection } from '../../../domain/collection/BankAccountCollection';
import { BankAccountReadModel } from '../../../domain/models/BankAccountReadModel';
import type { Criteria } from '../../../../_shared/domain/criteria/Criteria';
import { WithUserId } from '../../../domain/criteria/WithUserId';
import { BankAccountOrmEntity } from '../orm-entities/BankAccountOrmEntity';

@Injectable()
export class BankAccountFinder implements IBankAccountFinder {
  constructor(
    @InjectRepository(BankAccountOrmEntity)
    private readonly repository: Repository<BankAccountOrmEntity>,
  ) {}

  async findAll(criteria: Criteria): Promise<BankAccountCollection> {
    const qb = this.repository
      .createQueryBuilder('account')
      .orderBy('account.createdAt', 'DESC');

    this.applyCriteria(qb, criteria);

    const entities = await qb.getMany();
    const readModels = entities.map(
      (e) => new BankAccountReadModel(e.id, e.name, e.bank, e.type, Number(e.balance), e.createdAt),
    );
    return new BankAccountCollection(readModels);
  }

  async consolidatedBalance(criteria: Criteria): Promise<number> {
    const qb = this.repository
      .createQueryBuilder('account')
      .select('COALESCE(SUM(account.balance), 0)', 'total');

    this.applyCriteria(qb, criteria);

    const result = await qb.getRawOne<{ total: string }>();
    return Number(result?.total ?? 0);
  }

  private applyCriteria(
    qb: ReturnType<Repository<BankAccountOrmEntity>['createQueryBuilder']>,
    criteria: Criteria,
  ): void {
    const withUserId = criteria.getCriterion(WithUserId);
    if (withUserId !== false) {
      qb.andWhere('account.userId = :userId', { userId: withUserId.getValue() });
    }
  }
}
