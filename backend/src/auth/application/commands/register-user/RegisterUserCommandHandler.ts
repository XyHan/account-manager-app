import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import type { CommandHandlerInterface } from '../../../../_shared/infrastructure/message-bus/command/command-handler.interface';
import { EventBus } from '../../../../_shared/infrastructure/message-bus/bridge/bus/event.bus';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { USER_REPOSITORY } from '../../../domain/repositories/IUserRepository';
import type { IUserFinder } from '../../../domain/finders/IUserFinder';
import { USER_FINDER } from '../../../domain/finders/IUserFinder';
import { User } from '../../../domain/entities/User';
import { UserId } from '../../../domain/value-objects/UserId';
import { Email } from '../../../domain/value-objects/Email';
import { HashedPassword } from '../../../domain/value-objects/HashedPassword';
import { Criteria } from '../../../../_shared/domain/criteria/Criteria';
import { WithEmail } from '../../../domain/criteria/WithEmail';
import { EmailAlreadyExistsException } from '../../../domain/exceptions/EmailAlreadyExistsException';
import type { RegisterUserCommand } from './RegisterUserCommand';

@Injectable()
export class RegisterUserCommandHandler implements CommandHandlerInterface {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(USER_FINDER)
    private readonly userFinder: IUserFinder,
    private readonly eventBus: EventBus,
  ) {}

  async handle(command: RegisterUserCommand): Promise<void> {
    const email = Email.from(command.email);

    const alreadyExists = await this.userFinder.exists(
      Criteria.fromArray([WithEmail.from(email)]),
    );

    if (alreadyExists) {
      throw new ConflictException(new EmailAlreadyExistsException(command.email).message);
    }

    const passwordHash = await HashedPassword.fromPlain(command.password);
    const user = User.create(UserId.from(command.userId), email, passwordHash);

    await this.userRepository.save(user);

    for (const event of user.pullDomainEvents()) {
      await lastValueFrom(this.eventBus.execute(event));
    }
  }
}
