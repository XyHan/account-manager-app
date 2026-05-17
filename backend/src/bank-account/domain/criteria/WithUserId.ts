import type { Criterion } from '../../../_shared/domain/criteria/Criterion';

export class WithUserId implements Criterion {
  private constructor(private readonly userId: string) {}

  static from(userId: string): WithUserId {
    return new WithUserId(userId);
  }

  getValue(): string {
    return this.userId;
  }
}
