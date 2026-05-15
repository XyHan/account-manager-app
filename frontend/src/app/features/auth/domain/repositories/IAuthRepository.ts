import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import type { UserView } from '../models/UserView';

export interface IAuthRepository {
  register(id: string, email: string, password: string): Observable<UserView>;
}

export const AUTH_REPOSITORY = new InjectionToken<IAuthRepository>('IAuthRepository');
