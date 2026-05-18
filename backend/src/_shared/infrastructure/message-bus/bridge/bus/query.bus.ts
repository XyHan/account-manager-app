import { Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { QueryBus as DomainQueryBus } from '../../bus/query.bus';
import type { MessageBusInterface } from '../../bus/message.bus';
import type { MiddlewareStack } from '../../middleware/middleware.stack';
import type { QueryInterface } from '../../query/query.interface';
import type { ContainerInterface } from '../../service/container.interface';
import { ModuleRefAdapter } from '../adapter/module-ref.adapter';
import type { IQueryBus } from '../../../../domain/bus/IQueryBus';
import type { IQuery } from '../../../../domain/bus/IQuery';

@Injectable()
export class QueryBus implements MessageBusInterface, IQueryBus {
  private readonly queryBus: DomainQueryBus;

  constructor(
    @Inject(ModuleRefAdapter) container: ContainerInterface,
    @Inject('QUERY_BUS_MIDDLEWARES') middlewares: MiddlewareStack,
  ) {
    this.queryBus = new DomainQueryBus(container, middlewares);
  }

  execute(query: IQuery): Observable<unknown> {
    return this.queryBus.execute(query as QueryInterface);
  }
}
