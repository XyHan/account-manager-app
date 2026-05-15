import { Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CommandBus as DomainCommandBus } from '../../bus/command.bus';
import type { MessageBusInterface } from '../../bus/message.bus';
import type { MiddlewareStack } from '../../middleware/middleware.stack';
import type { CommandInterface } from '../../command/command.interface';
import type { ContainerInterface } from '../../service/container.interface';
import { ModuleRefAdapter } from '../adapter/module-ref.adapter';

@Injectable()
export class CommandBus implements MessageBusInterface {
  private readonly commandBus: DomainCommandBus;

  constructor(
    @Inject(ModuleRefAdapter) container: ContainerInterface,
    @Inject('COMMAND_BUS_MIDDLEWARES') middlewares: MiddlewareStack,
  ) {
    this.commandBus = new DomainCommandBus(container, middlewares);
  }

  execute(command: CommandInterface): Observable<unknown> {
    return this.commandBus.execute(command);
  }
}
