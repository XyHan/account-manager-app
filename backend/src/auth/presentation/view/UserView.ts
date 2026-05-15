import { UserReadModel } from '../../domain/models/UserReadModel';

export class UserView {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly role: string,
    public readonly createdAt: Date,
  ) {}

  static fromReadModel(model: UserReadModel): UserView {
    return new UserView(model.id, model.email, model.role, model.createdAt);
  }

  serialize(): object {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
    };
  }
}
