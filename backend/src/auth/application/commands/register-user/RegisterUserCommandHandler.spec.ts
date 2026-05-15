import { ConflictException } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { RegisterUserCommandHandler } from './RegisterUserCommandHandler';
import { RegisterUserCommand } from './RegisterUserCommand';
import { EventBus } from '../../../../_shared/infrastructure/message-bus/bridge/bus/event.bus';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import type { IUserFinder } from '../../../domain/finders/IUserFinder';

const mockUserRepository: jest.Mocked<IUserRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
};

const mockUserFinder: jest.Mocked<IUserFinder> = {
  findOne: jest.fn(),
  exists: jest.fn(),
};

const mockEventBus = {
  execute: jest.fn().mockReturnValue(of(undefined)),
} as unknown as EventBus;

const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('RegisterUserCommandHandler', () => {
  let handler: RegisterUserCommandHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new RegisterUserCommandHandler(
      mockUserRepository,
      mockUserFinder,
      mockEventBus,
    );
  });

  it('should register a new user and publish UserRegistered event', async () => {
    mockUserFinder.exists.mockResolvedValue(false);
    mockUserRepository.save.mockResolvedValue(undefined);

    await handler.handle(new RegisterUserCommand(TEST_USER_ID, 'test@example.com', 'password123'));

    expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    expect(mockEventBus.execute).toHaveBeenCalledTimes(1);
    const dispatchedEvent = (mockEventBus.execute as jest.Mock).mock.calls[0][0];
    expect(dispatchedEvent.constructor.name).toBe('UserRegistered');
    expect(dispatchedEvent.email).toBe('test@example.com');
  });

  it('should throw ConflictException when email already exists', async () => {
    mockUserFinder.exists.mockResolvedValue(true);

    await expect(
      handler.handle(new RegisterUserCommand(TEST_USER_ID, 'existing@example.com', 'password123')),
    ).rejects.toThrow(ConflictException);

    expect(mockUserRepository.save).not.toHaveBeenCalled();
    expect(mockEventBus.execute).not.toHaveBeenCalled();
  });

  it('should hash the password before saving', async () => {
    mockUserFinder.exists.mockResolvedValue(false);
    mockUserRepository.save.mockResolvedValue(undefined);

    await handler.handle(new RegisterUserCommand(TEST_USER_ID, 'test@example.com', 'password123'));

    const savedUser = (mockUserRepository.save as jest.Mock).mock.calls[0][0];
    expect(savedUser.passwordHash.toString()).not.toBe('password123');
    expect(savedUser.passwordHash.toString()).toMatch(/^\$2[ab]\$/);
  });

  it('should assign USER role by default', async () => {
    mockUserFinder.exists.mockResolvedValue(false);
    mockUserRepository.save.mockResolvedValue(undefined);

    await handler.handle(new RegisterUserCommand(TEST_USER_ID, 'test@example.com', 'password123'));

    const savedUser = (mockUserRepository.save as jest.Mock).mock.calls[0][0];
    expect(savedUser.role.toString()).toBe('USER');
  });

  it('should use the client-provided userId', async () => {
    mockUserFinder.exists.mockResolvedValue(false);
    mockUserRepository.save.mockResolvedValue(undefined);

    await handler.handle(new RegisterUserCommand(TEST_USER_ID, 'test@example.com', 'password123'));

    const savedUser = (mockUserRepository.save as jest.Mock).mock.calls[0][0];
    expect(savedUser.id.toString()).toBe(TEST_USER_ID);
  });
});
