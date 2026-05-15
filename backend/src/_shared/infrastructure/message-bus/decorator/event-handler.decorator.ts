import 'reflect-metadata';
import type { EventHandlerInterface } from '../event/event-handler.interface';

export function EventHandler(handler: new (...args: unknown[]) => EventHandlerInterface) {
  return (target: object) => {
    Reflect.defineMetadata('eventHandler', { handler }, target);
  };
}
