import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ILoginRequest, ILoginResponse, IRefreshResponse, IUser } from '@intapp/auth/models';
import { AUTH_CONFIG } from '@intapp/auth/tokens';
import { Observable } from 'rxjs';

import { IAuthApiPort } from './auth-api.port';

@Injectable()
export class AuthApiService implements IAuthApiPort {
  private http = inject(HttpClient);
  private config = inject(AUTH_CONFIG);

  login(req: ILoginRequest): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>(`${this.config.apiUrl}/auth/login`, req, {
      withCredentials: true,
    });
  }

  refresh(): Observable<IRefreshResponse> {
    return this.http.post<IRefreshResponse>(`${this.config.apiUrl}/auth/refresh`, null, {
      withCredentials: true,
    });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.config.apiUrl}/auth/logout`, null, {
      withCredentials: true,
    });
  }

  me(): Observable<IUser> {
    return this.http.get<IUser>(`${this.config.apiUrl}/auth/me`);
  }
}
