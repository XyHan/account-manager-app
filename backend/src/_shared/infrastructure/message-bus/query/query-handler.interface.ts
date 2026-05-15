import type { QueryInterface } from './query.interface';
import type { MessageHandlerInterface } from '../message-handler.interface';

export interface QueryHandlerInterface extends MessageHandlerInterface {
  handle(query: QueryInterface): unknown | Promise<unknown>;
}
