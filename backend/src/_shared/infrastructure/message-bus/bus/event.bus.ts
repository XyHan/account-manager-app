import { mergeMap, Observable, Subject, tap } from 'rxjs';
import { MessageBus, type MessageBusInterface } from './message.bus';
import type { MiddlewareStack } from '../middleware/middleware.stack';
import type { EventInterface } from '../event/event.interface';
import type { EventHandlerInterface } from '../event/event-handler.interface';
import type { ContainerInterface } from '../service/container.interface';

export class EventBus implements MessageBusInterface {
  private readonly _messageBus: MessageBusInterface;
  private readonly _container: ContainerInterface;

  // PR: events$ allows subscribers (e.g. EventLogSubscriber) to observe all dispatched events
  readonly events$ = new Subject<EventInterface>();

  constructor(container: ContainerInterface, middlewares: MiddlewareStack) {
    this._messageBus = new MessageBus(middlewares);
    this._container = container;
  }

  execute(event: EventInterface): Observable<unknown> {
    return this._messageBus.execute(event).pipe(
      tap(() => this.events$.next(event)),
      mergeMap(async (msg) => {
        if (Reflect.getMetadata('noHandler', (msg as EventInterface).constructor) !== undefined) return;

        const meta: { handler: new () => EventHandlerInterface } | undefined =
          Reflect.getMetadata('eventHandler', (msg as EventInterface).constructor);
        if (!meta) throw new Error(`Handler not found for ${(msg as EventInterface).name.value}`);

        const handler = this._container.get(meta.handler) as EventHandlerInterface;
        if (!handler) throw new Error(`Handler provider not found for ${(msg as EventInterface).name.value}`);

        return handler.handle(msg as EventInterface);
      }),
    );
  }
}
