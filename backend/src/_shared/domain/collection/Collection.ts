export abstract class Collection<T extends { serialize(): object }> {
  protected constructor(protected readonly items: T[]) {}

  count(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  serialize(): object[] {
    return this.items.map((item) => item.serialize());
  }
}
