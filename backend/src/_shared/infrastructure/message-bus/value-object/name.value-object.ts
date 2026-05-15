export class Name {
  private constructor(public readonly value: string) {}

  static fromString(value: string): Name {
    if (!value || value.trim().length === 0) throw new Error('Name cannot be empty');
    return new Name(value);
  }
}
