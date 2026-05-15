import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import type { UserView } from '../../domain/models/UserView';
import { environment } from '../../../../../environments/environment';

@Injectable()
export class HttpAuthRepository implements IAuthRepository {
  private readonly http = inject(HttpClient);

  register(id: string, email: string, password: string): Observable<UserView> {
    return this.http.post<UserView>(`${environment.apiUrl}/auth/register`, { id, email, password });
  }
}
