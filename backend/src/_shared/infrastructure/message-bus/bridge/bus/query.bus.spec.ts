import { lastValueFrom } from 'rxjs';
import { QueryBus } from './query.bus';
import { MiddlewareStack } from '../../middleware/middleware.stack';
import { NoHandler } from '../../decorator/no-handler.decorator';
import { QueryIdentifier } from '../../identifier/query.identifier';
import { Name } from '../../value-object/name.value-object';
import { Version } from '../../value-object/version.value-object';
import type { QueryInterface } from '../../query/query.interface';
import type { ContainerInterface } from '../../service/container.interface';

@NoHandler()
class StubQuery implements QueryInterface {
  readonly id = QueryIdentifier.generate();
  readonly name = Name.fromString('StubQuery');
  readonly version = Version.fromNumber(1);
}

describe('QueryBus (bridge)', () => {
  let queryBus: QueryBus;
  let container: ContainerInterface;

  beforeEach(() => {
    container = { get: jest.fn() };
    queryBus = new QueryBus(container, new MiddlewareStack([]));
  });

  it('execute returns an Observable', () => {
    const result = queryBus.execute(new StubQuery());
    expect(typeof result.subscribe).toBe('function');
  });

  it('execute resolves with undefined for a @NoHandler query', async () => {
    await expect(
      lastValueFrom(queryBus.execute(new StubQuery())),
    ).resolves.toBeUndefined();
  });

  it('execute does not call container.get for a @NoHandler query', async () => {
    await lastValueFrom(queryBus.execute(new StubQuery()));
    expect(container.get).not.toHaveBeenCalled();
  });
});
