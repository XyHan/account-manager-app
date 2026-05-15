import 'reflect-metadata';
import type { CommandHandlerInterface } from '../command/command-handler.interface';

export function CommandHandler(handler: new (...args: unknown[]) => CommandHandlerInterface) {
  return (target: object) => {
    Reflect.defineMetadata('commandHandler', { handler }, target);
  };
}
