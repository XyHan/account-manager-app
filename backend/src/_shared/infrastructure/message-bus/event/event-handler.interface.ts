import type { EventInterface } from './event.interface';
import type { MessageHandlerInterface } from '../message-handler.interface';

export interface EventHandlerInterface extends MessageHandlerInterface {
  handle(event: EventInterface): void | Promise<void>;
}
