import type { MiddlewareInterface } from './middleware';

function* stack(middlewares: MiddlewareInterface[]): Generator<MiddlewareInterface> {
  for (let i = 0; i < middlewares.length; i++) {
    yield middlewares[i];
  }
}

export class MiddlewareStack implements Iterator<MiddlewareInterface> {
  private stack: Generator<MiddlewareInterface>;

  constructor(private readonly middlewares: MiddlewareInterface[]) {
    this.stack = stack(middlewares);
  }

  rewind(): void {
    this.stack = stack(this.middlewares);
  }

  next(): IteratorResult<MiddlewareInterface> {
    const next = this.stack.next();
    if (next.value === undefined) return { value: undefined as unknown as MiddlewareInterface, done: true };
    return next;
  }

  return?(value?: unknown): IteratorResult<MiddlewareInterface> {
    return this.stack.return(value as MiddlewareInterface);
  }

  throw?(e?: unknown): IteratorResult<MiddlewareInterface> {
    return this.stack.throw(e);
  }
}
