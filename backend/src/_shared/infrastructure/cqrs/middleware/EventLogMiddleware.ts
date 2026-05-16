import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { MiddlewareInterface } from '../../message-bus/middleware/middleware';
import type { MessageInterface } from '../../message-bus/message.interface';
import type { EventInterface } from '../../message-bus';
import { EventLogOrmEntity } from '../orm-entities/EventLog.orm-entity';

@Injectable()
export class EventLogMiddleware implements MiddlewareInterface {
  constructor(
    @InjectRepository(EventLogOrmEntity)
    private readonly eventLogRepository: Repository<EventLogOrmEntity>,
  ) {}

  async apply(message: MessageInterface): Promise<void> {
    const event = message as unknown as EventInterface;
    await this.eventLogRepository.save({
      name: event.name.value,
      payload: { ...(event as unknown as Record<string, unknown>) },
      commandLogId: null,
    });
  }
}
