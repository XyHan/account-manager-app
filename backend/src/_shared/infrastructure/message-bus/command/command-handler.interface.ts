import type { CommandInterface } from './command.interface';
import type { MessageHandlerInterface } from '../message-handler.interface';

export interface CommandHandlerInterface extends MessageHandlerInterface {
  handle(command: CommandInterface): unknown | Promise<unknown>;
}
