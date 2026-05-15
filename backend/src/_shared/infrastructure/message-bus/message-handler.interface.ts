export interface MessageHandlerInterface {
  handle(message: unknown): unknown | Promise<unknown>;
}
