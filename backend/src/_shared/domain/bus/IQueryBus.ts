import type { Observable } from 'rxjs';
import type { IQuery } from './IQuery';

export const QUERY_BUS = Symbol('QUERY_BUS');

export interface IQueryBus {
  execute(query: IQuery): Observable<unknown>;
}
