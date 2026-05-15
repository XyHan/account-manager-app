export class Version {
  private constructor(public readonly value: number) {}

  static fromNumber(value: number): Version {
    if (value <= 0) throw new Error('Version must be positive');
    return new Version(value);
  }
}
