import type { Observable } from 'rxjs';
import type { ICommand } from './ICommand';

export const COMMAND_BUS = Symbol('COMMAND_BUS');

export interface ICommandBus {
  execute(command: ICommand): Observable<unknown>;
}
