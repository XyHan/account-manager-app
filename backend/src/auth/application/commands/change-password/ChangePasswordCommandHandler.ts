import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import type { CommandHandlerInterface } from '../../../../_shared/infrastructure/message-bus/command/command-handler.interface';
import { EventBus } from '../../../../_shared/infrastructure/message-bus/bridge/bus/event.bus';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { USER_REPOSITORY } from '../../../domain/repositories/IUserRepository';
import { UserId } from '../../../domain/value-objects/UserId';
import { HashedPassword } from '../../../domain/value-objects/HashedPassword';
import { OAuthService } from '../../../infrastructure/oauth/OAuthService';
import type { ChangePasswordCommand } from './ChangePasswordCommand';

@Injectable()
export class ChangePasswordCommandHandler implements CommandHandlerInterface {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly oauthService: OAuthService,
    private readonly eventBus: EventBus,
  ) {}

  async handle(command: ChangePasswordCommand): Promise<void> {
    const user = await this.userRepository.findById(UserId.from(command.userId));
    if (!user) throw new NotFoundException('User not found');

    const isValid = await user.passwordHash.verify(command.currentPassword);
    if (!isValid) throw new UnauthorizedException('Current password is incorrect');

    const newHash = await HashedPassword.fromPlain(command.newPassword);
    user.changePassword(newHash);

    await this.userRepository.save(user);
    await this.oauthService.revokeAllUserTokens(command.userId);

    for (const event of user.pullDomainEvents()) {
      await lastValueFrom(this.eventBus.execute(event));
    }
  }
}
