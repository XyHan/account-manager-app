import 'reflect-metadata';
import type { QueryHandlerInterface } from '../query/query-handler.interface';

export function QueryHandler(handler: new (...args: unknown[]) => QueryHandlerInterface) {
  return (target: object) => {
    Reflect.defineMetadata('queryHandler', { handler }, target);
  };
}
