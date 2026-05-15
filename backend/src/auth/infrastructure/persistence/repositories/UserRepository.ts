import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import { UserId } from '../../../domain/value-objects/UserId';
import { Email } from '../../../domain/value-objects/Email';
import { HashedPassword } from '../../../domain/value-objects/HashedPassword';
import { Role } from '../../../domain/value-objects/Role';
import { UserOrmEntity } from '../orm-entities/UserOrmEntity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async save(user: User): Promise<void> {
    const entity = this.repository.create({
      id: user.id.toString(),
      email: user.email.toString(),
      passwordHash: user.passwordHash.toString(),
      role: user.role.toString() as UserOrmEntity['role'],
    });
    await this.repository.save(entity);
  }

  async findById(id: UserId): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: { id: id.toString() },
    });
    if (entity === null) return null;
    return this.toDomain(entity);
  }

  private toDomain(entity: UserOrmEntity): User {
    return User.reconstitute(
      UserId.from(entity.id),
      Email.from(entity.email),
      HashedPassword.fromHash(entity.passwordHash),
      Role.from(entity.role),
      entity.createdAt,
    );
  }
}
