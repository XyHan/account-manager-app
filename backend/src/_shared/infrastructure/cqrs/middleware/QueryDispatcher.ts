import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { QueryBus } from '../../message-bus/bridge/bus/query.bus';
import type { QueryInterface } from '../../message-bus/query/query.interface';

@Injectable()
export class QueryDispatcher {
  constructor(private readonly queryBus: QueryBus) {}

  async dispatch<R>(query: QueryInterface): Promise<R> {
    return lastValueFrom(this.queryBus.execute(query)) as Promise<R>;
  }
}
