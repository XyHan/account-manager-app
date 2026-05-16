import { DynamicModule, Module, Type } from '@nestjs/common';
import type { MiddlewareInterface } from '../middleware/middleware';
import { MiddlewareStack } from '../middleware/middleware.stack';
import { CommandBus } from './bus/command.bus';
import { QueryBus } from './bus/query.bus';
import { EventBus } from './bus/event.bus';
import { ModuleRefAdapter } from './adapter/module-ref.adapter';

@Module({})
export class MessageBusModule {
  static registerMiddlewares(options: {
    commandBus?: Type<MiddlewareInterface>[];
    queryBus?: Type<MiddlewareInterface>[];
    eventBus?: Type<MiddlewareInterface>[];
    imports?: (Type<unknown> | DynamicModule)[];
  }): DynamicModule {
    const commandMiddlewares = options.commandBus ?? [];
    const queryMiddlewares = options.queryBus ?? [];
    const eventMiddlewares = options.eventBus ?? [];
    const allMiddlewares = [...new Set([...commandMiddlewares, ...queryMiddlewares, ...eventMiddlewares])];

    return {
      module: MessageBusModule,
      imports: options.imports ?? [],
      providers: [
        ...allMiddlewares,
        {
          provide: 'COMMAND_BUS_MIDDLEWARES',
          inject: commandMiddlewares,
          useFactory: (...middlewares: MiddlewareInterface[]) => new MiddlewareStack(middlewares),
        },
        {
          provide: 'QUERY_BUS_MIDDLEWARES',
          inject: queryMiddlewares,
          useFactory: (...middlewares: MiddlewareInterface[]) => new MiddlewareStack(middlewares),
        },
        {
          provide: 'EVENT_BUS_MIDDLEWARES',
          inject: eventMiddlewares,
          useFactory: (...middlewares: MiddlewareInterface[]) => new MiddlewareStack(middlewares),
        },
        CommandBus,
        QueryBus,
        EventBus,
        ModuleRefAdapter,
      ],
      exports: [CommandBus, QueryBus, EventBus],
    };
  }
}
