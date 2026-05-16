import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { of } from 'rxjs';
import { ChangePasswordCommandHandler } from './ChangePasswordCommandHandler';
import { ChangePasswordCommand } from './ChangePasswordCommand';
import { User } from '../../../domain/entities/User';
import { UserId } from '../../../domain/value-objects/UserId';
import { Email } from '../../../domain/value-objects/Email';
import { HashedPassword } from '../../../domain/value-objects/HashedPassword';
import { Role } from '../../../domain/value-objects/Role';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import type { OAuthService } from '../../../infrastructure/oauth/OAuthService';
import type { EventBus } from '../../../../_shared/infrastructure/message-bus/bridge/bus/event.bus';

const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const CURRENT_PASSWORD = 'OldPass123';
const NEW_PASSWORD = 'NewPass456';

async function buildUser(password = CURRENT_PASSWORD): Promise<User> {
  const hash = await HashedPassword.fromPlain(password);
  return User.reconstitute(
    UserId.from(TEST_USER_ID),
    Email.from('test@example.com'),
    hash,
    Role.user(),
    new Date(),
  );
}

describe('ChangePasswordCommandHandler', () => {
  let handler: ChangePasswordCommandHandler;
  let userRepository: jest.Mocked<IUserRepository>;
  let oauthService: jest.Mocked<Pick<OAuthService, 'revokeAllUserTokens'>>;
  let eventBus: { execute: jest.Mock };

  beforeEach(() => {
    userRepository = { save: jest.fn(), findById: jest.fn() };
    oauthService = { revokeAllUserTokens: jest.fn().mockResolvedValue(undefined) };
    eventBus = { execute: jest.fn().mockReturnValue(of(undefined)) };

    handler = new ChangePasswordCommandHandler(
      userRepository,
      oauthService as unknown as OAuthService,
      eventBus as unknown as EventBus,
    );
  });

  it('throws NotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      handler.handle(new ChangePasswordCommand(TEST_USER_ID, CURRENT_PASSWORD, NEW_PASSWORD)),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws UnauthorizedException when current password is wrong', async () => {
    userRepository.findById.mockResolvedValue(await buildUser());

    await expect(
      handler.handle(new ChangePasswordCommand(TEST_USER_ID, 'WrongPassword!', NEW_PASSWORD)),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('saves user with new hashed password', async () => {
    const user = await buildUser();
    userRepository.findById.mockResolvedValue(user);
    userRepository.save.mockResolvedValue(undefined);

    await handler.handle(new ChangePasswordCommand(TEST_USER_ID, CURRENT_PASSWORD, NEW_PASSWORD));

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    const savedUser: User = userRepository.save.mock.calls[0][0];
    const newHashValid = await savedUser.passwordHash.verify(NEW_PASSWORD);
    expect(newHashValid).toBe(true);
  });

  it('revokes all user tokens after password change', async () => {
    userRepository.findById.mockResolvedValue(await buildUser());
    userRepository.save.mockResolvedValue(undefined);

    await handler.handle(new ChangePasswordCommand(TEST_USER_ID, CURRENT_PASSWORD, NEW_PASSWORD));

    expect(oauthService.revokeAllUserTokens).toHaveBeenCalledWith(TEST_USER_ID);
  });

  it('dispatches PasswordChanged event', async () => {
    userRepository.findById.mockResolvedValue(await buildUser());
    userRepository.save.mockResolvedValue(undefined);

    await handler.handle(new ChangePasswordCommand(TEST_USER_ID, CURRENT_PASSWORD, NEW_PASSWORD));

    expect(eventBus.execute).toHaveBeenCalledTimes(1);
    const dispatchedEvent = eventBus.execute.mock.calls[0][0];
    expect(dispatchedEvent.constructor.name).toBe('PasswordChanged');
    expect(dispatchedEvent.userId).toBe(TEST_USER_ID);
  });

  it('does not save or revoke tokens when current password is wrong', async () => {
    userRepository.findById.mockResolvedValue(await buildUser());

    await expect(
      handler.handle(new ChangePasswordCommand(TEST_USER_ID, 'BadPassword!', NEW_PASSWORD)),
    ).rejects.toThrow(UnauthorizedException);

    expect(userRepository.save).not.toHaveBeenCalled();
    expect(oauthService.revokeAllUserTokens).not.toHaveBeenCalled();
    expect(eventBus.execute).not.toHaveBeenCalled();
  });
});
