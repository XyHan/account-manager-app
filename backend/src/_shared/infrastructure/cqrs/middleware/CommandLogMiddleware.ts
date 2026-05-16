import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { MiddlewareInterface } from '../../message-bus/middleware/middleware';
import type { MessageInterface } from '../../message-bus/message.interface';
import type { CommandInterface } from '../../message-bus/command/command.interface';
import { CommandLogOrmEntity } from '../orm-entities/CommandLog.orm-entity';

@Injectable()
export class CommandLogMiddleware implements MiddlewareInterface {
  constructor(
    @InjectRepository(CommandLogOrmEntity)
    private readonly commandLogRepository: Repository<CommandLogOrmEntity>,
  ) {}

  async apply(message: MessageInterface): Promise<void> {
    const command = message as unknown as CommandInterface;
    const raw = command as unknown as Record<string, unknown>;

    await this.commandLogRepository.save({
      name: command.name.value,
      payload: this.sanitizePayload(command),
      userId: raw['userId'] != null ? String(raw['userId']) : null,
    });
  }

  private sanitizePayload(command: CommandInterface): Record<string, unknown> {
    const raw = { ...(command as unknown as Record<string, unknown>) };
    delete raw['password'];
    delete raw['currentPassword'];
    delete raw['newPassword'];
    delete raw['id'];
    delete raw['name'];
    delete raw['version'];
    return raw;
  }
}
