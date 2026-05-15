import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBus } from '../../message-bus/bridge/bus/event.bus';
import type { EventInterface } from '../../message-bus/event/event.interface';
import { EventLogOrmEntity } from '../orm-entities/EventLog.orm-entity';

@Injectable()
export class EventLogSubscriber implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBus,
    @InjectRepository(EventLogOrmEntity)
    private readonly eventLogRepository: Repository<EventLogOrmEntity>,
  ) {}

  onModuleInit(): void {
    this.eventBus.events$.subscribe((event: EventInterface) => {
      void this.logEvent(event);
    });
  }

  private async logEvent(event: EventInterface): Promise<void> {
    await this.eventLogRepository.save({
      name: event.name.value,
      payload: { ...(event as unknown as Record<string, unknown>) },
      commandLogId: null,
    });
  }
}
