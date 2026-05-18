import { lastValueFrom } from 'rxjs';
import { CommandBus } from './command.bus';
import { MiddlewareStack } from '../../middleware/middleware.stack';
import { NoHandler } from '../../decorator/no-handler.decorator';
import { CommandIdentifier } from '../../identifier/command.identifier';
import { Name } from '../../value-object/name.value-object';
import { Version } from '../../value-object/version.value-object';
import type { CommandInterface } from '../../command/command.interface';
import type { ContainerInterface } from '../../service/container.interface';

@NoHandler()
class StubCommand implements CommandInterface {
  readonly id = CommandIdentifier.generate();
  readonly name = Name.fromString('StubCommand');
  readonly version = Version.fromNumber(1);
}

describe('CommandBus (bridge)', () => {
  let commandBus: CommandBus;
  let container: ContainerInterface;

  beforeEach(() => {
    container = { get: jest.fn() };
    commandBus = new CommandBus(container, new MiddlewareStack([]));
  });

  it('execute returns an Observable', () => {
    const result = commandBus.execute(new StubCommand());
    expect(typeof result.subscribe).toBe('function');
  });

  it('execute resolves with undefined for a @NoHandler command', async () => {
    await expect(
      lastValueFrom(commandBus.execute(new StubCommand())),
    ).resolves.toBeUndefined();
  });

  it('execute does not call container.get for a @NoHandler command', async () => {
    await lastValueFrom(commandBus.execute(new StubCommand()));
    expect(container.get).not.toHaveBeenCalled();
  });
});
