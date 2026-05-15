import { User } from '../entities/User';
import { UserId } from '../value-objects/UserId';

export const USER_REPOSITORY = 'IUserRepository';

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
}
