import type { MessageInterface } from '../message.interface';

// PR: apply() is now async-compatible (returns void | Promise<void>)
export interface MiddlewareInterface {
  apply(message: MessageInterface): void | Promise<void>;
}
