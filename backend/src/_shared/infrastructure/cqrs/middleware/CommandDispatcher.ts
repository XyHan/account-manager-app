import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { CommandBus } from '../../message-bus/bridge/bus/command.bus';
import type { CommandInterface } from '../../message-bus/command/command.interface';
import { CommandLogOrmEntity } from '../orm-entities/CommandLog.orm-entity';
import { CommandLogStatus } from '../orm-entities/CommandLogStatus';

@Injectable()
export class CommandDispatcher {
  constructor(
    private readonly commandBus: CommandBus,
    @InjectRepository(CommandLogOrmEntity)
    private readonly commandLogRepository: Repository<CommandLogOrmEntity>,
  ) {}

  async dispatch<R>(command: CommandInterface): Promise<R> {
    const payload = this.sanitizePayload(command);
    const raw = command as unknown as Record<string, unknown>;

    const log = this.commandLogRepository.create({
      name: command.name.value,
      payload,
      userId: raw['userId'] != null ? String(raw['userId']) : null,
      status: CommandLogStatus.PENDING,
    });
    const saved = await this.commandLogRepository.save(log);

    try {
      const result = await lastValueFrom(this.commandBus.execute(command)) as R;
      await this.commandLogRepository.update(saved.id, { status: CommandLogStatus.SUCCESS });
      return result;
    } catch (error: unknown) {
      await this.commandLogRepository.update(saved.id, {
        status: CommandLogStatus.FAILURE,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private sanitizePayload(command: CommandInterface): Record<string, unknown> {
    const raw = { ...(command as unknown as Record<string, unknown>) };
    delete raw['password'];
    delete raw['currentPassword'];
    delete raw['newPassword'];
    // strip message-bus internal fields from log payload
    delete raw['id'];
    delete raw['name'];
    delete raw['version'];
    return raw;
  }
}
