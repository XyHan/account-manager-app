export class ImportResultView {
  private constructor(
    public readonly filename: string,
    public readonly format: string,
    public readonly addedCount: number,
    public readonly skippedCount: number,
  ) {}

  static from(filename: string, format: string, addedCount: number, skippedCount: number): ImportResultView {
    return new ImportResultView(filename, format, addedCount, skippedCount);
  }

  serialize(): object {
    return {
      filename: this.filename,
      format: this.format,
      addedCount: this.addedCount,
      skippedCount: this.skippedCount,
    };
  }
}
