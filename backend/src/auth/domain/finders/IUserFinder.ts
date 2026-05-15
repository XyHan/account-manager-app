import { Criteria } from '../../../_shared/domain/criteria/Criteria';
import { UserReadModel } from '../models/UserReadModel';

export const USER_FINDER = 'IUserFinder';

export interface IUserFinder {
  findOne(criteria: Criteria): Promise<UserReadModel | null>;
  exists(criteria: Criteria): Promise<boolean>;
}
