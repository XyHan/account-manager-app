import { DynamicModule, Module } from '@nestjs/common';
import type { MiddlewareInterface } from '../middleware/middleware';
import { MiddlewareStack } from '../middleware/middleware.stack';
import { CommandBus } from './bus/command.bus';
import { QueryBus } from './bus/query.bus';
import { EventBus } from './bus/event.bus';
import { ModuleRefAdapter } from './adapter/module-ref.adapter';

@Module({})
export class MessageBusModule {
  static registerMiddlewares(middlewares: {
    commandBus?: MiddlewareInterface[];
    queryBus?: MiddlewareInterface[];
    eventBus?: MiddlewareInterface[];
  }): DynamicModule {
    return {
      module: MessageBusModule,
      providers: [
        { provide: 'COMMAND_BUS_MIDDLEWARES', useValue: new MiddlewareStack(middlewares.commandBus ?? []) },
        { provide: 'QUERY_BUS_MIDDLEWARES', useValue: new MiddlewareStack(middlewares.queryBus ?? []) },
        { provide: 'EVENT_BUS_MIDDLEWARES', useValue: new MiddlewareStack(middlewares.eventBus ?? []) },
        CommandBus,
        QueryBus,
        EventBus,
        ModuleRefAdapter,
      ],
      exports: [CommandBus, QueryBus, EventBus],
    };
  }
}
