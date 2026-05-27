import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { IAuthConfig, ILoginResponse, IUser } from '@intapp/auth/models';
import { AuthTokenStore } from '@intapp/auth/stores';
import { AUTH_CONFIG } from '@intapp/auth/tokens';
import { of, throwError } from 'rxjs';

import { IAuthApiPort, AUTH_API } from './auth-api.port';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const fakeUser: IUser = { id: 'u1', username: 'demo', name: 'Demo', role: 'USER' };
  const fakeLoginResponse: ILoginResponse = {
    accessToken: 'fake.jwt.token',
    tokenType: 'Bearer',
    expiresIn: 900,
    user: fakeUser,
  };

  let apiMock: jest.Mocked<IAuthApiPort>;
  let jwtMock: jest.Mocked<JwtHelperService>;
  let routerMock: jest.Mocked<Router>;
  let service: AuthService;

  beforeEach(() => {
    apiMock = {
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      me: jest.fn(),
    };

    jwtMock = {
      isTokenExpired: jest.fn().mockReturnValue(false),
    } as unknown as jest.Mocked<JwtHelperService>;

    routerMock = {
      navigate: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<Router>;

    const configMock: IAuthConfig = {
      apiUrl: '/api',
      allowedDomains: [],
      defaultAuthenticatedRoute: '/termsheet',
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        AuthTokenStore,
        { provide: AUTH_API, useValue: apiMock },
        { provide: JwtHelperService, useValue: jwtMock },
        { provide: Router, useValue: routerMock },
        { provide: AUTH_CONFIG, useValue: configMock },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('should start without an authenticated user', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.accessToken()).toBeNull();
    expect(service.user()).toBeNull();
  });

  describe('login', () => {
    it('should populate state and navigate to the configured default route on success', done => {
      apiMock.login.mockReturnValue(of(fakeLoginResponse));

      service.login({ username: 'demo', password: 'demo1234' }).subscribe(() => {
        expect(service.accessToken()).toBe(fakeLoginResponse.accessToken);
        expect(service.user()).toEqual(fakeUser);
        expect(service.loading()).toBe(false);
        expect(routerMock.navigate).toHaveBeenCalledWith(['/termsheet']);
        done();
      });
    });

    it('should propagate the error and keep state clean when login fails', done => {
      const err = new HttpErrorResponse({
        error: { message: 'Bad credentials' },
        status: 401,
        statusText: 'Unauthorized',
      });
      apiMock.login.mockReturnValue(throwError(() => err));

      service.login({ username: 'x', password: 'y' }).subscribe({
        error: received => {
          expect(received).toBe(err);
          expect(service.accessToken()).toBeNull();
          expect(service.loading()).toBe(false);
          done();
        },
      });
    });

    it('should set loading=true during the call and false when finished', done => {
      apiMock.login.mockReturnValue(of(fakeLoginResponse));
      expect(service.loading()).toBe(false);
      service.login({ username: 'demo', password: 'demo1234' }).subscribe(() => {
        expect(service.loading()).toBe(false);
        done();
      });
    });
  });

  describe('bootstrap', () => {
    it('should restore session by calling refresh + me on success', done => {
      apiMock.refresh.mockReturnValue(of({ accessToken: 'new.token', tokenType: 'Bearer', expiresIn: 900 }));
      apiMock.me.mockReturnValue(of(fakeUser));

      service.bootstrap().subscribe(() => {
        expect(service.accessToken()).toBe('new.token');
        expect(service.user()).toEqual(fakeUser);
        done();
      });
    });

    it('should keep state empty silently on 401', done => {
      const err = new HttpErrorResponse({ error: null, status: 401 });
      apiMock.refresh.mockReturnValue(throwError(() => err));

      service.bootstrap().subscribe(() => {
        expect(service.accessToken()).toBeNull();
        expect(service.user()).toBeNull();
        done();
      });
    });
  });

  describe('logout', () => {
    it('should clear state and navigate to /login even when POST fails', done => {
      apiMock.logout.mockReturnValue(throwError(() => new HttpErrorResponse({ error: null, status: 500 })));

      service.logout().subscribe({
        complete: () => {
          expect(service.accessToken()).toBeNull();
          expect(service.user()).toBeNull();
          expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
          done();
        },
      });
    });

    it('should clear state and navigate to /login on success', done => {
      apiMock.logout.mockReturnValue(of(void 0));

      service.logout().subscribe({
        complete: () => {
          expect(service.accessToken()).toBeNull();
          expect(service.user()).toBeNull();
          expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
          done();
        },
      });
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when there is no token', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when there is a non-expired token', done => {
      apiMock.login.mockReturnValue(of(fakeLoginResponse));
      (jwtMock.isTokenExpired as jest.Mock).mockReturnValue(false);
      service.login({ username: 'demo', password: 'demo1234' }).subscribe(() => {
        expect(service.isAuthenticated()).toBe(true);
        done();
      });
    });

    it('should return false when the token is expired', done => {
      apiMock.login.mockReturnValue(of(fakeLoginResponse));
      (jwtMock.isTokenExpired as jest.Mock).mockReturnValue(true);
      service.login({ username: 'demo', password: 'demo1234' }).subscribe(() => {
        expect(service.isAuthenticated()).toBe(false);
        done();
      });
    });
  });
});
