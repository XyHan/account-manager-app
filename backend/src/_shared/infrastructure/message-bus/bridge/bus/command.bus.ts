import { Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CommandBus as DomainCommandBus } from '../../bus/command.bus';
import type { MessageBusInterface } from '../../bus/message.bus';
import type { MiddlewareStack } from '../../middleware/middleware.stack';
import type { CommandInterface } from '../../command/command.interface';
import type { ContainerInterface } from '../../service/container.interface';
import { ModuleRefAdapter } from '../adapter/module-ref.adapter';
import type { ICommandBus } from '../../../../domain/bus/ICommandBus';
import type { ICommand } from '../../../../domain/bus/ICommand';

@Injectable()
export class CommandBus implements MessageBusInterface, ICommandBus {
  private readonly commandBus: DomainCommandBus;

  constructor(
    @Inject(ModuleRefAdapter) container: ContainerInterface,
    @Inject('COMMAND_BUS_MIDDLEWARES') middlewares: MiddlewareStack,
  ) {
    this.commandBus = new DomainCommandBus(container, middlewares);
  }

  execute(command: ICommand): Observable<unknown> {
    return this.commandBus.execute(command as CommandInterface);
  }
}
