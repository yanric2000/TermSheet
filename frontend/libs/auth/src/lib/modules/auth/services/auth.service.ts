import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ILoginRequest, IUser } from '@intapp/auth/models';
import { AuthTokenStore } from '@intapp/auth/stores';
import { AUTH_CONFIG } from '@intapp/auth/tokens';
import { Observable, catchError, of, switchMap, tap, throwError } from 'rxjs';

import { AUTH_API } from './auth-api.port';

/**
 * Service central de autenticação.
 *
 * Estado em memória apenas (signals nativos):
 *  - O accessToken vive em memória — nunca toca `localStorage`, minimiza superfície XSS.
 *  - O refresh token é gerenciado pelo backend como cookie HttpOnly (imune a XSS).
 *  - Em F5, `bootstrap()` tenta `/auth/refresh` (cookie automático) + `/auth/me`
 *    para recuperar sessão sem expor token ao JavaScript.
 *
 * Padrões:
 *  - `signal`/`computed` para reatividade idiomática Angular 17+
 *  - `asReadonly()` no que é exposto para fora (evita mutação externa)
 *  - `inject()` em field initializers (não constructor)
 *  - Métodos públicos retornam `Observable` para serem consumidos no UI
 *  - Consome o port `AUTH_API` em vez de uma classe concreta para manter o
 *    serviço desacoplado de HTTP — quem amarra port e adapter é `provideAuth()`.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(AUTH_API);
  private jwt = inject(JwtHelperService);
  private router = inject(Router);
  private config = inject(AUTH_CONFIG);
  private tokenStore = inject(AuthTokenStore);

  private _user = signal<IUser | null>(null);
  private _loading = signal(false);

  /**
   * Token JWT em memória, delegado ao `AuthTokenStore`.
   *
   * O storage do token vive em um service separado para quebrar o ciclo
   * de DI entre `AuthService` -> `JwtHelperService` -> `JWT_OPTIONS` ->
   * `AuthService`. Externamente, a API pública continua igual.
   */
  readonly accessToken = this.tokenStore.accessToken;
  /** Usuário atual hidratado a partir do payload de login ou de `/auth/me`. */
  readonly user = this._user.asReadonly();
  /** True durante login/logout/bootstrap. Usado para desabilitar o botão Entrar. */
  readonly loading = this._loading.asReadonly();

  /**
   * Computed reativo derivado do token. Evita armazenar duplicado.
   * `JwtHelperService.isTokenExpired` valida o claim `exp` do JWT.
   */
  readonly isAuthenticated = computed<boolean>(() => {
    const token = this.tokenStore.accessToken();
    if (!token) return false;
    try {
      return !this.jwt.isTokenExpired(token);
    } catch {
      return false;
    }
  });

  /**
   * Tenta recuperar sessão silenciosamente no boot da aplicação (F5).
   *
   * Se o cookie HttpOnly de refresh estiver válido, recebe novo `accessToken`
   * e popula o `user` via `/auth/me`. Qualquer falha resulta em estado vazio
   * (usuário será redirecionado para `/login` pelo `authGuard`).
   *
   * Retorna `Observable<void>` consumível pelo `APP_INITIALIZER`.
   */
  bootstrap(): Observable<unknown> {
    return this.api.refresh().pipe(
      tap(({ accessToken }) => this.tokenStore.set(accessToken)),
      switchMap(() => this.api.me()),
      tap(user => this._user.set(user)),
      catchError(() => {
        this.clearState();
        return of(null);
      }),
    );
  }

  /**
   * Autentica o usuário, popula state e navega para a rota padrão configurada.
   *
   * Side effects:
   *  - patcha `loading=true` antes; `loading=false` ao final (sucesso ou erro)
   *  - em sucesso: popula `accessToken`, `user`; navega
   *  - em erro: apenas `loading=false` (o toast é responsabilidade do
   *    `apiErrorToastInterceptor`)
   *
   * Por que `tap`+`catchError` em vez de `finalize`: o `finalize` é executado
   * no teardown da subscription — DEPOIS do `next`/`complete` chegarem ao
   * subscriber. Side effects observáveis (loading, navigate) precisam rodar
   * dentro do pipe para serem visíveis quando o caller recebe o resultado.
   */
  login(req: ILoginRequest): Observable<unknown> {
    this._loading.set(true);
    return this.api.login(req).pipe(
      tap(({ accessToken, user }) => {
        this.tokenStore.set(accessToken);
        this._user.set(user);
      }),
      switchMap(() => this.router.navigate([this.config.defaultAuthenticatedRoute ?? '/'])),
      tap(() => this._loading.set(false)),
      catchError((err: HttpErrorResponse) => {
        this._loading.set(false);
        return throwError(() => err);
      }),
    );
  }

  /**
   * Encerra a sessão: best-effort no servidor + cleanup local + redirect.
   *
   * Mesmo se a chamada HTTP falhar (rede caída, token expirado), o cleanup
   * local e o redirect sempre acontecem — usuário nunca fica preso.
   *
   * O `catchError` converte erros em `of(null)` para que o fluxo de
   * cleanup/redirect rode uniformemente nos dois caminhos via `tap`.
   */
  logout(): Observable<unknown> {
    this._loading.set(true);
    return this.api.logout().pipe(
      catchError((err: HttpErrorResponse) => {
        // status 0 (sem rede) e 401 (cookie já expirado/inválido) são cenários
        // esperados para um logout best-effort. Qualquer outro código indica
        // problema real no servidor — logamos para evitar regressões silenciosas
        // como a que tornava o endpoint inacessível por exigir Bearer.
        if (err.status !== 0 && err.status !== 401) {
          console.error('Falha inesperada no logout', err);
        }
        return of(null);
      }),
      tap(() => {
        this.clearState();
        this._loading.set(false);
        this.router.navigate(['/login']);
      }),
    );
  }

  private clearState(): void {
    this.tokenStore.clear();
    this._user.set(null);
  }
}
