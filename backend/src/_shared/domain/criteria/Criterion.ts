export interface Criterion {
  getValue(): string | number | boolean | Record<string, string>;
}
