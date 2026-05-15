import { Inject, Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { EventBus as DomainEventBus } from '../../bus/event.bus';
import type { MessageBusInterface } from '../../bus/message.bus';
import type { MiddlewareStack } from '../../middleware/middleware.stack';
import type { EventInterface } from '../../event/event.interface';
import type { ContainerInterface } from '../../service/container.interface';
import { ModuleRefAdapter } from '../adapter/module-ref.adapter';

@Injectable()
export class EventBus implements MessageBusInterface {
  private readonly eventBus: DomainEventBus;

  constructor(
    @Inject(ModuleRefAdapter) container: ContainerInterface,
    @Inject('EVENT_BUS_MIDDLEWARES') middlewares: MiddlewareStack,
  ) {
    this.eventBus = new DomainEventBus(container, middlewares);
  }

  get events$(): Subject<EventInterface> {
    return this.eventBus.events$;
  }

  execute(event: EventInterface): Observable<unknown> {
    return this.eventBus.execute(event);
  }
}
