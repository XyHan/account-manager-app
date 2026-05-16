import { CommandLogMiddleware } from './CommandLogMiddleware';
import { Name } from '../../message-bus/value-object/name.value-object';
import type { CommandInterface } from '../../message-bus/command/command.interface';
import type { MessageInterface } from '../../message-bus/message.interface';

const makeCommand = (overrides: Record<string, unknown> = {}): MessageInterface => ({
  name: Name.fromString('RegisterUserCommand'),
  ...overrides,
} as unknown as MessageInterface);

describe('CommandLogMiddleware', () => {
  let middleware: CommandLogMiddleware;
  let commandLogRepo: { save: jest.Mock };

  beforeEach(() => {
    commandLogRepo = { save: jest.fn().mockResolvedValue({}) };
    middleware = new CommandLogMiddleware(commandLogRepo as never);
  });

  it('saves the command name and userId', async () => {
    await middleware.apply(makeCommand({ userId: 'user-123' }));

    expect(commandLogRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'RegisterUserCommand',
        userId: 'user-123',
      }),
    );
  });

  it('sets userId to null when not present', async () => {
    await middleware.apply(makeCommand());

    expect(commandLogRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ userId: null }),
    );
  });

  it('strips password from payload', async () => {
    await middleware.apply(makeCommand({ password: 'secret', email: 'a@b.com' }));

    const saved = commandLogRepo.save.mock.calls[0][0] as { payload: Record<string, unknown> };
    expect(saved.payload['password']).toBeUndefined();
    expect(saved.payload['email']).toBe('a@b.com');
  });

  it('strips currentPassword and newPassword from payload', async () => {
    await middleware.apply(makeCommand({ currentPassword: 'old', newPassword: 'new', email: 'a@b.com' }));

    const saved = commandLogRepo.save.mock.calls[0][0] as { payload: Record<string, unknown> };
    expect(saved.payload['currentPassword']).toBeUndefined();
    expect(saved.payload['newPassword']).toBeUndefined();
    expect(saved.payload['email']).toBe('a@b.com');
  });

  it('strips internal message-bus fields (id, name, version) from payload', async () => {
    await middleware.apply(makeCommand({ id: 'cmd-id', version: 1, email: 'a@b.com' }));

    const saved = commandLogRepo.save.mock.calls[0][0] as { payload: Record<string, unknown> };
    expect(saved.payload['id']).toBeUndefined();
    expect(saved.payload['name']).toBeUndefined();
    expect(saved.payload['version']).toBeUndefined();
  });

  it('stores the command name from the Name value object', async () => {
    const command = makeCommand() as unknown as CommandInterface;
    await middleware.apply(command as unknown as MessageInterface);

    expect(commandLogRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'RegisterUserCommand' }),
    );
  });
});
