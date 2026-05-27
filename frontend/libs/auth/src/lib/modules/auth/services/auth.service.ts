import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ILoginRequest, IUser } from '@intapp/auth/models';
import { AuthTokenStore } from '@intapp/auth/stores';
import { AUTH_CONFIG } from '@intapp/auth/tokens';
import { Observable, catchError, of, switchMap, tap, throwError } from 'rxjs';

import { AUTH_API } from './auth-api.port';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(AUTH_API);
  private jwt = inject(JwtHelperService);
  private router = inject(Router);
  private config = inject(AUTH_CONFIG);
  private tokenStore = inject(AuthTokenStore);

  private _user = signal<IUser | null>(null);
  private _loading = signal(false);

  readonly accessToken = this.tokenStore.accessToken;
  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly isAuthenticated = computed<boolean>(() => {
    const token = this.tokenStore.accessToken();
    if (!token) return false;
    try {
      return !this.jwt.isTokenExpired(token);
    } catch {
      return false;
    }
  });

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

  logout(): Observable<unknown> {
    this._loading.set(true);
    return this.api.logout().pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status !== 0 && err.status !== 401) {
          console.error('Unexpected logout failure', err);
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
