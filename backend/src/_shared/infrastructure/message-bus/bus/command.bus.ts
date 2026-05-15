import { mergeMap, Observable } from 'rxjs';
import { MessageBus, type MessageBusInterface } from './message.bus';
import type { MiddlewareStack } from '../middleware/middleware.stack';
import type { CommandInterface } from '../command/command.interface';
import type { CommandHandlerInterface } from '../command/command-handler.interface';
import type { ContainerInterface } from '../service/container.interface';

export class CommandBus implements MessageBusInterface {
  private readonly _messageBus: MessageBusInterface;

  constructor(container: ContainerInterface, middlewares: MiddlewareStack) {
    this._messageBus = new MessageBus(middlewares);
    this._container = container;
  }

  private readonly _container: ContainerInterface;

  execute(command: CommandInterface): Observable<unknown> {
    return this._messageBus.execute(command).pipe(
      mergeMap(async (msg) => {
        if (Reflect.getMetadata('noHandler', (msg as CommandInterface).constructor) !== undefined) return;

        const meta: { handler: new () => CommandHandlerInterface } | undefined =
          Reflect.getMetadata('commandHandler', (msg as CommandInterface).constructor);
        if (!meta) throw new Error(`Handler not found for ${(msg as CommandInterface).name.value}`);

        const handler = this._container.get(meta.handler) as CommandHandlerInterface;
        if (!handler) throw new Error(`Handler provider not found for ${(msg as CommandInterface).name.value}`);

        return handler.handle(msg as CommandInterface);
      }),
    );
  }
}
