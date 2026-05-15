import { Criterion } from './Criterion';

export class Criteria {
  private constructor(private readonly criteria: Criterion[]) {}

  static empty(): Criteria {
    return new Criteria([]);
  }

  static fromArray(criteria: Criterion[]): Criteria {
    return new Criteria(criteria);
  }

  getCriterion<T extends Criterion>(
    criterionClass: { prototype: T },
  ): T | false {
    const found = this.criteria.find(
      (criterion) =>
        criterion instanceof (criterionClass as unknown as new () => T),
    );
    return found !== undefined ? (found as T) : false;
  }

  addCriterion(criterion: Criterion): Criteria {
    return new Criteria([...this.criteria, criterion]);
  }

  toArray(): Criterion[] {
    return [...this.criteria];
  }
}
