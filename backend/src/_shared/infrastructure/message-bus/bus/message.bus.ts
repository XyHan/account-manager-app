import { from, Observable } from 'rxjs';
import type { MessageInterface } from '../message.interface';
import type { MiddlewareStack } from '../middleware/middleware.stack';

export interface MessageBusInterface {
  execute(message: MessageInterface): Observable<unknown>;
}

// PR: middleware execution is now async to support async middlewares
export class MessageBus implements MessageBusInterface {
  constructor(private readonly middlewareStack: MiddlewareStack) {}

  execute(message: MessageInterface): Observable<MessageInterface> {
    return from(this.runMiddlewares(message));
  }

  private async runMiddlewares(message: MessageInterface): Promise<MessageInterface> {
    this.middlewareStack.rewind();
    let next = this.middlewareStack.next();
    while (!next.done) {
      await next.value.apply(message);
      next = this.middlewareStack.next();
    }
    return message;
  }
}
