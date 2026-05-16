import { EventLogMiddleware } from './EventLogMiddleware';
import { Name } from '../../message-bus/value-object/name.value-object';
import type { MessageInterface } from '../../message-bus/message.interface';

const makeEvent = (overrides: Record<string, unknown> = {}): MessageInterface => ({
  name: Name.fromString('UserRegistered'),
  userId: 'user-123',
  email: 'a@b.com',
  ...overrides,
} as unknown as MessageInterface);

describe('EventLogMiddleware', () => {
  let middleware: EventLogMiddleware;
  let eventLogRepo: { save: jest.Mock };

  beforeEach(() => {
    eventLogRepo = { save: jest.fn().mockResolvedValue({}) };
    middleware = new EventLogMiddleware(eventLogRepo as never);
  });

  it('saves the event with its name', async () => {
    await middleware.apply(makeEvent());

    expect(eventLogRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'UserRegistered' }),
    );
  });

  it('saves commandLogId as null', async () => {
    await middleware.apply(makeEvent());

    expect(eventLogRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ commandLogId: null }),
    );
  });

  it('saves the event payload', async () => {
    await middleware.apply(makeEvent({ userId: 'u-999', email: 'x@y.com' }));

    const saved = eventLogRepo.save.mock.calls[0][0] as { payload: Record<string, unknown> };
    expect(saved.payload['userId']).toBe('u-999');
    expect(saved.payload['email']).toBe('x@y.com');
  });

  it('calls save exactly once per event', async () => {
    await middleware.apply(makeEvent());

    expect(eventLogRepo.save).toHaveBeenCalledTimes(1);
  });
});
