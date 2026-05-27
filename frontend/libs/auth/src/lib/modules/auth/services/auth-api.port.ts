import { InjectionToken } from '@angular/core';
import { ILoginRequest, ILoginResponse, IRefreshResponse, IUser } from '@intapp/auth/models';
import { Observable } from 'rxjs';

export interface IAuthApiPort {
  login(req: ILoginRequest): Observable<ILoginResponse>;
  refresh(): Observable<IRefreshResponse>;
  logout(): Observable<void>;
  me(): Observable<IUser>;
}

export const AUTH_API = new InjectionToken<IAuthApiPort>('AUTH_API');
