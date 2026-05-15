import { mergeMap, Observable } from 'rxjs';
import { MessageBus, type MessageBusInterface } from './message.bus';
import type { MiddlewareStack } from '../middleware/middleware.stack';
import type { QueryInterface } from '../query/query.interface';
import type { QueryHandlerInterface } from '../query/query-handler.interface';
import type { ContainerInterface } from '../service/container.interface';

export class QueryBus implements MessageBusInterface {
  private readonly _messageBus: MessageBusInterface;
  private readonly _container: ContainerInterface;

  constructor(container: ContainerInterface, middlewares: MiddlewareStack) {
    this._messageBus = new MessageBus(middlewares);
    this._container = container;
  }

  execute(query: QueryInterface): Observable<unknown> {
    return this._messageBus.execute(query).pipe(
      mergeMap(async (msg) => {
        if (Reflect.getMetadata('noHandler', (msg as QueryInterface).constructor) !== undefined) return;

        const meta: { handler: new () => QueryHandlerInterface } | undefined =
          Reflect.getMetadata('queryHandler', (msg as QueryInterface).constructor);
        if (!meta) throw new Error(`Handler not found for ${(msg as QueryInterface).name.value}`);

        const handler = this._container.get(meta.handler) as QueryHandlerInterface;
        if (!handler) throw new Error(`Handler provider not found for ${(msg as QueryInterface).name.value}`);

        return handler.handle(msg as QueryInterface);
      }),
    );
  }
}
