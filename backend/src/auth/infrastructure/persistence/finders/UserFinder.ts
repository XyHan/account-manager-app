import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserFinder } from '../../../domain/finders/IUserFinder';
import { UserReadModel } from '../../../domain/models/UserReadModel';
import { Criteria } from '../../../../_shared/domain/criteria/Criteria';
import { WithEmail } from '../../../domain/criteria/WithEmail';
import { UserOrmEntity } from '../orm-entities/UserOrmEntity';

@Injectable()
export class UserFinder implements IUserFinder {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async findOne(criteria: Criteria): Promise<UserReadModel | null> {
    const qb = this.repository.createQueryBuilder('user');
    this.applyCriteria(qb, criteria);
    const entity = await qb.getOne();
    if (entity === null) return null;
    return {
      id: entity.id,
      email: entity.email,
      role: entity.role,
      createdAt: entity.createdAt,
    };
  }

  async exists(criteria: Criteria): Promise<boolean> {
    const qb = this.repository.createQueryBuilder('user');
    this.applyCriteria(qb, criteria);
    return qb.getExists();
  }

  private applyCriteria(
    qb: ReturnType<Repository<UserOrmEntity>['createQueryBuilder']>,
    criteria: Criteria,
  ): void {
    const withEmail = criteria.getCriterion(WithEmail);
    if (withEmail !== false) {
      qb.andWhere('user.email = :email', { email: withEmail.getValue() });
    }
  }
}
