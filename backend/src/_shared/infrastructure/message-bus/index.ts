// Bridge (NestJS-injectable)
export { MessageBusModule } from './bridge/message-bus.module';
export { CommandBus } from './bridge/bus/command.bus';
export { QueryBus } from './bridge/bus/query.bus';
export { EventBus } from './bridge/bus/event.bus';

// Interfaces
export type { CommandInterface } from './command/command.interface';
export type { CommandHandlerInterface } from './command/command-handler.interface';
export type { QueryInterface } from './query/query.interface';
export type { QueryHandlerInterface } from './query/query-handler.interface';
export type { EventInterface } from './event/event.interface';
export type { EventHandlerInterface } from './event/event-handler.interface';
export type { MessageInterface } from './message.interface';
export type { MiddlewareInterface } from './middleware/middleware';

// Decorators
export { CommandHandler } from './decorator/command-handler.decorator';
export { QueryHandler } from './decorator/query-handler.decorator';
export { EventHandler } from './decorator/event-handler.decorator';
export { NoHandler } from './decorator/no-handler.decorator';

// Identifiers
export { CommandIdentifier } from './identifier/command.identifier';
export { QueryIdentifier } from './identifier/query.identifier';
export { EventIdentifier } from './identifier/event.identifier';

// Value objects
export { Name } from './value-object/name.value-object';
export { Version } from './value-object/version.value-object';
