import { Criterion } from '../../../_shared/domain/criteria/Criterion';
import { Email } from '../value-objects/Email';

export class WithEmail implements Criterion {
  private constructor(private readonly email: Email) {}

  static from(email: Email): WithEmail {
    return new WithEmail(email);
  }

  getValue(): string {
    return this.email.toString();
  }
}
