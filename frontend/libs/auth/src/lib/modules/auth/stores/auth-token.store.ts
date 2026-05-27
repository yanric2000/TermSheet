import { Injectable, signal } from '@angular/core';

/**
 * Store mínimo que detém apenas o accessToken em memória.
 *
 * Existe como service separado do `AuthService` por dois motivos:
 *  1. Quebra os ciclos de DI envolvendo `JwtModule.forRoot()`. O `tokenGetter`
 *     do `JWT_OPTIONS` lê deste store em vez de injetar `AuthService` inteiro
 *     (que, por sua vez, depende transitivamente do `HttpClient`/`JwtInterceptor`
 *     que dependem do `JwtHelperService` que depende do `JWT_OPTIONS` — ciclo).
 *  2. Single Responsibility: storage do token tem zero lógica de negócio e
 *     zero dependências, o que o torna trivialmente testável e seguro.
 *
 * Token vive somente em memória (nunca toca `localStorage`), o que mantém a
 * superfície de XSS pequena. O refresh token continua sendo gerenciado pelo
 * backend como cookie HttpOnly.
 *
 * NÃO é exportado no barrel `libs/auth/src/index.ts` — é detalhe interno da lib.
 */
@Injectable({ providedIn: 'root' })
export class AuthTokenStore {
  private _accessToken = signal<string | null>(null);

  /** Token JWT atual; consumido por `JWT_OPTIONS.tokenGetter` e por `AuthService`. */
  readonly accessToken = this._accessToken.asReadonly();

  set(token: string | null): void {
    this._accessToken.set(token);
  }

  clear(): void {
    this._accessToken.set(null);
  }
}
