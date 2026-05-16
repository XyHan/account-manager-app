import type { EventInterface } from '../../../_shared/infrastructure/message-bus/event/event.interface';
import { Email } from '../value-objects/Email';
import { HashedPassword } from '../value-objects/HashedPassword';
import { Role } from '../value-objects/Role';
import { UserId } from '../value-objects/UserId';
import { PasswordChanged } from '../events/PasswordChanged';
import { UserRegistered } from '../events/UserRegistered';

export class User {
  private readonly domainEvents: EventInterface[] = [];

  private constructor(
    private readonly _id: UserId,
    private readonly _email: Email,
    private _passwordHash: HashedPassword,
    private readonly _role: Role,
    private readonly _createdAt: Date,
  ) {}

  static create(id: UserId, email: Email, passwordHash: HashedPassword): User {
    const user = new User(id, email, passwordHash, Role.user(), new Date());
    user.addDomainEvent(new UserRegistered(id.toString(), email.toString()));
    return user;
  }

  static reconstitute(
    id: UserId,
    email: Email,
    passwordHash: HashedPassword,
    role: Role,
    createdAt: Date,
  ): User {
    return new User(id, email, passwordHash, role, createdAt);
  }

  get id(): UserId { return this._id; }
  get email(): Email { return this._email; }
  get passwordHash(): HashedPassword { return this._passwordHash; }
  get role(): Role { return this._role; }
  get createdAt(): Date { return this._createdAt; }

  changePassword(newPasswordHash: HashedPassword): void {
    this._passwordHash = newPasswordHash;
    this.addDomainEvent(new PasswordChanged(this._id.toString()));
  }

  pullDomainEvents(): EventInterface[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }

  private addDomainEvent(event: EventInterface): void {
    this.domainEvents.push(event);
  }
}
