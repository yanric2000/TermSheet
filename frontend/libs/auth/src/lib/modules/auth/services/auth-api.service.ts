import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ILoginRequest, ILoginResponse, IRefreshResponse, IUser } from '@intapp/auth/models';
import { AUTH_CONFIG } from '@intapp/auth/tokens';
import { Observable } from 'rxjs';

import { IAuthApiPort } from './auth-api.port';

/**
 * Adapter HTTP que implementa `IAuthApiPort` falando com o backend Spring.
 *
 * O `provideAuth()` (raiz da lib) amarra `AUTH_API` → `AuthApiService`. O
 * `AuthService` só conhece o port, nunca esta classe.
 *
 * Decisões importantes:
 *  - `withCredentials: true` em login/refresh/logout — necessário para que o
 *    cookie HttpOnly `refresh_token` seja recebido (login) ou enviado
 *    (refresh/logout).
 *  - `me` não precisa de `withCredentials` (Bearer já é o suficiente). Mantemos
 *    o default. O `JwtInterceptor` do `@auth0/angular-jwt` anexa o Bearer
 *    automaticamente nas rotas permitidas.
 *  - SEM `providedIn: 'root'`: a única forma de obter uma instância é via o
 *    token `AUTH_API`, fechando a porta para imports diretos via classe.
 */
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
