import { InjectionToken } from '@angular/core';
import { ILoginRequest, ILoginResponse, IRefreshResponse, IUser } from '@intapp/auth/models';
import { Observable } from 'rxjs';

/**
 * Contrato (port) para o adapter HTTP de autenticação.
 *
 * O `AuthService` consome este contrato via DI sem conhecer a implementação
 * concreta — quem amarra `AUTH_API` à classe `AuthApiService` é o
 * `provideAuth()` na raiz da lib.
 *
 * Esse desacoplamento:
 *  - Mantém o serviço de domínio puro (não importa HttpClient diretamente),
 *    o que facilita testes (mock plain object satisfaz o port).
 *  - Abre caminho para uma implementação fake (útil para dev offline ou
 *    testes E2E sem backend) trocando apenas o binding em `provideAuth`.
 */
export interface IAuthApiPort {
  login(req: ILoginRequest): Observable<ILoginResponse>;
  refresh(): Observable<IRefreshResponse>;
  logout(): Observable<void>;
  me(): Observable<IUser>;
}

/**
 * Token de injeção do port. O bind para `AuthApiService` é feito em
 * `provideAuth()` — consumidores só conhecem este token.
 */
export const AUTH_API = new InjectionToken<IAuthApiPort>('AUTH_API');
